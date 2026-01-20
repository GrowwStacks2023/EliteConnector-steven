import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    console.log("🚀 Function started");

    // Get the JWT token from Authorization header
    const authHeader = req.headers.get("Authorization");
    console.log("🔐 Auth header present:", !!authHeader);

    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    // Extract token (remove "Bearer " prefix if present)
    const token = authHeader.replace("Bearer ", "").trim();
    console.log("🎫 Token extracted (first 20 chars):", token.substring(0, 20));

    // Initialize Supabase Admin client (for JWT verification)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the JWT token and get user
    console.log("👤 Verifying JWT...");
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError) {
      console.error("❌ JWT verification failed:", userError.message);
      throw new Error(`Authentication failed: ${userError.message}`);
    }

    if (!user) {
      console.error("❌ No user found in JWT");
      throw new Error("No user found. Please log in.");
    }

    console.log("✅ User verified:", user.email);
    console.log("🆔 User ID:", user.id);

    // Get request body
    const body = await req.json();
    const { priceId } = body;

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    console.log("💳 Price ID:", priceId);

    // Check for existing Stripe customer
    const { data: existingCustomer, error: customerError } = await supabaseAdmin
      .from("customers")
      .select("stripe_customer_id")
      .eq("id", user.id)
      .maybeSingle();

    if (customerError) {
      console.error("❌ Customer lookup error:", customerError);
    }

    let customerId = existingCustomer?.stripe_customer_id;

    // Create customer if needed
    if (!customerId) {
      console.log("🆕 Creating Stripe customer for:", user.email);
      
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });

      customerId = stripeCustomer.id;
      console.log("✅ Stripe customer created:", customerId);

      // Store in database
      const { error: insertError } = await supabaseAdmin
        .from("customers")
        .insert({
          id: user.id,
          stripe_customer_id: customerId,
        });

      if (insertError) {
        console.error("⚠️ Failed to store customer in DB:", insertError.message);
        // Continue anyway since we have the Stripe customer ID
      }
    } else {
      console.log("✅ Using existing Stripe customer:", customerId);
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "http://localhost:3000";

const session = await stripe.checkout.sessions.create({
  customer: customerId,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: "payment",  
  success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/subscription`,
  metadata: { 
    supabase_user_id: user.id,
    price_id: priceId
  },
});
    console.log("✅ Checkout session created:", session.id);
    console.log("🔗 Checkout URL:", session.url);

    return new Response(
      JSON.stringify({ url: session.url }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("❌ Error:", error.message);
    console.error("📚 Error stack:", error.stack);

    return new Response(
      JSON.stringify({
        error: error.message || "An error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});