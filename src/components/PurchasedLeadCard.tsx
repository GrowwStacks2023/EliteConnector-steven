import React, { useState } from 'react';
import { LeadPurchase } from '../services/purchaseService';
import ServiceProviderModal from './ServiceProviderModal';

interface PurchasedLeadCardProps {
  purchases: LeadPurchase[];
}

const PurchasedLeadCard: React.FC<PurchasedLeadCardProps> = ({ purchases }) => {
  const [selectedProvider, setSelectedProvider] = useState<LeadPurchase | null>(null);

  if (!purchases || purchases.length === 0) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <p className="text-sm text-gray-500 text-center">No service providers have purchased this lead yet</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="mt-4 space-y-3">
        <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
          Interested Service Provider
        </h4>
        
        {purchases.map((purchase) => (
          <div 
            key={purchase.id}
            className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-2xl border border-indigo-100 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Profile Initial */}
                <div className="w-12 h-12 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {purchase.service_provider.full_name.charAt(0).toUpperCase()}
                </div>

                {/* Provider Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-bold text-gray-900">
                      {purchase.service_provider.full_name}
                    </h5>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      ✓ Lead Purchased
                    </span>
                    {purchase.service_provider.is_verified && (
                      <span className="px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                        ✓ Verified
                      </span>
                    )}
                  </div>

                  {purchase.service_provider.serviceType && (
                    <p className="text-sm text-gray-600 mb-1">
                      🔧 {purchase.service_provider.serviceType}
                    </p>
                  )}

                  {purchase.service_provider.address && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {purchase.service_provider.address}
                      {purchase.service_provider.zipcode && `, ${purchase.service_provider.zipcode}`}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-2">
                    {purchase.service_provider.phone && (
                      <span>📞 {purchase.service_provider.phone}</span>
                    )}
                    {purchase.service_provider.email && (
                      <span>✉️ {purchase.service_provider.email}</span>
                    )}
                  </div>

                  {purchase.service_provider.experience && (
                    <p className="text-xs text-gray-600 mb-2">
                      💼 Experience: {purchase.service_provider.experience}
                    </p>
                  )}                  
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedProvider(purchase)}
                  className="px-4 py-2 bg-white text-indigo-600 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-all border border-indigo-200"
                >
                  View Profile
                </button>
                {purchase.service_provider.phone && (
                  <a
                    href={`tel:${purchase.service_provider.phone}`}
                    className="px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all text-center"
                  >
                    📞 Call
                  </a>
                )}
                {purchase.service_provider.email && (
                  <a
                    href={`mailto:${purchase.service_provider.email}`}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all text-center"
                  >
                    ✉️ Email
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Provider Modal */}
      {selectedProvider && (
        <ServiceProviderModal
          purchase={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}
    </>
  );
};

export default PurchasedLeadCard;