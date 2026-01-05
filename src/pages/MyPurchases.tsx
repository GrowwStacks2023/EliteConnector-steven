
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Lead, TradeType } from '../../types';

interface MyPurchasesProps {
  user: User;
}

const MyPurchases: React.FC<MyPurchasesProps> = ({ user }) => {
  const [purchasedLeads, setPurchasedLeads] = useState<Lead[]>([]);

  useEffect(() => {
    // In a real app, fetch from API. Mock logic here:
    // We'll show some pre-purchased leads for John Plumber
    const mockData: Lead[] = [
      { id: 'l-p1', clientName: 'James Potter', serviceRequired: TradeType.PLUMBER, description: 'Leaking faucet in bathroom.', location: 'Godric\'s Hollow', postedDate: '1 week ago', price: 1, purchasedBy: [user.id], purchasedByTradeTypes: [TradeType.PLUMBER] },
      { id: 'l-p2', clientName: 'Hermione Granger', serviceRequired: TradeType.PLUMBER, description: 'Installing a magical high-flow shower system.', location: 'London', postedDate: '3 days ago', price: 2, purchasedBy: [user.id], purchasedByTradeTypes: [TradeType.PLUMBER] }
    ];
    setPurchasedLeads(mockData);
  }, [user.id]);

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 brand-font mb-2">My Purchases</h1>
        <p className="text-gray-500 mb-8 font-medium">History of all leads you have unlocked.</p>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Service</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {purchasedLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{lead.clientName}</div>
                      <div className="text-xs text-gray-400">{lead.postedDate}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-pastel-green text-green-700">
                        {lead.serviceRequired}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {lead.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Active Opportunity</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link to={`/lead/${lead.id}`} className="text-indigo-600 hover:text-indigo-900 font-bold bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                        View Lead & QR
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {purchasedLeads.length === 0 && (
            <div className="p-20 text-center">
               <p className="text-gray-400 font-bold">You haven't purchased any leads yet.</p>
               <Link to="/dashboard" className="mt-4 inline-block text-indigo-600 font-bold hover:underline">Browse the Marketplace</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPurchases;
