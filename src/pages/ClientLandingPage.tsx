import React from 'react';

const ClientLandingPage = ({ user = { fullName: 'John' } }) => {
  const handlePostJob = () => {
    console.log('Navigate to post job');
  };

  const handleViewDashboard = () => {
    console.log('Navigate to dashboard');
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20 backdrop-blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <div className="inline-block mb-6 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-sm font-bold shadow-lg">
              ✨ Always FREE to Post Jobs
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 mb-6">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user.fullName.split(' ')[0]}
              </span>
              ! 👋
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-3xl mx-auto mb-4 leading-relaxed">
              Post your home improvement jobs for free and receive quotes from verified, elite professionals.
            </p>
            
            <p className="text-lg text-emerald-600 font-bold mb-12">
              No fees. No charges. Post unlimited jobs anytime.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handlePostJob}
                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center">
                  Post Your Job Free
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <button
                onClick={handleViewDashboard}
                className="px-10 py-5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all"
              >
                View My Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-green-100 text-center transform hover:scale-105 transition-all">
            <div className="text-5xl font-extrabold text-green-600 mb-2">100%</div>
            <div className="text-gray-600 font-bold">Free Job Posting</div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 text-center transform hover:scale-105 transition-all">
            <div className="text-5xl font-extrabold text-indigo-600 mb-2">2,500+</div>
            <div className="text-gray-600 font-bold">Verified Professionals</div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-purple-100 text-center transform hover:scale-105 transition-all">
            <div className="text-5xl font-extrabold text-purple-600 mb-2">98%</div>
            <div className="text-gray-600 font-bold">Client Satisfaction</div>
          </div>
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-indigo-100 text-center transform hover:scale-105 transition-all">
            <div className="text-5xl font-extrabold text-indigo-600 mb-2">24hrs</div>
            <div className="text-gray-600 font-bold">Average Response Time</div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-4xl font-extrabold text-center text-gray-900 mb-4">
          How Elite Connector Works for You
        </h2>
        <p className="text-center text-gray-600 font-medium text-lg mb-16 max-w-2xl mx-auto">
          Post your job for free and get matched with elite professionals in three simple steps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                1
              </div>
              <div className="text-6xl mb-6 mt-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Your Job Free</h3>
              <p className="text-gray-600 leading-relaxed mb-4">
                Describe your home improvement project, timeline, and requirements. No credit card needed, no hidden fees.
              </p>
              <div className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-bold">
                Always Free
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                2
              </div>
              <div className="text-6xl mb-6 mt-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Receive Free Quotes</h3>
              <p className="text-gray-600 leading-relaxed">
                Professionals in your area will review your job and submit quotes. Compare profiles, ratings, portfolios, and pricing at your convenience.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                3
              </div>
              <div className="text-6xl mb-6 mt-4">✅</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Choose & Connect</h3>
              <p className="text-gray-600 leading-relaxed">
                Review all quotes received, select your preferred professional, and get their contact details instantly to start your project.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Why Free Section */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 py-20">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">
              Why Is Posting Free?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We believe homeowners should connect with professionals without barriers. You'll never pay to post a job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Hidden Costs</h3>
                  <p className="text-gray-600">Post unlimited jobs, receive unlimited quotes. No subscription fees, no listing charges, no surprises.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">⚡</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Matching</h3>
                  <p className="text-gray-600">Your job is instantly visible to verified professionals in your area who match your trade requirements.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🎯</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Compare & Choose</h3>
                  <p className="text-gray-600">Review multiple quotes side-by-side and select the professional that best fits your needs and budget.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-green-100">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🤝</div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">You're in Control</h3>
                  <p className="text-gray-600">Review quotes at your pace, choose who to work with—all for free.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-white mb-4">
            What You Get With Elite Connector
          </h2>
          <p className="text-center text-indigo-100 font-medium text-lg mb-16">
            Premium features at no cost to you
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">Verified Pros Only</h3>
              <p className="text-indigo-100 text-sm">All professionals undergo rigorous background checks and credential verification before joining.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-white mb-2">Top-Rated Experts</h3>
              <p className="text-indigo-100 text-sm">Access to professionals with proven track records and excellent client reviews.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-2">Insured Work</h3>
              <p className="text-indigo-100 text-sm">All professionals carry public liability insurance for your complete peace of mind.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[3rem] p-12 sm:p-16 text-center shadow-2xl">
          <div className="inline-block mb-6 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-base font-bold shadow-lg">
            💯 Free Forever - No Credit Card Required
          </div>
          
          <h2 className="text-4xl font-extrabold text-white mb-6">
            Ready to Post Your First Job?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied homeowners who found their perfect professional on Elite Connector. Completely free, forever.
          </p>
          <button
            onClick={handlePostJob}
            className="px-12 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Post Your Job Free Now
          </button>
          
          <div className="mt-8 flex items-center justify-center gap-8 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Fees
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              No Sign-Up Cost
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Unlimited Jobs
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientLandingPage;