import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType } from '../../types';
import { useLeads } from '../hooks/useLeads';
import { useLeadFilters } from '../hooks/useLeadFilters';

interface LeadsDashboardProps {
  user: User;
}

const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ user }) => {
  const { leads, loading, error } = useLeads();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  const filteredLeads = useLeadFilters(leads, user, categoryFilter);

  const getCategoryIcon = (category: TradeType) => {
    switch (category) {
      case TradeType.PLUMBER: return '🚿';
      case TradeType.ELECTRICIAN: return '⚡';
      case TradeType.CARPENTER: return '🔨';
      case TradeType.PAINTER: return '🎨';
      // case TradeType.ROOFER: return '🏠';
      // case TradeType.LANDSCAPER: return '🌳';
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

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Service Area Banner */}
        <div className="mb-10 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-xl shadow-indigo-100 overflow-hidden">
          <div className="bg-white rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">📍</div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 brand-font">Local Service Area Active</h2>
                <p className="text-gray-500 font-medium">
                  Showing leads within {user.operatingRadius || 10} miles
                </p>
              </div>
            </div>
            <Link
              to="/profile"
              className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Adjust Service Area
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

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 mb-8 space-x-3">
          {['All', ...Object.values(TradeType)].map(category => (
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

        {/* Leads Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLeads.length > 0 ? (
            filteredLeads.map(lead => (
              <div
                key={lead.id}
                className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col justify-between relative overflow-hidden group"
              >
                {/* Ultra Local Badge */}
                {lead.calculatedDistance !== null && lead.calculatedDistance < 5 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest">
                    Ultra Local
                  </div>
                )}

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
                    {lead.calculatedDistance !== null && (
                      <span className="ml-2 text-indigo-600 font-bold">
                        • {lead.calculatedDistance.toFixed(1)} miles away
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                    {lead.description}
                  </p>
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
                  <button
                    className="px-6 py-2.5 rounded-xl font-bold transition-all shadow-md bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-100"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-[3rem] text-center border-2 border-dashed border-gray-100">
              <div className="text-5xl mb-6">🏜️</div>
              <p className="text-gray-600 font-bold text-xl mb-2">No leads found</p>
              <p className="text-gray-400 max-w-sm mx-auto font-medium mb-8">
                No leads match your current filters and service area. Try adjusting your radius.
              </p>
              <Link
                to="/profile"
                className="inline-block px-8 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
              >
                Expand Service Radius
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsDashboard;