
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType, Proposal } from '../../types';
import Swal from 'sweetalert2';

interface ClientDashboardProps {
  user: User;
}

interface ClientProject {
  id: string;
  title: string;
  category: TradeType;
  status: 'Live' | 'Assigned' | 'Completed';
  views: number;
  postedDate: string;
  location: string;
  proposals: Proposal[];
}

const MOCK_CLIENT_PROJECTS: ClientProject[] = [
  { 
    id: 'l-1', 
    title: 'Complete Kitchen Refit', 
    category: TradeType.CARPENTER, 
    status: 'Live', 
    views: 12, 
    postedDate: '2 days ago', 
    location: 'London',
    proposals: [
      { id: 'p-101', tradeId: 'trade-1', tradeName: 'John Carpenter Ltd', tradeRating: 4.9, tradeType: TradeType.CARPENTER, message: 'I have 15 years experience in bespoke kitchen fittings. Can start next Tuesday.', quote: '£2,500', status: 'PENDING', submittedAt: '1 hour ago' },
      { id: 'p-102', tradeId: 'trade-2', tradeName: 'Eco Build Pros', tradeRating: 4.2, tradeType: TradeType.CARPENTER, message: 'We specialize in sustainable materials.', quote: '£3,200', status: 'PENDING', submittedAt: '3 hours ago' }
    ]
  },
  { 
    id: 'l-2', 
    title: 'Emergency Pipe Repair', 
    category: TradeType.PLUMBER, 
    status: 'Assigned', 
    views: 5, 
    postedDate: '1 week ago', 
    location: 'London',
    proposals: [
      { id: 'p-201', tradeId: 'trade-3', tradeName: 'QuickFix Plumbing', tradeRating: 4.8, tradeType: TradeType.PLUMBER, message: 'I am nearby and can be there in 30 mins.', quote: '£150', status: 'ACCEPTED', submittedAt: '1 week ago' }
    ]
  }
];

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [projects, setProjects] = useState<ClientProject[]>(MOCK_CLIENT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

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
        setProjects(prev => prev.map(proj => {
          if (proj.id === projectId) {
            const updatedProposals = proj.proposals.map(prop => {
              if (prop.id === proposalId) {
                return { ...prop, status: action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED' } as Proposal;
              }
              // If accepting one, should we decline others? For this mock, we'll allow multiple accepts if needed
              return prop;
            });
            return { 
              ...proj, 
              proposals: updatedProposals,
              status: action === 'ACCEPT' ? 'Assigned' : proj.status 
            };
          }
          return proj;
        }));

        if (action === 'DECLINE') {
          // In a real app, this would notify the trade pro and update their "declinedLeadIds"
          Swal.fire('Updated', 'The professional has been declined. This project will no longer be visible to them.', 'success');
        } else {
          Swal.fire('Success!', 'Professional accepted. You can now see their contact details below.', 'success');
        }
      }
    });
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 brand-font">Hello, {user.fullName.split(' ')[0]}!</h1>
            <p className="text-gray-500 mt-2 font-medium text-lg">Manage project interests and choose your professional.</p>
          </div>
          <Link 
            to="/post-project" 
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center"
          >
            <span className="text-2xl mr-2">+</span> Post a New Project
          </Link>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Projects Column */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 brand-font mb-6">My Active Projects</h2>
            {projects.length > 0 ? (
              projects.map(project => (
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
                        {project.category === TradeType.PLUMBER ? '🚿' : '🔨'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{project.title}</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase">{project.category} • {project.postedDate}</p>
                      </div>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      project.status === 'Live' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {project.status === 'Live' ? 'Finding Pros' : 'In Progress'}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-6 text-sm">
                    <div className="flex items-center">
                      <span className="text-indigo-600 font-bold mr-1">{project.proposals.length}</span>
                      <span className="text-gray-400 font-medium">Interests Received</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-900 font-bold mr-1">{project.views}</span>
                      <span className="text-gray-400 font-medium">Marketplace Views</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
                <div className="text-6xl mb-6">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h3>
                <Link to="/post-project" className="text-indigo-600 font-bold hover:underline">Post one now</Link>
              </div>
            )}
          </div>

          {/* Proposals Detail Column */}
          <div className="bg-white rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden flex flex-col h-fit sticky top-24">
            <div className="bg-gray-900 p-8 text-white">
              <h3 className="text-xl font-bold brand-font">Proposals Received</h3>
              <p className="text-gray-400 text-sm mt-1">
                {selectedProject ? `For "${selectedProject.title}"` : 'Select a project to view bids'}
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
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Initial Quote</span>
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
                          <p className="text-[10px] text-green-600 font-bold uppercase mb-2">Contact Details Unlocked</p>
                          <div className="text-xs font-medium text-gray-700 space-y-1">
                            <p>📞 +44 7700 123456</p>
                            <p>✉️ {proposal.tradeName.toLowerCase().replace(/\s/g, '')}@example.com</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-center text-[10px] text-rose-400 font-bold italic">Professional was declined</p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="text-4xl mb-4 opacity-20">📫</div>
                    <p className="text-gray-400 font-medium">No proposals yet.</p>
                  </div>
                )
              ) : (
                <div className="text-center py-20 text-gray-300">
                  <p className="font-bold">Select a project on the left to review interested pros</p>
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
