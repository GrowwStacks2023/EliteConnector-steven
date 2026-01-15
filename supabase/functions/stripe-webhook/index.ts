import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

// Map Stripe price IDs to tiers and credits
const PRICE_CONFIG: Record<string, { tier: string; credits: number }> = {
  "price_1SpE2028nEEm4LkcaW2SYnlL": { tier: "tier_1", credits: 49 },   // Replace with your actual price IDs
  "price_1SpE2028nEEm4LkcshR1lzsB": { tier: "tier_2", credits: 99 },
  "price_1SpE1z28nEEm4LkcCdN7xBrI": { tier: "tier_3", credits: 199 },
};

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
      undefined,
      cryptoProvider
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        );

        const priceId = subscription.items.data[0].price.id;
        const config = PRICE_CONFIG[priceId];

        if (!config) {
          throw new Error(`Unknown price ID: ${priceId}`);
        }

        await supabase.from("subscriptions").upsert({
          user_id: session.metadata?.user_id,
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer as string,
          status: subscription.status,
          tier: config.tier,
          price_id: priceId,
          credits: config.credits,
          used_credits: 0,
          current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          cancel_at_period_end: subscription.cancel_at_period_end,
        });
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0].price.id;
        const config = PRICE_CONFIG[priceId];

        if (!config) {
          throw new Error(`Unknown price ID: ${priceId}`);
        }

        // Get current subscription to check if billing period changed
        const { data: currentSub } = await supabase
          .from("subscriptions")
          .select("current_period_end")
          .eq("stripe_subscription_id", subscription.id)
          .single();

        const newPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();
        const periodChanged = currentSub?.current_period_end !== newPeriodEnd;

        await supabase
          .from("subscriptions")
          .update({
            status: subscription.status,
            tier: config.tier,
            price_id: priceId,
            credits: config.credits,
            used_credits: periodChanged ? 0 : undefined, // Reset credits if new billing period
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: newPeriodEnd,
            cancel_at_period_end: subscription.cancel_at_period_end,
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        
        await supabase
          .from("subscriptions")
          .update({
            status: "past_due",
            updated_at: new Date().toISOString(),
          })
          .eq("stripe_subscription_id", invoice.subscription as string);
        break;
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  }
});