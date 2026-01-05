import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { User, Lead, TradeType } from '../../types';

interface LeadsDashboardProps {
  user: User;
  cart: Lead[];
  onAddToCart: (lead: Lead) => void;
}

// Mock Coordinate Map for UK Cities to demonstrate radius logic
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  'london': { lat: 51.5074, lng: -0.1278 },
  'manchester': { lat: 53.4808, lng: -2.2426 },
  'birmingham': { lat: 52.4862, lng: -1.8904 },
  'edinburgh': { lat: 55.9533, lng: -3.1883 },
  'cardiff': { lat: 51.4816, lng: -3.1791 }
};

const MOCK_LEADS: Lead[] = [
  { id: 'l-1', clientName: 'Alice Johnson', serviceRequired: TradeType.PLUMBER, description: 'Fixing a leaking pipe in the kitchen and bathroom inspection.', location: 'Manchester, UK', postedDate: '2 hours ago', price: 1, purchasedBy: [], purchasedByTradeTypes: [] },
  { id: 'l-2', clientName: 'Bob Smith', serviceRequired: TradeType.ELECTRICIAN, description: 'Full rewiring for a 3-bedroom semi-detached house.', location: 'London, UK', postedDate: '1 day ago', price: 2, purchasedBy: [], purchasedByTradeTypes: [] },
  { id: 'l-3', clientName: 'Sarah Connor', serviceRequired: TradeType.PLASTERER, description: 'Plastering living room ceiling and one wall.', location: 'Birmingham, UK', postedDate: '4 hours ago', price: 1, purchasedBy: [], purchasedByTradeTypes: [] },
  { id: 'l-4', clientName: 'David Tennant', serviceRequired: TradeType.PLUMBER, description: 'New boiler installation and old radiator disposal.', location: 'Edinburgh, UK', postedDate: '6 hours ago', price: 3, purchasedBy: [], purchasedByTradeTypes: [] },
  { id: 'l-5', clientName: 'Rose Tyler', serviceRequired: TradeType.ELECTRICIAN, description: 'Outdoor security light installation and garden power sockets.', location: 'Cardiff, UK', postedDate: '3 hours ago', price: 1, purchasedBy: [], purchasedByTradeTypes: [] },
  { id: 'l-6', clientName: 'Peter Parker', serviceRequired: TradeType.PLUMBER, description: 'Leaking radiator in the bedroom.', location: 'London, UK', postedDate: '10 mins ago', price: 1, purchasedBy: [], purchasedByTradeTypes: [] }
];

