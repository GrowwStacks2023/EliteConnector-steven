import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TradeType } from '../../types';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

interface PostProjectPageProps {
  user: User;
}

const PostProjectPage: React.FC<PostProjectPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: TradeType.PLUMBER,
    location: '',
    zipcode: '',
    description: '',
    budget: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Get user from localStorage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        Swal.fire('Error', 'Please log in again.', 'error');
        navigate('/login');
        return;
      }

      const currentUser = JSON.parse(storedUser);

      // Insert job into Supabase
      const { data, error } = await supabase
        .from('client_jobs')
        .insert({
          client_id: currentUser.id,
          title: formData.title,
          category: formData.category,
          location: formData.location,
          zipcode: formData.zipcode,
          description: formData.description,
          budget: formData.budget ? parseFloat(formData.budget) : null,
          status: 'open',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      Swal.fire({
        title: 'Project Posted!',
        text: 'Your project has been successfully submitted to the marketplace. Verified professionals in your area will be notified.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        navigate('/dashboard');
      });

    } catch (err: any) {
      console.error('❌ Error posting job:', err);
      Swal.fire('Error', err.message || 'Failed to post project. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Post Your Project</h1>
          <p className="text-gray-600 font-medium">Tell us what you need, and we'll connect you with verified professionals.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-50">
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            {/* Section 1: Project Details */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">01</span>
                Project Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Bathroom Sink Leak Repair"
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Service Category</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value as TradeType})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                  >
                    {Object.values(TradeType).map(trade => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Description</label>
                  <textarea 
                    rows={5} 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                    placeholder="Describe exactly what you need. Include details about materials, access, timing, etc."
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 2: Location */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">02</span>
                Location
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Address / Area</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. 123 High Street, London"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Zipcode / Postcode</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="SW1A 1AA"
                    value={formData.zipcode}
                    onChange={e => setFormData({...formData, zipcode: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Budget */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">03</span>
                Budget
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Budget (£)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    placeholder="500"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                  />
                  <p className="mt-2 text-xs text-gray-500">Enter your approximate budget for this project</p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-8 border-t border-gray-50">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting Project...' : 'Post Project to Marketplace'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostProjectPage;