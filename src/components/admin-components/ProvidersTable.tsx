import React from 'react';

interface ServiceProvider {
  id: string;
  name: string;
  email: string;
  trade: string;
  credits: number;
  status: 'active' | 'inactive';
  joinedDate: string;
  totalPurchases: number;
  isProfileComplete: boolean;
}

interface ProvidersTableProps {
  providers: ServiceProvider[];
  onViewProvider: (provider: ServiceProvider) => void;
}

const ProvidersTable: React.FC<ProvidersTableProps> = ({ providers, onViewProvider }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Provider
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Trade
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Credits
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {providers.map((provider) => (
              <tr
                key={provider.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {provider.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {provider.email}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
                    {provider.trade}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xl font-bold text-gray-900">
                    {provider.credits}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      provider.status === 'active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {provider.status.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-600">
                  {provider.joinedDate}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewProvider(provider)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium text-sm hover:bg-indigo-700 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {providers.length === 0 && (
        <div className="p-12 text-center text-gray-500">
          No providers found
        </div>
      )}
    </div>
  );
};

export default ProvidersTable;