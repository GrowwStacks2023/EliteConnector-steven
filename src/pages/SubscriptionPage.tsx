
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SubscriptionTier } from '../../types';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();

const handleSubscribe = async (tier: string) => {
  try {
    // 1️⃣ Check logged-in user
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      Swal.fire({
        title: 'Login required',
        text: 'Please log in to subscribe',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    // 2️⃣ Map tiers → Stripe prices
    const priceIds = {
      [SubscriptionTier.TIER1]: 'price_1SpE2028nEEm4LkcaW2SYnlL',
      [SubscriptionTier.TIER2]: 'price_1SpE2028nEEm4LkcshR1lzsB',
      [SubscriptionTier.TIER3]: 'price_1SpE1z28nEEm4LkcCdN7xBrI',
    };

    const priceId = priceIds[tier as SubscriptionTier];
    if (!priceId) throw new Error('Invalid tier selected');

    // 3️⃣ Call Edge Function WITH AUTH
    const { data, error } = await supabase.functions.invoke(
      'create-checkout-session',
      {
        body: { priceId },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      }
    );

    if (error) throw error;

    if (data?.url) {
      window.location.href = data.url;
    }
  } catch (error: any) {
    Swal.fire({
      title: 'Error',
      text: error.message || 'Failed to create checkout session',
      icon: 'error',
      confirmButtonColor: '#4f46e5'
    });
  }
};

  const tiers = [
    {
      name: SubscriptionTier.TIER1,
      price: "862.37",
      period: "/month",
      description: "Perfect for sole traders starting their journey.",
      features: [
        "Access to 5 Premium Leads",
        "Standard Email Support",
        "Basic Elite Connector Sync",
        "Lead Marketplace Access"
      ],
      color: "bg-white",
      textColor: "text-black",
      buttonColor: "bg-gray-900 text-white",
      highlight: false
    },
    {
      name: SubscriptionTier.TIER2,
      price: "2388",
      period: "/month",
      description: "The professional choice for growing businesses.",
      features: [
        "Access to 20 Premium Leads",
        "Priority Support",
        "Advanced Elite Connector Integration",
        "Verified Pro Badge",
        "Multi-Trade Access"
      ],
      color: "bg-indigo-600 text-white",
      textColor: "text-white",
      buttonColor: "bg-white text-indigo-600",
      highlight: true
    },
    {
      name: SubscriptionTier.TIER3,
      price: "199",
      period: "/month",
      description: "Scale your empire with unlimited possibilities.",
      features: [
        "Unlimited Lead Access",
        "Dedicated Account Manager",
        "Custom Workflow Sync",
        "Early Access to Hot Leads",
        "White-label GHL Features",
        "Unlimited Team Members"
      ],
      color: "bg-white",
      textColor: "text-black",
      buttonColor: "bg-gray-900 text-white",
      highlight: false
    }
  ];

  return (
    <div className="bg-indigo-50/50 min-h-screen py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center text-indigo-600 font-bold hover:underline group"
          >
            <svg className="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </button>
        </div>

        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 brand-font mb-4">Choose Your Growth Path</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-medium">
            Unlock exclusive leads and powerful automation tools designed for top-tier tradespeople.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {tiers.map((tier, idx) => (
            <div 
              key={idx} 
              className={`relative rounded-[3rem] p-10 shadow-2xl transition-all hover:-translate-y-2 border border-gray-100 flex flex-col ${tier.color} ${tier.textColor} ${tier.highlight ? 'ring-4 ring-indigo-200 scale-105 z-10' : 'z-0'}`}
            >
              {tier.highlight && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-indigo-500 text-white px-6 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-2 brand-font">{tier.name}</h3>
                <p className={`${tier.highlight ? 'text-indigo-100' : 'text-black'} text-sm font-medium mb-6 h-10`}>
                  {tier.description}
                </p>
                <div className="flex items-baseline">
                  <span className="text-4xl font-extrabold">{tier.price}</span>
                  <span className={`ml-1 text-sm font-bold ${tier.highlight ? 'text-indigo-200' : 'text-gray-400'}`}>
                    {tier.period}
                  </span>
                </div>
              </div>

              <div className="flex-grow mb-10">
                <ul className="space-y-4">
                  {tier.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start">
                      <svg className={`w-5 h-5 mr-3 mt-0.5 ${tier.highlight ? 'text-indigo-300' : 'text-indigo-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm font-bold">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button 
                onClick={() => handleSubscribe(tier.name)}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all hover:opacity-90 active:scale-[0.98] ${tier.buttonColor}`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <p className="text-gray-500 font-medium">
            Need a custom enterprise solution for a large trade network? 
            <a href="#" className="text-indigo-600 font-bold ml-1 hover:underline">Contact our Sales Team</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionPage;
