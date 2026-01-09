import React, { useState, useEffect } from 'react';
import { TradeType } from '../../types';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';

interface ServiceProvider {
  id: string;
  full_name: string;
  email: string;
  serviceType: string; // comma-separated trade types
  experience: string;
  rating?: number;
  completed_jobs?: number;
}

interface TradeCardProps {
  id: string;
  name: string;
  tradeTypes: TradeType[];
  rating: number;
  completedJobs: number;
  experience: string;
}

const TradeCard: React.FC<TradeCardProps> = ({ id, name, tradeTypes, rating, completedJobs, experience }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-lg transition-all">
    <div className="flex items-center space-x-4 mb-4">
      <div className="w-16 h-16 bg-pastel-blue rounded-2xl flex items-center justify-center text-2xl font-bold text-indigo-700 uppercase">
        {name.charAt(0)}
      </div>
      <div className="flex-1">
        <h3 className="font-bold text-lg text-gray-900 truncate">{name}</h3>
        <div className="flex flex-wrap gap-1 mt-1">
          {tradeTypes.slice(0, 2).map((type, idx) => (
            <span key={idx} className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded">
              {type}
            </span>
          ))}
          {tradeTypes.length > 2 && (
            <span className="text-xs text-gray-500 font-semibold">+{tradeTypes.length - 2}</span>
          )}
        </div>
      </div>
    </div>
    <div className="space-y-3 mb-6">
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">Experience</span>
        <span className="text-gray-900 font-bold">{experience}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">Rating</span>
        <div className="flex items-center text-yellow-500 font-bold">
          ★ {rating.toFixed(1)}
        </div>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400 font-medium">Completed Jobs</span>
        <span className="text-gray-900 font-bold">{completedJobs}</span>
      </div>
    </div>
    <Link 
      to={`/trade-profile/${id}`}
      className="block w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all text-center"
    >
      View Profile
    </Link>
  </div>
);

const BrowseTradesPage: React.FC = () => {
  const [filter, setFilter] = useState<string>('All');
  const [serviceProviders, setServiceProviders] = useState<TradeCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableTradeTypes, setAvailableTradeTypes] = useState<TradeType[]>([]);

  useEffect(() => {
    fetchServiceProviders();
  }, []);

  const fetchServiceProviders = async () => {
    try {
      setLoading(true);

      // Fetch all active service providers with complete profiles
      const { data, error } = await supabase
        .from('user')
        .select('id, full_name, email, serviceType, experience')
        .eq('role', 'SERVICE_PROVIDER')
        .eq('is_active', true)
        .not('serviceType', 'is', null)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to TradeCardProps format
      const mappedProviders: TradeCardProps[] = (data || []).map(provider => {
        const tradeTypes = provider.serviceType
          ? provider.serviceType.split(',').filter((t: string) => t.trim() !== '') as TradeType[]
          : [];

        return {
          id: provider.id,
          name: provider.full_name,
          tradeTypes: tradeTypes,
          rating: 5.0, // Default rating (you can add a rating field to your DB later)
          completedJobs: 0, // Default (you can add this field to your DB later)
          experience: provider.experience || 'N/A'
        };
      });

      setServiceProviders(mappedProviders);

      // Extract all unique trade types from service providers
      const allTradeTypes = new Set<TradeType>();
      mappedProviders.forEach(provider => {
        provider.tradeTypes.forEach(type => allTradeTypes.add(type));
      });

      setAvailableTradeTypes(Array.from(allTradeTypes).sort());

    } catch (err: any) {
      console.error('❌ Error fetching service providers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter providers based on selected trade type
  const filteredProviders = filter === 'All' 
    ? serviceProviders 
    : serviceProviders.filter(provider => provider.tradeTypes.includes(filter as TradeType));

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading professionals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Elite Trade Professionals</h1>
          <p className="text-gray-500 font-medium">Browse our verified service providers.</p>
          {serviceProviders.length > 0 && (
            <p className="text-gray-400 text-sm mt-2">
              {serviceProviders.length} professional{serviceProviders.length !== 1 ? 's' : ''} available
            </p>
          )}
        </div>

        {/* Trade Type Filters - Only show types that have providers */}
        {availableTradeTypes.length > 0 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            <button
              onClick={() => setFilter('All')}
              className={`px-6 py-2 rounded-full font-bold transition-all ${
                filter === 'All' 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
              }`}
            >
              All ({serviceProviders.length})
            </button>
            {availableTradeTypes.map(type => {
              const count = serviceProviders.filter(p => p.tradeTypes.includes(type)).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-6 py-2 rounded-full font-bold transition-all ${
                    filter === type 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-white text-gray-500 border border-gray-100 hover:border-gray-200'
                  }`}
                >
                  {type} ({count})
                </button>
              );
            })}
          </div>
        )}

        {/* Service Providers Grid */}
        {filteredProviders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProviders.map((provider) => (
              <TradeCard key={provider.id} {...provider} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100">
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {filter === 'All' ? 'No Professionals Yet' : `No ${filter} Professionals Yet`}
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === 'All' 
                ? 'Be the first to join our marketplace as a verified service provider.'
                : `No ${filter} professionals have registered yet. Check back soon!`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BrowseTradesPage;