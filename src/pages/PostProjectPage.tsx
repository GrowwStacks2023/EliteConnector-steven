
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TradeType } from '../../types';
import Swal from 'sweetalert2';

interface PostProjectPageProps {
  user: User;
}

const PostProjectPage: React.FC<PostProjectPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    serviceRequired: TradeType.PLUMBER,
    location: '',
    description: '',
    budget: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    Swal.fire({
      title: 'Project Posted!',
      text: 'Your project has been successfully submitted to the marketplace. Verified tradespeople in your area will be notified.',
      icon: 'success',
      confirmButtonColor: '#4f46e5'
    }).then(() => {
      navigate('/profile');
    });
  };

  return (
    <div className="bg-indigo-50/50 min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Post Your Project</h1>
          <p className="text-gray-600 font-medium">Tell us what you need, and we'll find the best pros for the job.</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-50">
          <form onSubmit={handleSubmit} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
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
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Service Category</label>
                  <select 
                    value={formData.serviceRequired}
                    onChange={e => setFormData({...formData, serviceRequired: e.target.value as TradeType})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                  >
                    {Object.values(TradeType).map(trade => (
                      <option key={trade} value={trade}>{trade}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Location (City/Postcode)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="London, SE1"
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Estimated Budget (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. £200 - £500"
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                  />
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Description</label>
                  <textarea 
                    rows={10} 
                    required
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all" 
                    placeholder="Describe exactly what you need. The more detail, the better for the pros..."
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50">
              <button type="submit" className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-1 transition-all active:scale-[0.98]">
                Post Project to Marketplace
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostProjectPage;
