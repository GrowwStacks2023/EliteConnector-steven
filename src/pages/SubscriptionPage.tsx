import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createCheckoutSession } from '../services/stripeService';
import toast from 'react-hot-toast';

const PricingPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<string | null>(null);

  const creditPackages = [
    {
      name: 'Starter Pack',
      price: 29,
      credits: 40,
      priceId: 'price_1SpE2128nEEm4LkcE8EVaurU',
      popular: false,
      pricePerCredit: 0.73,
      features: [
        '40 Lead Credits',
        'Basic Support',
        'Valid for 90 days',
        'No subscription required'
      ],
      badge: null,
      bgColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-200',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      name: 'Professional',
      price: 50,
      credits: 75,
      priceId: 'price_1SpE2028nEEm4LkcshR1lzsB',
      popular: true,
      pricePerCredit: 0.67,
      features: [
        '75 Lead Credits',
        'Priority Support',
        'Valid for 180 days',
        'No subscription required',
        'Save 8% vs Starter'
      ],
      badge: 'Most Popular',
      bgColor: 'from-indigo-50 to-purple-50',
      borderColor: 'border-indigo-400',
      buttonColor: 'bg-indigo-600 hover:bg-indigo-700'
    },
    {
      name: 'Enterprise',
      price: 100,
      credits: 175,
      priceId: 'price_1SpE2028nEEm4Lkc123456789',
      popular: false,
      pricePerCredit: 0.57,
      features: [
        '175 Lead Credits',
        'Premium Support',
        'Valid for 365 days',
        'No subscription required',
        'Save 22% vs Starter',
        'Dedicated Account Manager'
      ],
      badge: 'Best Value',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      buttonColor: 'bg-purple-600 hover:bg-purple-700'
    },
  ];

  const handlePurchase = async (priceId: string, packageName: string) => {
  if (!isAuthenticated) {
    toast.error('Please log in to purchase credits');
    navigate('/login');
    return;
  }

  setLoading(priceId);

  try {
    console.log('🎯 Purchasing package:', packageName);
    
    const checkoutUrl = await createCheckoutSession(priceId);
    
    console.log('✅ Redirecting to Stripe Checkout...');
    // Redirect to Stripe checkout - payment success will redirect to /subscription/success
    window.location.href = checkoutUrl;
    
  } catch (error: any) {
    console.error('❌ Purchase error:', error);
    toast.error(error.message || 'Failed to create checkout session');
    setLoading(null);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-extrabold text-gray-900 mb-4">
            Credit Packages
          </h2>
          <p className="text-xl text-gray-600 mb-2">
            Purchase credits once, use them anytime
          </p>
          <p className="text-sm text-gray-500">
            No recurring charges • Credits never expire • Cancel anytime
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {creditPackages.map((pkg) => (
            <div
              key={pkg.priceId}
              className={`relative bg-gradient-to-br ${pkg.bgColor} rounded-3xl shadow-xl overflow-hidden border-2 ${pkg.borderColor} ${
                pkg.popular ? 'transform md:scale-105 shadow-2xl' : ''
              } transition-all hover:shadow-2xl`}
            >
              {/* Popular Badge */}
              {pkg.badge && (
                <div className="absolute top-0 right-0">
                  <div className={`${
                    pkg.popular ? 'bg-indigo-600' : 'bg-purple-600'
                  } text-white text-xs font-bold px-4 py-2 rounded-bl-xl rounded-tr-2xl`}>
                    {pkg.badge}
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Package Name */}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>

                {/* Credits Display */}
                <div className="mb-6">
                  <div className="flex items-baseline mb-2">
                    <span className="text-6xl font-extrabold text-indigo-600">
                      {pkg.credits}
                    </span>
                    <span className="text-2xl font-semibold text-gray-600 ml-2">
                      credits
                    </span>
                  </div>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">
                      ${pkg.price}
                    </span>
                    <span className="text-sm text-gray-500 ml-2">
                      (${pkg.pricePerCredit.toFixed(2)}/credit)
                    </span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Purchase Button */}
                <button
                  onClick={() => handlePurchase(pkg.priceId, pkg.name)}
                  disabled={loading === pkg.priceId}
                  className={`w-full ${pkg.buttonColor} text-white py-4 px-6 rounded-xl font-bold text-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
                >
                  {loading === pkg.priceId ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    'Purchase Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              How Credits Work
            </h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Purchase Credits</h4>
                <p className="text-sm text-gray-600">
                  Choose a package and buy credits instantly
                </p>
              </div>
              <div className="text-center">
                <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Use Anytime</h4>
                <p className="text-sm text-gray-600">
                  Apply credits to any lead you want to purchase
                </p>
              </div>
              <div className="text-center">
                <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">No Expiry</h4>
                <p className="text-sm text-gray-600">
                  Credits remain valid as per package terms
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            <details className="bg-white rounded-xl p-6 shadow-md">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                Can I buy multiple packages?
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Yes! You can purchase multiple credit packages, and all credits will be added to your account balance.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 shadow-md">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                What happens if I don't use all my credits?
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Credits remain in your account according to the validity period of each package. Enterprise credits are valid for 1 year.
              </p>
            </details>
            <details className="bg-white rounded-xl p-6 shadow-md">
              <summary className="font-semibold text-gray-900 cursor-pointer">
                How many credits does one lead cost?
              </summary>
              <p className="mt-3 text-gray-600 text-sm">
                Each qualified lead costs 1 credit. You can review lead details before deciding to use your credits.
              </p>
            </details>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;