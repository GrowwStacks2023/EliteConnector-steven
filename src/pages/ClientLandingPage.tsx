import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User } from '../../types';

interface ClientLandingPageProps {
  user: User;
}

const ClientLandingPage: React.FC<ClientLandingPageProps> = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-100/20 to-purple-100/20 backdrop-blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-gray-900 brand-font mb-6">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {user.fullName.split(' ')[0]}
              </span>
              ! 👋
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
              Connect with verified, elite professionals who are ready to bring your job to life.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={() => navigate('/post-project')}
                className="group relative px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-indigo-200 hover:shadow-3xl hover:scale-105 transition-all duration-300"
              >
                <span className="relative z-10 flex items-center">
                  Post Your Job Now
                  <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
              </button>
              
              <Link
                to="/dashboard"
                className="px-10 py-5 bg-white border-2 border-indigo-200 text-indigo-700 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl hover:border-indigo-300 transition-all"
              >
                View My Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
        <h2 className="text-4xl font-extrabold text-center text-gray-900 brand-font mb-4">
          How Elite Connector Works
        </h2>
        <p className="text-center text-gray-600 font-medium text-lg mb-16 max-w-2xl mx-auto">
          Get matched with elite professionals in three simple steps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="relative">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                1
              </div>
              <div className="text-6xl mb-6 mt-4">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Post Your Job</h3>
              <p className="text-gray-600 leading-relaxed">
                Describe your job requirements, timeline, and budget. Our platform instantly connects you with relevant professionals.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative">
            <div className="bg-white rounded-[2.5rem] p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-all h-full">
              <div className="absolute -top-6 -left-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-extrabold shadow-lg">
                2
              </div>
              <div className="text-6xl mb-6 mt-4">💼</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Review Proposals</h3>
              <p className="text-gray-600 leading-relaxed">
                Receive interest from verified professionals. Review their profiles, ratings, portfolios, and quotes before making a decision.
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
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Hire & Collaborate</h3>
              <p className="text-gray-600 leading-relaxed">
                Accept the best professional for your needs. Get their contact details instantly and start your job with confidence.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-extrabold text-center text-white brand-font mb-4">
            Why Choose Elite Connector?
          </h2>
          <p className="text-center text-indigo-100 font-medium text-lg mb-16">
            Premium features that set us apart
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-white mb-2">100% Verified</h3>
              <p className="text-indigo-100 text-sm">All professionals undergo rigorous background checks and credential verification.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-white mb-2">Top-Rated Pros</h3>
              <p className="text-indigo-100 text-sm">Access to professionals with 4.5+ star ratings and proven track records.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold text-white mb-2">Direct Contact</h3>
              <p className="text-indigo-100 text-sm">No middlemen. Get direct contact details once you accept a professional.</p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold text-white mb-2">Insured Work</h3>
              <p className="text-indigo-100 text-sm">All professionals carry public liability insurance for your peace of mind.</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-[3rem] p-12 sm:p-16 text-center shadow-2xl">
          <h2 className="text-4xl font-extrabold text-white brand-font mb-6">
            Ready to Start Your Job?
          </h2>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Join thousands of satisfied clients who found their perfect professional on Elite Connector.
          </p>
          <button
            onClick={() => navigate('/post-project')}
            className="px-12 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-bold text-xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
          >
            Post Your First Job Free
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientLandingPage;