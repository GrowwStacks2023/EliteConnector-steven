import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole } from '../../types';
import Swal from 'sweetalert2';
import { supabase } from '../lib/supabaseClient';

// Import components
import AdminLayout from '../components/admin-components/AdminLayout';
import StatsOverview from '../components/admin-components/StatsOverview';
import ProvidersTable from '../components/admin-components/ProvidersTable';
import ProviderDetail from '../components/admin-components/ProviderDetail';
import ClientsTable from '../components/admin-components/ClientsTable';
import ClientDetail from '../components/admin-components/ClientDetail';
import JobsTable from '../components/admin-components/JobsTable';
import SearchFilter from '../components/admin-components/SearchFilter';

interface AdminDashboardProps {
  user: User;
}

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

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: 'active' | 'inactive';
  joinedDate: string;
  projectsPosted: number;
  totalSpent: number;
}

interface Job {
  id: string;
  title: string;
  trade: string;
  clientName: string;
  location: string;
  budget: number;
  status: 'active' | 'unlocked' | 'completed' | 'expired';
  postedDate: string;
  viewCount: number;
  unlockCount: number;
}

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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'providers' | 'clients' | 'jobs'>('stats');
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    activeLeads: 0,
    totalUsers: 0,
    monthlyGrowth: 0,
    totalClients: 0,
    totalServiceProviders: 0,
    totalJobs: 0,
    creditsIssued: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewingProvider, setViewingProvider] = useState<ServiceProvider | null>(null);
  const [viewingClient, setViewingClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchServiceProviders(),
        fetchClients(),
        fetchJobs(),
        fetchStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        title: 'Error',
        text: 'Failed to load dashboard data',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchServiceProviders = async () => {
    try {
      console.log('Fetching Service Providers with role:', UserRole.SERVICE_PROVIDER);
      
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('role', UserRole.SERVICE_PROVIDER)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching providers:', error);
        throw error;
      }

      console.log('✅ Service Providers Data:', data);

      const providers: ServiceProvider[] = (data || []).map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name || dbUser.full_name || dbUser.email?.split('@')[0] || 'N/A',
        email: dbUser.email,
        trade: dbUser.trade || (dbUser.trade_types && dbUser.trade_types[0]) || 'N/A',
        credits: dbUser.credits || 0,
        status: (dbUser.is_active !== false) ? 'active' : 'inactive',
        joinedDate: new Date(dbUser.created_at).toLocaleDateString(),
        totalPurchases: 0,
        isProfileComplete: dbUser.is_profile_complete || false
      }));

      setServiceProviders(providers);
      return providers;
    } catch (error) {
      console.error('❌ Error fetching service providers:', error);
      return [];
    }
  };

  const fetchClients = async () => {
    try {
      console.log('Fetching Clients with role:', UserRole.CLIENT);
      
      const { data, error } = await supabase
        .from('user')
        .select('*')
        .eq('role', UserRole.CLIENT)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error fetching clients:', error);
        throw error;
      }

      console.log('✅ Clients Data:', data);

      const clientsList: Client[] = (data || []).map(dbUser => ({
        id: dbUser.id,
        name: dbUser.name || dbUser.full_name || dbUser.email?.split('@')[0] || 'N/A',
        email: dbUser.email,
        company: dbUser.company || undefined,
        status: (dbUser.is_active !== false) ? 'active' : 'inactive',
        joinedDate: new Date(dbUser.created_at).toLocaleDateString(),
        projectsPosted: 0,
        totalSpent: 0
      }));

      setClients(clientsList);
      return clientsList;
    } catch (error) {
      console.error('❌ Error fetching clients:', error);
      return [];
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase error fetching jobs:', error);
        throw error;
      }

      console.log('✅ Jobs/Leads Data:', data);

      const jobsList: Job[] = (data || []).map(lead => ({
        id: lead.id,
        title: lead.title || 'Untitled Job',
        trade: lead.trade || lead.service_required || 'N/A',
        clientName: lead.client_name || 'N/A',
        location: lead.location || 'N/A',
        budget: lead.budget || lead.price || 0,
        status: lead.status || 'active',
        postedDate: lead.posted_date ? new Date(lead.posted_date).toLocaleDateString() : new Date(lead.created_at).toLocaleDateString(),
        viewCount: lead.view_count || 0,
        unlockCount: lead.unlock_count || (lead.purchased_by ? lead.purchased_by.length : 0)
      }));

      setJobs(jobsList);
      return jobsList;
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      return [];
    }
  };

  const fetchStats = async () => {
    try {
      const [providersResult, clientsResult, leadsResult, creditData] = await Promise.all([
        supabase.from('user').select('*', { count: 'exact', head: true }).eq('role', UserRole.SERVICE_PROVIDER),
        supabase.from('user').select('*', { count: 'exact', head: true }).eq('role', UserRole.CLIENT),
        supabase.from('leads').select('*', { count: 'exact', head: true }),
        supabase.from('user').select('credits').eq('role', UserRole.SERVICE_PROVIDER)
      ]);

      const totalProviders = providersResult.count || 0;
      const totalClientsCount = clientsResult.count || 0;
      const totalLeads = leadsResult.count || 0;
      const creditsIssued = creditData.data?.reduce((sum, u) => sum + (u.credits || 0), 0) || 0;

      console.log('✅ Dashboard Stats:', {
        totalProviders,
        totalClientsCount,
        totalLeads,
        creditsIssued
      });

      setStats({
        totalRevenue: 12450,
        activeLeads: totalLeads,
        totalUsers: totalProviders + totalClientsCount,
        monthlyGrowth: 12,
        totalClients: totalClientsCount,
        totalServiceProviders: totalProviders,
        totalJobs: totalLeads,
        creditsIssued
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
    }
  };

  const handleManageCredits = async (provider: ServiceProvider) => {
    const { value: credits } = await Swal.fire({
      title: `Update Credits for ${provider.name}`,
      html: `
        <div style="text-align: left; margin-top: 1rem;">
          <p style="margin-bottom: 0.5rem;"><strong>Current Credits:</strong> ${provider.credits}</p>
          <p style="margin-bottom: 1rem; color: #6b7280;">Enter a positive number to add credits or negative to deduct</p>
        </div>
      `,
      input: 'number',
      inputLabel: 'Credits to Add/Deduct',
      inputValue: 0,
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      inputValidator: (value) => {
        if (value === '') return 'Please enter a value';
        const num = parseInt(value);
        if (provider.credits + num < 0) return 'Insufficient credits to deduct';
        return null;
      }
    });

    if (credits !== undefined) {
      const amount = parseInt(credits);
      try {
        const { error } = await supabase
          .from('user')
          .update({ credits: provider.credits + amount })
          .eq('id', provider.id);

        if (error) throw error;

        await fetchServiceProviders();
        await fetchStats();

        Swal.fire({
          title: 'Success!',
          text: `Credits ${amount > 0 ? 'added to' : 'deducted from'} ${provider.name}`,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });

        setViewingProvider(null);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update credits',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  const handleToggleUserStatus = async (
    userId: string,
    currentStatus: 'active' | 'inactive',
    userName: string,
    userType: 'provider' | 'client'
  ) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    const result = await Swal.fire({
      title: `${newStatus === 'inactive' ? 'Deactivate' : 'Activate'} User?`,
      text: `Are you sure you want to ${newStatus === 'inactive' ? 'deactivate' : 'activate'} ${userName}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'inactive' ? '#ef4444' : '#10b981',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: `Yes, ${newStatus === 'inactive' ? 'deactivate' : 'activate'}`,
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('user')
          .update({ is_active: newStatus === 'active' })
          .eq('id', userId);

        if (error) throw error;

        if (userType === 'provider') {
          await fetchServiceProviders();
        } else {
          await fetchClients();
        }

        Swal.fire({
          title: 'Success!',
          text: `User ${newStatus === 'inactive' ? 'deactivated' : 'activated'} successfully`,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });

        setViewingProvider(null);
        setViewingClient(null);
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to update user status',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  const handleDeleteJob = async (jobId: string, jobTitle: string) => {
    const result = await Swal.fire({
      title: 'Delete Job?',
      text: `Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        const { error } = await supabase
          .from('leads')
          .delete()
          .eq('id', jobId);

        if (error) throw error;

        await fetchJobs();
        await fetchStats();

        Swal.fire({
          title: 'Deleted!',
          text: 'Job has been removed',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      } catch (error) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete job',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  const handleTabChange = (tab: 'stats' | 'providers' | 'clients' | 'jobs') => {
    setActiveTab(tab);
    setViewingProvider(null);
    setViewingClient(null);
    setSearchTerm('');
    setFilterStatus('all');
  };

  // Filter data
  const filteredProviders = serviceProviders.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.trade.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredClients = clients.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (c.company && c.company.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const filteredJobs = jobs.filter(j => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.trade.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         j.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      stats={{
        totalServiceProviders: stats.totalServiceProviders,
        totalClients: stats.totalClients,
        totalJobs: stats.totalJobs
      }}
      title={
        activeTab === 'stats' ? 'Dashboard Overview' :
        activeTab === 'providers' ? 'Service Providers' :
        activeTab === 'clients' ? 'Client Management' :
        'Job Listings'
      }
      subtitle={
        activeTab === 'stats' ? 'Real-time platform analytics' :
        activeTab === 'providers' ? 'Manage trade professionals' :
        activeTab === 'clients' ? 'Manage business clients' :
        'Monitor marketplace activity'
      }
      headerAction={
        activeTab === 'jobs' ? (
          <Link
            to="/post-lead"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            + Create Lead
          </Link>
        ) : undefined
      }
    >
      {/* Stats Tab */}
      {activeTab === 'stats' && <StatsOverview stats={stats} />}

      {/* Providers Tab */}
      {activeTab === 'providers' && (
        <div className="space-y-6">
          {!viewingProvider ? (
            <>
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                placeholder="Search providers..."
              />
              <ProvidersTable
                providers={filteredProviders}
                onViewProvider={setViewingProvider}
              />
            </>
          ) : (
            <ProviderDetail
              provider={viewingProvider}
              onBack={() => setViewingProvider(null)}
              onManageCredits={handleManageCredits}
              onToggleStatus={(id, status, name) => 
                handleToggleUserStatus(id, status, name, 'provider')
              }
            />
          )}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-6">
          {!viewingClient ? (
            <>
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                filterStatus={filterStatus}
                onFilterChange={setFilterStatus}
                placeholder="Search clients..."
              />
              <ClientsTable
                clients={filteredClients}
                onViewClient={setViewingClient}
              />
            </>
          ) : (
            <ClientDetail
              client={viewingClient}
              onBack={() => setViewingClient(null)}
              onToggleStatus={(id, status, name) => 
                handleToggleUserStatus(id, status, name, 'client')
              }
            />
          )}
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div className="space-y-6">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search jobs..."
            showStatusFilter={false}
          />
          <JobsTable
            jobs={filteredJobs}
            onDeleteJob={handleDeleteJob}
          />
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;