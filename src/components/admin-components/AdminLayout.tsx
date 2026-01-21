import React from 'react';
import { Link } from 'react-router-dom';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: 'stats' | 'providers' | 'clients' | 'jobs';
  onTabChange: (tab: 'stats' | 'providers' | 'clients' | 'jobs') => void;
  stats: {
    totalServiceProviders: number;
    totalClients: number;
    totalJobs: number;
  };
  title: string;
  subtitle: string;
  headerAction?: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeTab,
  onTabChange,
  stats,
  title,
  subtitle,
  headerAction
}) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Clean minimal header matching reference style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600 mt-1">{subtitle}</p>
            </div>
            {headerAction}
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => onTabChange('stats')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'stats'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onTabChange('providers')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'providers'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Providers ({stats.totalServiceProviders})
            </button>
            <button
              onClick={() => onTabChange('clients')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'clients'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Clients ({stats.totalClients})
            </button>
            <button
              onClick={() => onTabChange('jobs')}
              className={`px-4 py-3 font-semibold border-b-2 transition-colors ${
                activeTab === 'jobs'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Jobs ({stats.totalJobs})
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default AdminLayout;