const LeadsDashboard: React.FC<LeadsDashboardProps> = ({ user, cart, onAddToCart }) => {
  const [leads] = useState<Lead[]>(MOCK_LEADS);
  const [filter, setFilter] = useState<string>('All');

  // Helper: Haversine distance calculation (in miles)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Radius of Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const getCityFromAddress = (address: string): string => {
    const addr = address.toLowerCase();
    for (const city in CITY_COORDS) {
      if (addr.includes(city)) return city;
    }
    return '';
  };

  const visibleLeadsWithDistance = useMemo(() => {
    const now = Date.now();
    const userCity = getCityFromAddress(user.address || '');
    const userCoords = CITY_COORDS[userCity];
    const abandonedIds = user.abandonedLeadIds || [];
    const declinedIds = user.declinedLeadIds || []; // Get list of leads where user was declined

    return leads.map(lead => {
      const leadCity = getCityFromAddress(lead.location);
      const leadCoords = CITY_COORDS[leadCity];
      let distance: number | null = null;

      if (userCoords && leadCoords) {
        distance = calculateDistance(userCoords.lat, userCoords.lng, leadCoords.lat, leadCoords.lng);
      }

      return { ...lead, calculatedDistance: distance };
    }).filter(lead => {
      // RULE: Hide leads where the user has been DECLINED by the client
      if (declinedIds.includes(lead.id)) return false;

      // Rule 0: Anti-Camping / Re-activation logic
      if (abandonedIds.includes(lead.id)) return false;

      // Rule 1: Trade Category Filter
      if (filter !== 'All' && lead.serviceRequired !== filter) return false;

      // Rule 2: Already purchased logic
      if (lead.purchasedBy.includes(user.id)) return false;
      const hasPurchasedBySameTrade = user.tradeTypes.some(t => lead.purchasedByTradeTypes.includes(t));
      if (hasPurchasedBySameTrade) return false;

      // Rule 3: Reservation logic
      const isReservedBySameCategory = lead.reservedUntil && lead.reservedUntil > now;
      const isLeadInCategory = user.tradeTypes.includes(lead.serviceRequired);
      const isInOurCart = cart.some(c => c.id === lead.id);
      if (isLeadInCategory && isReservedBySameCategory && !isInOurCart) return false;

      // Rule 4: AUTOMATED RADIUS FILTER
      if (lead.calculatedDistance !== null && user.operatingRadius !== undefined) {
        if (lead.calculatedDistance > user.operatingRadius) return false;
      }

      return true;
    });
  }, [leads, user, filter, cart]);

  const isItemInCart = (leadId: string) => cart.some(item => item.id === leadId);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 p-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-[2.5rem] shadow-xl shadow-indigo-100 overflow-hidden">
          <div className="bg-white rounded-[2.4rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-6 mb-6 md:mb-0">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-3xl">📍</div>
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 brand-font">Local Service Area Active</h2>
                <p className="text-gray-500 font-medium">Showing leads within {user.operatingRadius} miles of your address.</p>
              </div>
            </div>
            <Link 
              to="/profile" 
              className="px-8 py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold shadow-sm hover:bg-gray-50 transition-all active:scale-95 whitespace-nowrap"
            >
              Adjust My Service Area
            </Link>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 brand-font">Lead Marketplace</h1>
            <p className="text-gray-500 mt-2 font-medium">Exclusive opportunities for {user.tradeTypes.join(', ')}</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
            <span className="text-gray-500 font-medium">Your Balance:</span>
            <span className="text-2xl font-bold text-indigo-600">{user.credits} Credits</span>
            <Link to="/subscription" className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg text-sm font-bold border border-indigo-100 hover:bg-indigo-100 transition-colors">
              Top Up
            </Link>
          </div>
        </div>

        <div className="flex overflow-x-auto pb-4 mb-8 space-x-3">
          {['All', ...Object.values(TradeType)].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-bold transition-all ${
                filter === t ? 'bg-indigo-600 text-white' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-100'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleLeadsWithDistance.length > 0 ? (
            visibleLeadsWithDistance.map(lead => (
              <div key={lead.id} className="bg-white rounded-[2rem] p-8 shadow-sm hover:shadow-xl transition-all border border-gray-50 flex flex-col justify-between relative overflow-hidden group">
                {lead.calculatedDistance !== null && lead.calculatedDistance < 5 && (
                  <div className="absolute top-0 right-0 bg-green-500 text-white px-4 py-1 rounded-bl-2xl text-[10px] font-bold uppercase tracking-widest">
                    Ultra Local
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="px-3 py-1 bg-pastel-blue text-indigo-700 text-xs font-bold rounded-full uppercase">
                      {lead.serviceRequired}
                    </span>
                    <span className="text-gray-400 text-xs font-medium">{lead.postedDate}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{lead.clientName}</h3>
                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    <span className="font-semibold">{lead.location}</span>
                    {lead.calculatedDistance !== null && (
                      <span className="ml-2 text-indigo-600 font-bold">• {lead.calculatedDistance.toFixed(1)} miles away</span>
                    )}
                  </div>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-6 font-medium leading-relaxed">
                    {lead.description}
                  </p>
                </div>
                
                <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-gray-400 uppercase font-bold tracking-wider">Purchase Price</span>
                    <span className="text-lg font-extrabold text-indigo-600">{lead.price} Credit{lead.price > 1 ? 's' : ''}</span>
                  </div>
                  <button
                    onClick={() => !isItemInCart(lead.id) && onAddToCart(lead)}
                    disabled={isItemInCart(lead.id)}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all shadow-md ${
                      isItemInCart(lead.id) 
                      ? 'bg-green-100 text-green-700 cursor-default' 
                      : 'bg-indigo-500 text-white hover:bg-indigo-600 shadow-indigo-100'
                    }`}
                  >
                    {isItemInCart(lead.id) ? 'Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 bg-white rounded-[3rem] text-center border-2 border-dashed border-gray-100">
               <div className="text-5xl mb-6">🏜️</div>
               <p className="text-gray-600 font-bold text-xl mb-2">No leads found in your current area.</p>
               <p className="text-gray-400 max-w-sm mx-auto font-medium mb-8">
                 We couldn't find any leads within {user.operatingRadius} miles of your business address in {getCityFromAddress(user.address || '') || 'your city'}.
               </p>
               <Link 
                to="/profile" 
                className="inline-block px-8 py-3 bg-indigo-50 text-indigo-700 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
               >
                 Expand My Service Radius
               </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadsDashboard;
