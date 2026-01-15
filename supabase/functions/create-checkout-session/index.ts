import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1️⃣ Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // 2️⃣ Get the logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("No user found. Please log in.");
    }

    // 3️⃣ Parse the request body to get priceId
    const { priceId } = await req.json();

    if (!priceId) {
      throw new Error("Price ID is required.");
    }

    // 4️⃣ Check if the user already has a Stripe customer
    const { data: customer } = await supabase
      .from("customers")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .single();

    let customerId = customer?.stripe_customer_id;

    // 5️⃣ If the user doesn't have a Stripe customer, create one
    if (!customerId) {
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = stripeCustomer.id;

      // 6️⃣ Store the new Stripe customer ID in Supabase
      await supabase.from("customers").insert({
        id: user.id,
        stripe_customer_id: customerId,
      });
    }

    // 7️⃣ Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/dashboard?success=true`,
      cancel_url: `${req.headers.get("origin")}/pricing?canceled=true`,
      metadata: {
        user_id: user.id,
      },
    });

    // 8️⃣ Return the session URL
    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    // Log error for debugging
    console.error("Error:", error.message);

    // Handle Stripe-specific errors
    let errorMessage = "An error occurred while processing the request.";
    if (error instanceof Stripe.errors.StripeError) {
      errorMessage = "Stripe API error: " + error.message;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    // Return the error message to the client
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
