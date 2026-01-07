import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType, Proposal } from '../../types';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

interface ClientDashboardProps {
  user: User;
}

interface ClientProject {
  id: string;
  title: string;
  category: TradeType;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  views: number;
  postedDate: string;
  location: string;
  zipcode: string;
  budget_min: number | null;
  budget_max: number | null;
  budget_type: string;
  urgency: string;
  proposals: Proposal[];
  proposalsCount: number;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) return;

      const currentUser = JSON.parse(storedUser);

      // Fetch jobs from Supabase
      const { data, error } = await supabase
        .from('client_jobs')
        .select('*')
        .eq('client_id', currentUser.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Map to ClientProject format
      const mappedProjects: ClientProject[] = (data || []).map(job => ({
        id: job.id,
        title: job.title,
        category: job.category as TradeType,
        status: job.status,
        views: job.views_count || 0,
        postedDate: new Date(job.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        location: job.location,
        zipcode: job.zipcode,
        budget_min: job.budget_min,
        budget_max: job.budget_max,
        budget_type: job.budget_type,
        urgency: job.urgency,
        proposals: [], // TODO: Fetch proposals when implemented
        proposalsCount: job.proposals_count || 0
      }));

      setProjects(mappedProjects);

    } catch (err: any) {
      console.error('❌ Error fetching projects:', err);
      Swal.fire('Error', 'Failed to load projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  const handleProposalAction = (projectId: string, proposalId: string, action: 'ACCEPT' | 'DECLINE') => {
    const actionText = action === 'ACCEPT' ? 'accepting' : 'declining';
    
    Swal.fire({
      title: 'Are you sure?',
      text: `You are ${actionText} this professional for your project.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: action === 'ACCEPT' ? '#10b981' : '#ef4444',
      confirmButtonText: action === 'ACCEPT' ? 'Yes, Accept Pro' : 'Yes, Decline'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement proposal acceptance logic with Supabase
        if (action === 'DECLINE') {
          Swal.fire('Updated', 'The professional has been declined.', 'success');
        } else {
          Swal.fire('Success!', 'Professional accepted. Contact details will be available soon.', 'success');
        }
      }
    });
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'open': return { text: 'Finding Pros', color: 'bg-amber-100 text-amber-700' };
      case 'in_progress': return { text: 'In Progress', color: 'bg-blue-100 text-blue-700' };
      case 'completed': return { text: 'Completed', color: 'bg-green-100 text-green-700' };
      case 'cancelled': return { text: 'Cancelled', color: 'bg-gray-100 text-gray-700' };
      default: return { text: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getUrgencyBadge = (urgency: string) => {
    switch(urgency) {
      case 'urgent': return '🔴 Urgent';
      case 'normal': return '🟡 Normal';
      case 'flexible': return '🟢 Flexible';
      default: return urgency;
    }
  };

  if (loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 brand-font">Hello, {user.fullName.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-2 font-medium text-lg">Manage your projects and connect with professionals.</p>
          </div>
          <Link 
            to="/post-project" 
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-2xl hover:scale-105 transition-all flex items-center"
          >
            <span className="text-2xl mr-2">+</span> Post a New Project
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 brand-font mb-6">My Projects</h2>
            {projects.length > 0 ? (
              projects.map(project => {
                const statusDisplay = getStatusDisplay(project.status);
                return (
                  <div 
                    key={project.id} 
                    onClick={() => setSelectedProjectId(project.id)}
                    className={`bg-white p-6 rounded-[2.5rem] shadow-sm border-2 transition-all cursor-pointer ${
                      selectedProjectId === project.id ? 'border-indigo-500 shadow-lg' : 'border-transparent hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl">
                          {project.category === TradeType.PLUMBER ? '🚿' : 
                           project.category === TradeType.ELECTRICIAN ? '⚡' :
                           project.category === TradeType.CARPENTER ? '🔨' : '🔧'}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{project.title}</h3>
                          <p className="text-xs text-gray-400 font-bold uppercase">{project.category} • {project.postedDate}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusDisplay.color}`}>
                          {statusDisplay.text}
                        </span>
                        <span className="text-[10px] font-bold text-gray-500">
                          {getUrgencyBadge(project.urgency)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm mb-4">
                      <div className="flex items-center">
                        <span className="text-indigo-600 font-bold mr-1">{project.proposalsCount}</span>
                        <span className="text-gray-400 font-medium">Proposals</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-gray-900 font-bold mr-1">{project.views}</span>
                        <span className="text-gray-400 font-medium">Views</span>
                      </div>
                      {project.budget_min && project.budget_max && (
                        <div className="flex items-center">
                          <span className="text-green-600 font-bold">£{project.budget_min}-£{project.budget_max}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500">
                      📍 {project.location} • {project.zipcode}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h3>
                <p className="text-gray-500 mb-6">Post your first project and start receiving proposals from verified professionals.</p>
                <Link 
                  to="/post-project" 
                  className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
                >
                  Post Your First Project
                </Link>
              </div>
            )}
          </div>

          {/* Proposals Detail Column */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-fit sticky top-24">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-8 text-white">
              <h3 className="text-xl font-bold brand-font">Proposals</h3>
              <p className="text-gray-400 text-sm mt-1">
                {selectedProject ? `For "${selectedProject.title}"` : 'Select a project to view proposals'}
              </p>
            </div>

            <div className="p-6 space-y-6 max-h-[600px] overflow-y-auto">
              {selectedProject ? (
                selectedProject.proposals.length > 0 ? (
                  selectedProject.proposals.map(proposal => (
                    <div key={proposal.id} className={`p-6 rounded-3xl border ${
                      proposal.status === 'ACCEPTED' ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-100'
                    }`}>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold">
                            {proposal.tradeName.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-sm">{proposal.tradeName}</h4>
                            <div className="flex items-center text-xs text-yellow-500 font-bold">
                              ★ {proposal.tradeRating}
                            </div>
                          </div>
                        </div>
                        {proposal.status !== 'PENDING' && (
                          <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${
                            proposal.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
                          }`}>
                            {proposal.status}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 italic mb-4">"{proposal.message}"</p>
                      
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Quote</span>
                        <span className="text-lg font-extrabold text-indigo-600">{proposal.quote}</span>
                      </div>

                      {proposal.status === 'PENDING' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleProposalAction(selectedProject.id, proposal.id, 'ACCEPT')}
                            className="py-2.5 bg-green-600 text-white rounded-xl font-bold text-xs hover:bg-green-700 transition-all"
                          >
                            Accept
                          </button>
                          <button 
                            onClick={() => handleProposalAction(selectedProject.id, proposal.id, 'DECLINE')}
                            className="py-2.5 bg-white border border-rose-200 text-rose-600 rounded-xl font-bold text-xs hover:bg-rose-50 transition-all"
                          >
                            Decline
                          </button>
                        </div>
                      ) : proposal.status === 'ACCEPTED' ? (
                        <div className="pt-4 border-t border-green-200 mt-2">
                          <p className="text-[10px] text-green-600 font-bold uppercase mb-2">Contact Details</p>
                          <div className="text-xs font-medium text-gray-700 space-y-1">
                            <p>📞 +44 7700 123456</p>
                            <p>✉️ {proposal.tradeName.toLowerCase().replace(/\s/g, '')}@example.com</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-[10px] text-rose-400 font-bold italic">Declined</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-4 opacity-20">📫</div>
                    <p className="text-gray-400 font-medium">No proposals yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Professionals will send proposals soon.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-20 text-gray-300">
                  <div className="text-4xl mb-4 opacity-20">👈</div>
                  <p className="font-bold">Select a project to view proposals</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;