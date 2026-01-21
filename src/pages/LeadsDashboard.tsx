import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { TradeType, User } from '../../types';

// ---------- TYPES ----------
export interface Lead {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceRequired: TradeType;
  location: string;
  zipcode: string;
  description: string;
  budget_min: number | null;
  postedDate: string;
  price: number;
  timeframe?: string;
  images?: string[];
}

interface LeadsDashboardProps {
  user: User;
  cart: Lead[];
  onAddToCart: (lead: Lead) => void;
}

// ---------- TIMEFRAMES ----------
const TIMEFRAME_OPTIONS = [
  { value: 'immediate', label: '🔥 Immediate', shortLabel: 'Urgent' },
  { value: '7_days', label: '📅 Within 7 Days', shortLabel: '7 Days' },
  { value: '10_days', label: '📆 Within 10 Days', shortLabel: '10 Days' },
  { value: '30_days', label: '🗓️ Within 30 Days', shortLabel: '30 Days' },
  { value: '90_days', label: '📊 Within 90 Days', shortLabel: '90 Days' },
  { value: 'flexible', label: '⏰ Flexible', shortLabel: 'Flexible' }
];

// ---------- COMPONENT ----------
const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ user, cart, onAddToCart }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // ---------- INITIAL LOAD ----------
  useEffect(() => {
    const abortController = new AbortController();
    
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        
        const { data, error: queryError } = await supabase
          .from('client_jobs')
          .select(`
            *,
            client:user!client_id(
              full_name,
              email
            )
          `)
          .eq('status', 'open')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .abortSignal(abortController.signal);

        // Check if aborted
        if (abortController.signal.aborted) {
          return;
        }


        if (queryError) throw queryError;

        const formattedLeads: Lead[] = (data || []).map((job: any) => ({
          id: job.id,
          clientName: job.client?.full_name || 'Anonymous Client',
          clientEmail: job.client?.email || '',
          serviceRequired: job.category as TradeType,
          location: job.location,
          zipcode: job.zipcode,
          description: job.description,
          budget_min: job.budget,
          postedDate: new Date(job.created_at).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
          }),
          price: 5,
          timeframe: job.timeframe,
          images: job.images || []
        }));

        setLeads(formattedLeads);
      } catch (err: any) {
        // Ignore abort errors
        if (err.name === 'AbortError') {
          return;
        }
        
        setError(err.message || 'Failed to load leads');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, []); // Only run on mount

  // ---------- TAB VISIBILITY RELOAD ----------
  useEffect(() => {
    let visibilityAbortController: AbortController | null = null;

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        
        // Abort any previous request
        if (visibilityAbortController) {
          visibilityAbortController.abort();
        }
        
        visibilityAbortController = new AbortController();
        
        try {
          setLoading(true);
          setError(null);

          const { data, error: queryError } = await supabase
            .from('client_jobs')
            .select(`
              *,
              client:user!client_id(
                full_name,
                email
              )
            `)
            .eq('status', 'open')
            .eq('is_active', true)
            .order('created_at', { ascending: false })
            .abortSignal(visibilityAbortController.signal);

          if (visibilityAbortController.signal.aborted) {
            return;
          }

          if (queryError) throw queryError;

          const formattedLeads: Lead[] = (data || []).map((job: any) => ({
            id: job.id,
            clientName: job.client?.full_name || 'Anonymous Client',
            clientEmail: job.client?.email || '',
            serviceRequired: job.category as TradeType,
            location: job.location,
            zipcode: job.zipcode,
            description: job.description,
            budget_min: job.budget,
            postedDate: new Date(job.created_at).toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric'
            }),
            price: 5,
            timeframe: job.timeframe,
            images: job.images || []
          }));

          setLeads(formattedLeads);
        } catch (err: any) {
          if (err.name === 'AbortError') {
            return;
          }
          setError(err.message || 'Failed to reload leads');
        } finally {
          if (!visibilityAbortController?.signal.aborted) {
            setLoading(false);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (visibilityAbortController) {
        visibilityAbortController.abort();
      }
    };
  }, []);

  // ---------- HELPERS ----------
  const extractPostcodeArea = (fullPostcode: string): string => {
    if (!fullPostcode) return '';
    const cleaned = fullPostcode.trim().toUpperCase().replace(/\s+/g, '');
    const match = cleaned.match(/^([A-Z]+)/);
    return match ? match[1] : '';
  };

  const filterByTradeType = (leads: Lead[], tradeTypes: TradeType[]): Lead[] => {
    if (!tradeTypes || tradeTypes.length === 0) return leads;
    return leads.filter(lead => tradeTypes.includes(lead.serviceRequired));
  };

  const filterByPostcodeAreas = (leads: Lead[], postcodeAreas: string[] = []): Lead[] => {
    if (!postcodeAreas || postcodeAreas.length === 0) return [];
    return leads.filter(lead => postcodeAreas.includes(extractPostcodeArea(lead.zipcode)));
  };

  const getCategoryIcon = (category: TradeType) => {
    switch (category) {
      case TradeType.PLUMBER: return '🚿';
      case TradeType.ELECTRICIAN: return '⚡';
      case TradeType.CARPENTER: return '🔨';
      case TradeType.PAINTER: return '🎨';
      default: return '🔧';
    }
  };

  // ---------- FILTER LEADS ----------
  const filteredLeads = useMemo(() => {
    let filtered = leads;
    filtered = filterByTradeType(filtered, user.tradeTypes);

    if (categoryFilter !== 'All') {
      filtered = filtered.filter(lead => lead.serviceRequired === categoryFilter);
    }

    filtered = filterByPostcodeAreas(filtered, user.postcode_areas);

    return filtered;
  }, [leads, user, categoryFilter]);

  const userPostcodeAreas = user.postcode_areas || [];

  // ---------- RENDER ----------
  if (loading) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
        <p className="text-gray-600 font-medium">Loading leads...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">❌</div>
        <p className="text-red-600 font-bold">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700"
        >
          Refresh Page
        </button>
      </div>
    </div>
  );

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
                    : 'No postcode areas selected'}
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

        {/* Category Filters */}
        <div className="flex overflow-x-auto pb-4 mb-8 space-x-3">
          {['All', ...user.tradeTypes].map(category => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${categoryFilter === category
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
          {filteredLeads.length > 0 ? filteredLeads.map(lead => {
            const postcodeArea = extractPostcodeArea(lead.zipcode);
            const isInCart = cart.find(item => item.id === lead.id);

            return (
              <div key={lead.id} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col justify-between relative overflow-hidden group">

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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lead.clientName}</h3>

                  {/* Location */}
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-semibold">{lead.location}</span>
                    <span className="ml-2 text-indigo-600 font-bold">• {lead.zipcode}</span>
                  </div>

                  {/* Timeframe Badge */}
                  {lead.timeframe && (
                    <div className="mb-4">
                      <span className={`inline-block px-3 py-1.5 rounded-full text-xs font-bold ${lead.timeframe === 'immediate'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : lead.timeframe === '7_days'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : lead.timeframe === '10_days'
                            ? 'bg-yellow-100 text-yellow-700 border border-yellow-200'
                            : lead.timeframe === '30_days'
                              ? 'bg-blue-100 text-blue-700 border border-blue-200'
                              : 'bg-green-100 text-green-700 border border-green-200'
                        }`}>
                        {TIMEFRAME_OPTIONS.find(t => t.value === lead.timeframe)?.label || '⏰ Flexible'}
                      </span>
                    </div>
                  )}

                  {/* Images Indicator */}
                  {lead.images && lead.images.length > 0 && (
                    <div className="mb-4 p-3 bg-purple-50 rounded-xl border border-purple-100">
                      <p className="text-purple-700 text-xs font-bold text-center">
                        📷 {lead.images.length} Photo{lead.images.length > 1 ? 's' : ''} Available After Purchase
                      </p>
                    </div>
                  )}

                  {/* Description Placeholder */}
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
            )
          }) : (
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