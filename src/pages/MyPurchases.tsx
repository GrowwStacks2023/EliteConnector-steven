import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType } from '../../types';
import { getUserPurchases } from '../services/reservationService';
import Swal from 'sweetalert2';

interface MyPurchasesProps {
  user: User;
}

interface PurchasedLead {
  id: string;
  job_id: string;
  price_paid: number;
  purchased_at: string;
  job: {
    id: string;
    title: string;
    category: TradeType;
    description: string;
    location: string;
    zipcode: string;
    budget_min: number | null;
    status: string;
    timeframe: string;
    images: string[];
    client: {
      id: string;
      full_name: string;
      email: string;
      phone: string | null;
    };
  };
}

const MyPurchases: React.FC<MyPurchasesProps> = ({ user }) => {
  const [purchasedLeads, setPurchasedLeads] = useState<PurchasedLead[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const data = await getUserPurchases();
      setPurchasedLeads(data);
    } catch (error) {
      console.error('❌ Error fetching purchases:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load your purchases',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: TradeType) => {
    switch(category) {
      case TradeType.PLUMBER: return '🚿';
      case TradeType.ELECTRICIAN: return '⚡';
      case TradeType.CARPENTER: return '🔨';
      case TradeType.PAINTER: return '🎨';
      case TradeType.BUILDER: return '🧱';
      case TradeType.ROOFER: return '🏠';
      case TradeType.GARDENER: return '🌿';
      case TradeType.CLEANER: return '🧹';
      case TradeType.HANDYMAN: return '🔧';
      default: return '🔧';
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your purchases...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 brand-font mb-2">My Purchases</h1>
          <p className="text-gray-500 font-medium">History of all leads you have unlocked</p>
        </div>

        {purchasedLeads.length > 0 ? (
          <div className="space-y-4">
            {purchasedLeads.map((purchase) => (
              <div 
                key={purchase.id} 
                className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                      {getCategoryIcon(purchase.job.category)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{purchase.job.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(purchase.job.status)}`}>
                          {purchase.job.status.replace('_', ' ')}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-400 font-bold uppercase mb-3">
                        {purchase.job.category} • Purchased {formatDate(purchase.purchased_at)}
                      </p>
                      
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {purchase.job.description}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Client Details</p>
                          <p className="font-bold text-gray-900">{purchase.job.client.full_name}</p>
                          <p className="text-sm text-indigo-600">{purchase.job.client.email}</p>
                          {purchase.job.client.phone && (
                            <p className="text-sm text-gray-600">📞 {purchase.job.client.phone}</p>
                          )}
                        </div>

                        <div className="bg-gray-50 rounded-xl p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Job Details</p>
                          <p className="text-sm text-gray-600">
                            📍 {purchase.job.location}, {purchase.job.zipcode}
                          </p>
                          <p className="text-sm text-gray-600">
                            ⏰ {purchase.job.timeframe || 'Flexible timeline'}
                          </p>
                          {purchase.job.budget_min && (
                            <p className="text-sm font-bold text-green-600">
                              💰 Budget: £{purchase.job.budget_min}
                            </p>
                          )}
                        </div>
                      </div>

                      {purchase.job.images && purchase.job.images.length > 0 && (
                        <div className="mb-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Job Images</p>
                          <div className="flex gap-2 overflow-x-auto">
                            {purchase.job.images.map((img, idx) => (
                              <img 
                                key={idx}
                                src={img}
                                alt={`Job ${idx + 1}`}
                                className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                        <span className="text-xs text-gray-500 font-medium">
                          Credits Used: <span className="font-bold text-indigo-600">{purchase.price_paid}</span>
                        </span>
                        <span className="text-gray-300">•</span>
                        <span className="text-xs text-gray-500 font-medium">
                          Job ID: <span className="font-mono">{purchase.job.id.slice(0, 8)}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="ml-4 flex flex-col gap-2">
                    <a 
                      href={`mailto:${purchase.job.client.email}`}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all text-center"
                    >
                      📧 Email Client
                    </a>
                    {purchase.job.client.phone && (
                      <a 
                        href={`tel:${purchase.job.client.phone}`}
                        className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all text-center"
                      >
                        📞 Call Client
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
            <div className="text-6xl mb-6">🛒</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No Purchases Yet</h3>
            <p className="text-gray-500 mb-6">
              Start browsing the marketplace to find leads that match your services.
            </p>
            <Link 
              to="/dashboard" 
              className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
            >
              Browse Marketplace
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyPurchases;