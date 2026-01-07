import React, { useState, useEffect } from 'react';
import { User, Project } from '../../types';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface PortfolioPageProps {
  user: User;
  onUpdateProfile: (user: User) => void;
}

interface PortfolioProject extends Project {
  isVisible?: boolean;
}

const PortfolioPage: React.FC<PortfolioPageProps> = ({ user, onUpdateProfile }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<PortfolioProject>>({
    title: '',
    description: '',
    images: [],
    isVisible: true
  });

  const [projects, setProjects] = useState<PortfolioProject[]>([]);

  // Fetch projects from Supabase on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }

      const currentUser = JSON.parse(storedUser);
      const userId = currentUser.id;

      // Fetch ALL projects (including hidden ones) for portfolio management
      const { data, error } = await supabase
        .from('serviceprovider_portfolio')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedProjects: PortfolioProject[] = (data || []).map(proj => ({
        id: proj.id,
        title: proj.title,
        description: proj.description,
        images: proj.images || [],
        dateCompleted: proj.date_completed || new Date().toLocaleDateString(),
        isVisible: proj.is_visible
      }));

      setProjects(mappedProjects);

      const updatedUser = {
        ...currentUser,
        projects: mappedProjects
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateProfile(updatedUser);

    } catch (err: any) {
      console.error('❌ Error fetching projects:', err);
      Swal.fire('Error', 'Failed to load portfolio projects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddProject = () => {
    setCurrentProject({ 
      title: '', 
      description: '', 
      images: [],
      isVisible: true 
    });
    setIsEditingProject(true);
  };

  const handleSaveProject = async () => {
    if (!currentProject.title || !currentProject.description) {
      Swal.fire('Incomplete', 'Title and Description are required for projects.', 'error');
      return;
    }

    try {
      setLoading(true);

      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        Swal.fire('Error', 'User session not found. Please log in again.', 'error');
        navigate('/login');
        return;
      }

      const currentUser = JSON.parse(storedUser);
      const userId = currentUser.id;

      if (currentProject.id && currentProject.id.startsWith('proj-')) {
        // New project with temporary ID
        const { data, error } = await supabase
          .from('serviceprovider_portfolio')
          .insert({
            user_id: userId,
            title: currentProject.title,
            description: currentProject.description,
            images: currentProject.images || [],
            date_completed: new Date().toISOString().split('T')[0],
            is_visible: currentProject.isVisible ?? true
          })
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Project created in Supabase:', data);

        Swal.fire({
          title: 'Project Added!',
          text: 'Your project has been successfully added to your portfolio.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });

      } else if (currentProject.id) {
        // Update existing project
        const { error } = await supabase
          .from('serviceprovider_portfolio')
          .update({
            title: currentProject.title,
            description: currentProject.description,
            images: currentProject.images || [],
            is_visible: currentProject.isVisible ?? true,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentProject.id)
          .eq('user_id', userId);

        if (error) throw error;

        Swal.fire({
          title: 'Project Updated!',
          text: 'Your project has been successfully updated.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });

      } else {
        // New project without ID
        const { data, error } = await supabase
          .from('serviceprovider_portfolio')
          .insert({
            user_id: userId,
            title: currentProject.title,
            description: currentProject.description,
            images: currentProject.images || [],
            date_completed: new Date().toISOString().split('T')[0],
            is_visible: currentProject.isVisible ?? true
          })
          .select()
          .single();

        if (error) throw error;

        console.log('✅ Project created in Supabase:', data);

        Swal.fire({
          title: 'Project Added!',
          text: 'Your project has been successfully added to your portfolio.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        });
      }

      await fetchProjects();
      setIsEditingProject(false);

    } catch (err: any) {
      console.error('❌ Error saving project:', err);
      Swal.fire('Error', err.message || 'Failed to save project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (projectId: string, currentVisibility: boolean) => {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }

      const currentUser = JSON.parse(storedUser);
      const userId = currentUser.id;

      // Update visibility in Supabase
      const { error } = await supabase
        .from('serviceprovider_portfolio')
        .update({
          is_visible: !currentVisibility,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update local state
      setProjects(prev => 
        prev.map(proj => 
          proj.id === projectId 
            ? { ...proj, isVisible: !currentVisibility }
            : proj
        )
      );

      const visibilityStatus = !currentVisibility ? 'visible' : 'hidden';
      Swal.fire({
        title: 'Visibility Updated!',
        text: `Project is now ${visibilityStatus} to others.`,
        icon: 'success',
        confirmButtonColor: '#4f46e5',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (err: any) {
      console.error('❌ Error toggling visibility:', err);
      Swal.fire('Error', err.message || 'Failed to update visibility', 'error');
    }
  };

  const handleDeleteProject = async (id: string) => {
    const result = await Swal.fire({
      title: 'Delete Project?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);

        const storedUser = localStorage.getItem('user');
        if (!storedUser) {
          navigate('/login');
          return;
        }

        const currentUser = JSON.parse(storedUser);
        const userId = currentUser.id;

        const { error } = await supabase
          .from('serviceprovider_portfolio')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;

        await fetchProjects();

        Swal.fire('Deleted!', 'Your project has been removed.', 'success');

      } catch (err: any) {
        console.error('❌ Error deleting project:', err);
        Swal.fire('Error', err.message || 'Failed to delete project', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const newImage = `https://picsum.photos/seed/${Math.random()}/800/600`;
    setCurrentProject(prev => ({
      ...prev,
      images: [...(prev.images || []), newImage]
    }));
  };

  if (loading && projects.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Navigation */}
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 brand-font">Portfolio Showcase</h1>
            <p className="text-gray-500 font-medium mt-2">Manage images and details of your best projects.</p>
          </div>
          <Link 
            to="/profile" 
            className="text-indigo-600 font-bold hover:underline flex items-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Profile
          </Link>
        </div>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 p-8 sm:p-12 min-h-[600px]">
          {/* Add Project Button */}
          {!isEditingProject && (
            <div className="flex justify-end mb-10">
              <button
                onClick={handleAddProject}
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center disabled:opacity-50"
              >
                <span className="text-xl mr-2">+</span> Add Project
              </button>
            </div>
          )}

          {isEditingProject ? (
            /* Project Edit Form */
            <div className="bg-gray-50 p-8 rounded-[2.5rem] border border-gray-100 animate-fade-in">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <span className="mr-3">🎨</span> {currentProject.id ? 'Edit Project' : 'New Showcase Project'}
              </h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Title</label>
                  <input
                    type="text"
                    value={currentProject.title}
                    onChange={e => setCurrentProject({ ...currentProject, title: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="e.g. Modern Bathroom Renovation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={currentProject.description}
                    onChange={e => setCurrentProject({ ...currentProject, description: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    placeholder="Describe the scope of work, materials used, etc."
                  />
                </div>

                {/* Visibility Toggle */}
                <div className="bg-white p-4 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest">Project Visibility</label>
                      <p className="text-xs text-gray-500 mt-1">Control whether this project is visible to others</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentProject({ ...currentProject, isVisible: !currentProject.isVisible })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        currentProject.isVisible ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          currentProject.isVisible ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs font-bold ${currentProject.isVisible ? 'text-green-600' : 'text-gray-500'}`}>
                      {currentProject.isVisible ? '👁️ Visible to others' : '🔒 Hidden from others'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Project Gallery</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                    {currentProject.images?.map((img, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setCurrentProject({ ...currentProject, images: currentProject.images?.filter((_, idx) => idx !== i) })}
                          className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square bg-white border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 transition-colors">
                      <span className="text-2xl text-gray-300 mb-1">+</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Add Image</span>
                      <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveProject}
                    disabled={loading}
                    className="flex-grow py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : currentProject.id ? 'Update Project' : 'Publish to Portfolio'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingProject(false)}
                    disabled={loading}
                    className="px-8 py-4 bg-white text-gray-500 rounded-xl font-bold border border-gray-100 hover:bg-gray-100 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Portfolio Grid View */
            <div className="flex-grow">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {projects.map(proj => (
                    <div key={proj.id} className={`group relative bg-white border rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all h-64 flex flex-col ${
                      proj.isVisible ? 'border-gray-100' : 'border-gray-300 opacity-75'
                    }`}>
                      <div className="h-40 relative bg-gray-100">
                        {proj.images.length > 0 ? (
                          <img src={proj.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs italic">No images</div>
                        )}
                        
                        {/* Visibility Badge */}
                        <div className="absolute top-2 left-2">
                          {proj.isVisible ? (
                            <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                              👁️ Visible
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-500 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                              🔒 Hidden
                            </span>
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => handleToggleVisibility(proj.id, proj.isVisible ?? true)}
                            className="p-3 bg-white text-purple-600 rounded-full font-bold shadow-lg hover:scale-110 transition-transform"
                            title={proj.isVisible ? 'Hide project' : 'Show project'}
                          >
                            {proj.isVisible ? '🔒' : '👁️'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setCurrentProject(proj); setIsEditingProject(true); }}
                            className="p-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:scale-110 transition-transform"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProject(proj.id)}
                            className="p-3 bg-white text-rose-600 rounded-full font-bold shadow-lg hover:scale-110 transition-transform"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                      <div className="p-5">
                        <h4 className="font-bold text-gray-900 truncate">{proj.title}</h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1 flex justify-between items-center">
                          <span>{proj.dateCompleted}</span>
                          <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">{proj.images.length} Images</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-grow flex flex-col items-center justify-center text-center py-20 border-2 border-dashed border-gray-50 rounded-[3rem]">
                  <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-4xl mb-6">📸</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">No projects showcased yet</h4>
                  <p className="text-gray-500 max-w-sm mb-8">
                    Upload images of your past work to build trust with leads and stand out from the competition.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddProject}
                    className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all"
                  >
                    Add Your First Project
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Tip */}
        <div className="mt-12 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex items-start space-x-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💡</div>
          <div>
            <h4 className="font-bold text-purple-900">Privacy & Visibility</h4>
            <p className="text-sm text-purple-700/80 leading-relaxed font-medium">
              Use the visibility toggle to control which projects are shown to potential clients. Hidden projects remain in your portfolio but won't be visible to others.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioPage;