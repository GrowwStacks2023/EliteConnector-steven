import React from 'react';

interface DashboardStats {
  totalRevenue: number;
  activeLeads: number;
  totalUsers: number;
  monthlyGrowth: number;
  totalClients: number;
  totalServiceProviders: number;
  totalJobs: number;
  creditsIssued: number;
}

interface StatsOverviewProps {
  stats: DashboardStats;
}

const StatsOverview: React.FC<StatsOverviewProps> = ({ stats }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Revenue</span>
            <span className="text-3xl">💰</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            £{stats.totalRevenue.toLocaleString()}
          </div>
          <div className="text-sm text-green-600 font-medium flex items-center">
            ↑ {stats.monthlyGrowth}% this month
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Active Leads</span>
            <span className="text-3xl">📋</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.activeLeads}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Total jobs in system
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Users</span>
            <span className="text-3xl">👥</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.totalUsers}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            {stats.totalServiceProviders} providers, {stats.totalClients} clients
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Credits Issued</span>
            <span className="text-3xl">🎫</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            {stats.creditsIssued}
          </div>
          <div className="text-sm text-gray-500 font-medium">
            Active in system
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">User Breakdown</h3>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Service Providers</span>
                <span className="text-2xl font-bold text-indigo-600">
                  {stats.totalServiceProviders}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.totalServiceProviders / stats.totalUsers) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 font-medium">Clients</span>
                <span className="text-2xl font-bold text-purple-600">
                  {stats.totalClients}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-purple-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${stats.totalUsers > 0 ? (stats.totalClients / stats.totalUsers) * 100 : 0}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">System Health</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">Database</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-600 font-semibold">ONLINE</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <span className="text-gray-600 font-medium">API Services</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-600 font-semibold">ONLINE</span>
              </div>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-gray-600 font-medium">Payment Gateway</span>
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-600 font-semibold">ONLINE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;