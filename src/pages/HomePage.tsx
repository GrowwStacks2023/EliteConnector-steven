import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Shield, Users, TrendingUp, CheckCircle, Clock, Zap, Star, Award, ArrowRight, Building2, Hammer } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../../types';

const HomePage: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect CLIENT users to /client-home
  useEffect(() => {
    if (!loading && user?.role === UserRole.CLIENT) {
      navigate('/client-home');
    }
  }, [user, loading, navigate]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-indigo-900">
        <div className="text-white text-2xl font-bold">Loading...</div>
      </div>
    );
  }

  // If client, they will be redirected, but show loading meanwhile
  if (user?.role === UserRole.CLIENT) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 to-teal-900">
        <div className="text-white text-2xl font-bold">Redirecting...</div>
      </div>
    );
  }

  // Remove the CLIENT VIEW section since we're redirecting
  // SERVICE_PROVIDER/ADMIN VIEW - Show trade professional landing page
  if (user?.role === UserRole.SERVICE_PROVIDER || user?.role === UserRole.ADMIN) {
    return (
      <div className="overflow-hidden bg-white">
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full mb-6 animate-fade-in">
                  <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                  <span className="text-sm font-semibold text-white">Welcome back, {user.fullName || 'Professional'}</span>
                </div>
                
                <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in">
                  Connect with homeowners
                  <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                    ready to build
                  </span>
                </h1>
                
                <p className="text-xl text-gray-300 mb-8 leading-relaxed animate-fade-in">
                  Access verified homeowners who've submitted planning applications. Work within your service radius, get matched with serious prospects, and grow your trade business.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mb-10 animate-fade-in">
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white font-medium">Verified</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <MapPin className="w-5 h-5 text-blue-400" />
                    <span className="text-white font-medium">Radius-based</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="text-white font-medium">Limited access</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                  {user?.role === UserRole.SERVICE_PROVIDER ? (
                    <Link 
                      to="/dashboard"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1"
                    >
                      Browse Prospects
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  ) : (
                    <Link 
                      to="/admin"
                      className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1"
                    >
                      Admin Dashboard
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  )}
                </div>
              </div>

              <div className="hidden lg:block mt-12 lg:mt-0">
                <div className="relative animate-fade-in">
                  {/* Floating lead card */}
                  <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transform hover:scale-105 transition-all duration-300">
                    <div className="flex items-center justify-between mb-5">
                      <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">New Opportunity</span>
                      <span className="px-4 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">ACTIVE</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Two-Story Extension</h3>
                    <div className="space-y-3 text-sm text-gray-600 mb-5">
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                        <span className="font-semibold">SW19 4DN • 2.3 miles away</span>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <Clock className="w-5 h-5 mr-3 text-purple-500" />
                        <span className="font-semibold">Added 2 days ago</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mb-5 flex-wrap">
                      <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200">Extension</span>
                      <span className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200">Electrical</span>
                      <span className="px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-xl text-xs font-bold border border-orange-200">Plumbing</span>
                    </div>
                    <div className="pt-5 border-t-2 border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                            <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">+1</div>
                          </div>
                          <span className="text-sm text-gray-500 font-medium">1 of 3 quotes</span>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">£45</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
                  <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                { label: 'Active Prospects', value: '2,500+', icon: Building2, color: 'from-blue-500 to-indigo-600' },
                { label: 'Verified Contractors', value: '850+', icon: Shield, color: 'from-purple-500 to-pink-600' },
                { label: 'Avg. Response Time', value: '< 4hrs', icon: Clock, color: 'from-green-500 to-emerald-600' },
                { label: 'Success Rate', value: '87%', icon: TrendingUp, color: 'from-orange-500 to-red-600' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-white relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-purple-50/50"></div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-indigo-100 rounded-full mb-4">
                <Hammer className="w-4 h-4 text-indigo-600 mr-2" />
                <span className="text-sm font-bold text-indigo-700 uppercase tracking-wide">Simple Process</span>
              </div>
              <h2 className="text-5xl font-black text-gray-900 mb-6">How the marketplace works</h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                We source planning applications, verify homeowners, and connect them with qualified trade professionals
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-1 bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200"></div>
              
              {[
                { 
                  num: 1, 
                  title: 'We source prospects', 
                  desc: 'Monthly CSV imports capture homeowners who have submitted planning applications. Each record includes location data, project details, and planning references.',
                  icon: Building2,
                  gradient: 'from-blue-500 to-indigo-600',
                  bgGradient: 'from-blue-50 to-indigo-100'
                },
                { 
                  num: 2, 
                  title: 'Homeowners verify', 
                  desc: 'We send letters with QR codes to planning applicants. When they scan and verify their details, they select which trades they need, activating the lead for purchase.',
                  icon: CheckCircle,
                  gradient: 'from-purple-500 to-pink-600',
                  bgGradient: 'from-purple-50 to-pink-100'
                },
                { 
                  num: 3, 
                  title: 'You connect & quote', 
                  desc: 'Browse prospects within your service radius. Purchase leads in your trade category, and contact details sync directly to your GoHighLevel CRM to manage follow-ups.',
                  icon: Zap,
                  gradient: 'from-green-500 to-emerald-600',
                  bgGradient: 'from-green-50 to-emerald-100'
                }
              ].map((step, i) => (
                <div key={i} className="relative group">
                  <div className={`bg-gradient-to-br ${step.bgGradient} rounded-3xl p-8 h-full shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 border-2 border-white`}>
                    <div className={`w-16 h-16 bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center text-white font-black text-2xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                      {step.num}
                    </div>
                    <div className={`w-12 h-12 bg-white rounded-xl flex items-center justify-center mb-4 shadow-md`}>
                      <step.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">{step.title}</h3>
                    <p className="text-gray-700 leading-relaxed font-medium">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="py-24 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-20">
              <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-4 border border-white/20">
                <Star className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-bold text-white uppercase tracking-wide">Premium Features</span>
              </div>
              <h2 className="text-5xl font-black text-white mb-6">Built for trade professionals</h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">Fair access, verified prospects, and smart matching</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: MapPin, title: 'Radius-based filtering', desc: 'Set your service area in miles. Only see prospects within your coverage zone—no wasted time on distant projects.', color: 'blue' },
                { icon: Users, title: '3-quote limit per trade', desc: 'Each lead sells to max 3 contractors per trade category. Fair competition, better conversion rates, higher quality prospects.', color: 'purple' },
                { icon: Shield, title: 'Verified contractors only', desc: 'Upload insurance and qualifications for admin review. Only verified professionals can purchase leads and build trust.', color: 'green' },
                { icon: TrendingUp, title: 'GoHighLevel integration', desc: 'Purchased leads sync instantly to your GHL sub-account opportunities pipeline. Manage follow-ups in one place.', color: 'orange' },
                { icon: Clock, title: 'Smart basket locking', desc: 'Add leads to basket for 3-5 minute hold. Complete payment or lose the lock—prevents double-selling and ensures fairness.', color: 'red' },
                { icon: Award, title: 'Re-activation system', desc: 'If homeowner reports non-proceeding with a contractor, that slot reopens—but excludes the rejected contractor.', color: 'indigo' }
              ].map((feature, i) => (
                <div key={i} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/10 transition-all border border-white/10 hover:border-white/20 hover:shadow-2xl transform hover:-translate-y-2">
                  <div className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  // NOT LOGGED IN VIEW - Public landing page
  return (
    <div className="overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-indigo-500/20 backdrop-blur-sm border border-indigo-400/30 rounded-full mb-6 animate-fade-in">
                <Zap className="w-4 h-4 text-yellow-400 mr-2" />
                <span className="text-sm font-semibold text-white">Verified Planning Applications</span>
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-extrabold text-white leading-tight mb-6 animate-fade-in">
                Connect with homeowners
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mt-2">
                  ready to build
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed animate-fade-in">
                Access verified homeowners who've submitted planning applications. Work within your service radius, get matched with serious prospects, and grow your trade business.
              </p>
              
              <div className="flex flex-wrap items-center gap-4 mb-10 animate-fade-in">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-white font-medium">Verified</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <MapPin className="w-5 h-5 text-blue-400" />
                  <span className="text-white font-medium">Radius-based</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg border border-white/20">
                  <Users className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-medium">Limited access</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in">
                <Link 
                  to="/register"
                  className="group inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:-translate-y-1"
                >
                  Get Started
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/login"
                  className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/20 transition-all border-2 border-white/30"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="hidden lg:block mt-12 lg:mt-0">
              <div className="relative animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-center justify-between mb-5">
                    <span className="text-sm font-bold text-gray-500 uppercase tracking-wide">New Opportunity</span>
                    <span className="px-4 py-1.5 bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full text-xs font-bold shadow-lg">ACTIVE</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">Two-Story Extension</h3>
                  <div className="space-y-3 text-sm text-gray-600 mb-5">
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                      <MapPin className="w-5 h-5 mr-3 text-blue-500" />
                      <span className="font-semibold">SW19 4DN • 2.3 miles away</span>
                    </div>
                    <div className="flex items-center bg-gray-50 rounded-lg p-3">
                      <Clock className="w-5 h-5 mr-3 text-purple-500" />
                      <span className="font-semibold">Added 2 days ago</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mb-5 flex-wrap">
                    <span className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200">Extension</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-purple-50 to-purple-100 text-purple-700 rounded-xl text-xs font-bold border border-purple-200">Electrical</span>
                    <span className="px-4 py-2 bg-gradient-to-r from-orange-50 to-orange-100 text-orange-700 rounded-xl text-xs font-bold border border-orange-200">Plumbing</span>
                  </div>
                  <div className="pt-5 border-t-2 border-gray-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="flex -space-x-2">
                          <div className="w-8 h-8 rounded-full bg-indigo-200 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gray-300 border-2 border-white"></div>
                          <div className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-500">+1</div>
                        </div>
                        <span className="text-sm text-gray-500 font-medium">1 of 3 quotes</span>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">£45</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full opacity-30 blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full">
            <div className="w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          </div>
        </div>
        
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
            <Zap className="w-4 h-4 text-yellow-300 mr-2" />
            <span className="text-sm font-bold text-white uppercase tracking-wide">Start Growing Today</span>
          </div>
          <h2 className="text-5xl lg:text-6xl font-black mb-6">Ready to grow your trade business?</h2>
          <p className="text-2xl text-white/90 mb-12 leading-relaxed">
            Join verified contractors accessing homeowners with active planning applications. Set your radius, choose your trades, and start connecting with serious prospects today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register"
              className="group inline-flex items-center justify-center px-12 py-5 bg-white text-indigo-600 rounded-2xl font-black text-xl hover:bg-gray-50 transition-all shadow-2xl transform hover:-translate-y-1"
            >
              Create Account
              <ArrowRight className="ml-2 w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="inline-flex items-center justify-center px-12 py-5 bg-white/10 backdrop-blur-sm text-white rounded-2xl font-black text-xl hover:bg-white/20 transition-all border-2 border-white/30"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default HomePage;