import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, TradeType } from '../../types';
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
  is_active: boolean;
  postedDate: string;
  location: string;
  zipcode: string;
  budget_min: number | null;
  description: string;
}

const ClientDashboard: React.FC<ClientDashboardProps> = ({ user }) => {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

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
        is_active: job.is_active,
        postedDate: new Date(job.created_at).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        }),
        location: job.location,
        zipcode: job.zipcode,
        budget_min: job.budget_min,
        description: job.description
      }));

      setProjects(mappedProjects);

    } catch (err: any) {
      console.error('❌ Error fetching projects:', err);
      Swal.fire('Error', 'Failed to load projects', 'error');
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
      // case TradeType.ROOFER: return '🏠';
      // case TradeType.LANDSCAPER: return '🌳';
      default: return '🔧';
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
      <div className="max-w-5xl mx-auto">
        <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 brand-font">Hello, {user.fullName.split(' ')[0]}! 👋</h1>
            <p className="text-gray-500 mt-2 font-medium text-lg">Manage your posted projects</p>
          </div>
          <Link 
            to="/post-project" 
            className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:shadow-2xl hover:scale-105 transition-all flex items-center"
          >
            <span className="text-2xl mr-2">+</span> Post a New Project
          </Link>
        </header>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 brand-font mb-6">My Projects</h2>
          
          {projects.length > 0 ? (
            projects.map(project => (
              <div 
                key={project.id} 
                className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-transparent hover:border-gray-200 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4 flex-1">
                    <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                      {getCategoryIcon(project.category)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 text-lg">{project.title}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          project.is_active 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {project.is_active ? '✓ Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 font-bold uppercase mb-3">
                        {project.category} • Posted {project.postedDate}
                      </p>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center text-gray-500">
                          📍 {project.location}, {project.zipcode}
                        </div>
                        {project.budget_min && (
                          <div className="flex items-center">
                            <span className="text-green-600 font-bold">£{project.budget_min}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-[3rem] p-20 text-center border-2 border-dashed border-gray-100">
              <div className="text-6xl mb-6">📝</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-500 mb-6">Post your first project to get started.</p>
              <Link 
                to="/post-project" 
                className="inline-block px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all"
              >
                Post Your First Project
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;