import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType, Lead } from '../../types';
import { useLeads } from '../hooks/useLeads';
import { useLeadFilters } from '../hooks/useLeadFilters';
import { extractPostcodeArea } from '../utils/filters/postcodeFilter';

interface LeadsDashboardProps {
  user: User;
  cart: Lead[];
  onAddToCart: (lead: Lead) => void;
}

const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ user, cart, onAddToCart }) => {
  const { leads, loading, error } = useLeads();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const filteredLeads = useLeadFilters(leads, user, categoryFilter);

  const getCategoryIcon = (category: TradeType) => {
    switch (category) {
      case TradeType.PLUMBER: return '🚿';
      case TradeType.ELECTRICIAN: return '⚡';
      case TradeType.CARPENTER: return '🔨';
      case TradeType.PAINTER: return '🎨';
      default: return '🔧';
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading leads...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">❌</div>
          <p className="text-red-600 font-bold">{error}</p>
        </div>
      </div>
    );
  }

  const userPostcodeAreas = user.postcode_areas || [];

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Service Area Banner */}
        <div className="mb-10 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-xl shadow-indigo-100 overflow-hidden">
          <div className="bg-white rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">📍</div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 brand-font">Service Areas Active</h2>
                <p className="text-gray-500 font-medium">
                  {userPostcodeAreas.length > 0
                    ? `Showing leads in: ${userPostcodeAreas.slice(0, 5).join(', ')}${userPostcodeAreas.length > 5 ? ` +${userPostcodeAreas.length - 5} more` : ''}`
                    : 'No postcode areas selected'
                  }
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Manage Service Areas
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 brand-font">Lead Marketplace</h1>
            <p className="text-gray-500 mt-2 font-medium">
              Opportunities for {user.tradeTypes.join(', ')}
            </p>
          </div>
          <div className="mt-4 md:mt-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <span className="text-gray-500 font-medium">Your Balance:</span>
            <span className="text-2xl font-bold text-indigo-600">{user.credits || 0} Credits</span>
            <Link
              to="/subscription"
              className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              Top Up
            </Link>
          </div>
        </div>

        {/* Category Filters - Only Show User's Selected Trades */}
        <div className="flex overflow-x-auto pb-4 mb-8 space-x-3">
          {['All', ...user.tradeTypes].map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
                categoryFilter === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* No Postcode Areas Warning */}
        {userPostcodeAreas.length === 0 && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-2xl">
            <div className="flex items-start">
              <span className="text-amber-500 text-2xl mr-4">⚠️</span>
              <div>
                <h3 className="font-bold text-amber-900 mb-2">No Service Areas Selected</h3>
                <p className="text-amber-700 text-sm mb-4">
                  You haven't selected any postcode areas yet. Please select the areas you want to serve to see available leads.
                </p>
                <Link
                  to="/profile"
                  className="inline-block px-6 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all"
                >
                  Select Service Areas
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => {
              const postcodeArea = extractPostcodeArea(lead.zipcode);
              const isInCart = cart.find(item => item.id === lead.id);

              return (
                <div
                  key={lead.id}
                  className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col justify-between relative overflow-hidden group"
                >
                  {/* Postcode Area Badge */}
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest">
                    {postcodeArea}
                  </div>

                  <div>
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase">
                        {lead.serviceRequired}
                      </span>
                      <span className="text-gray-400 text-xs font-medium">{lead.postedDate}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {lead.clientName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center text-gray-500 text-sm mb-4">
                      <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-semibold">{lead.location}</span>
                      <span className="ml-2 text-indigo-600 font-bold">• {lead.zipcode}</span>
                    </div>

                    {/* Description - Hidden until purchased */}
                    <div className="mb-6 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <p className="text-gray-400 text-xs italic text-center">
                        🔒 Full project details available after purchase
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Budget
                      </span>
                      <span className="text-lg font-extrabold text-green-600">
                        {lead.budget_min ? `£${lead.budget_min}` : 'TBD'}
                      </span>
                    </div>
                    
                    {/* Add to Cart / In Cart Button */}
                    {isInCart ? (
                      <button
                        disabled
                        className="px-6 py-2.5 rounded-xl font-bold transition-all shadow-md bg-gray-300 text-gray-500 cursor-not-allowed"
                      >
                        ✓ In Cart
                      </button>
                    ) : (
                      <button
                        onClick={() => onAddToCart(lead)}
                        className="px-6 py-2.5 rounded-xl font-bold transition-all shadow-md bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-100 active:scale-95"
                      >
                        🛒 Add to Cart
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full py-20 bg-white rounded-[3rem] text-center border-2 border-dashed border-gray-100">
              <div className="text-5xl mb-6">🏜️</div>
              <p className="text-gray-600 font-bold text-xl mb-2">No leads found</p>
              <p className="text-gray-400 max-w-sm mx-auto font-medium mb-8">
                {userPostcodeAreas.length === 0
                  ? 'Select postcode areas in your profile to see available leads.'
                  : 'No leads match your current filters and selected postcode areas.'
                }
              </p>
              <Link
                to="/profile"
                className="inline-block px-8 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
              >
                {userPostcodeAreas.length === 0 ? 'Select Service Areas' : 'Manage Service Areas'}
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsDashboard;