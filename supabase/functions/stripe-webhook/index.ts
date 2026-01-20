import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

const creditMap: Record<string, { credits: number; tier: string }> = {
  "price_1SpE2128nEEm4LkcE8EVaurU": { credits: 40, tier: "tier_1" },
  "price_1SpE2028nEEm4LkcshR1lzsB": { credits: 75, tier: "tier_2" },
  "price_1SpE2028nEEm4Lkc123456789": { credits: 175, tier: "tier_3" },
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
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error("❌ Webhook signature verification failed:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }

  try {
    console.log("📨 Webhook event type:", event.type);

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("✅ Checkout completed:", session.id);

        const userId = session.metadata?.supabase_user_id;
        const priceId = session.metadata?.price_id;

        console.log("🔍 User ID:", userId);
        console.log("🔍 Price ID:", priceId);

        if (!userId || !priceId) {
          console.error("❌ Missing userId or priceId");
          return new Response(
            JSON.stringify({ error: "Missing required metadata" }),
            { status: 400 }
          );
        }

        const creditInfo = creditMap[priceId];
        if (!creditInfo) {
          console.error("❌ Unknown price ID:", priceId);
          return new Response(
            JSON.stringify({ error: "Unknown price ID" }),
            { status: 400 }
          );
        }

        console.log(`💳 Adding ${creditInfo.credits} credits to user ${userId}`);

        // Get current credits
        const { data: userData, error: fetchError } = await supabaseAdmin
          .from("user")
          .select("credits")
          .eq("id", userId)
          .single();

        if (fetchError) {
          console.error("❌ Error fetching user:", fetchError);
          throw fetchError;
        }

        const currentCredits = userData?.credits || 0;
        const newCredits = currentCredits + creditInfo.credits;

        // Update credits
        const { error: updateError } = await supabaseAdmin
          .from("user")
          .update({
            credits: newCredits,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId);

        if (updateError) {
          console.error("❌ Error updating credits:", updateError);
          throw updateError;
        }

        console.log(`✅ Credits updated. New total: ${newCredits}`);

        // Store subscription record
        const { error: purchaseError } = await supabaseAdmin
          .from("credit_purchases")
          .insert({
            user_id: userId,
            stripe_customer_id: session.customer as string,
            stripe_session_id: session.id,
            stripe_payment_intent_id: session.payment_intent as string,
            price_id: priceId,
            credits: creditInfo.credits,
            amount_paid: session.amount_total ? session.amount_total / 100 : 0,
            status: "completed",
          });

        if (purchaseError) {
          console.error("⚠️ Purchase record error:", purchaseError);
        } else {
          console.log("✅ Purchase record stored");
        }

        return new Response(
          JSON.stringify({ success: true, newCredits }),
          { status: 200 }
        );
      }

      case "invoice.payment_succeeded": {
        console.log("✅ Invoice payment succeeded");
        return new Response(JSON.stringify({ received: true }), { status: 200 });
      }

      default:
        console.log("ℹ️ Unhandled event type:", event.type);
        return new Response(JSON.stringify({ received: true }), { status: 200 });
    }
  } catch (err) {
    console.error("❌ Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});