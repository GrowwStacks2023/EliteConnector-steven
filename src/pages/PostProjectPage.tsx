import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, TradeType } from '../../types';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

interface PostProjectPageProps {
  user: User;
}

// Trade type icons mapping
const TRADE_ICONS: Record<TradeType, { icon: string; label: string }> = {
  [TradeType.PLUMBER]: { icon: '🚰', label: 'Plumbing' },
  [TradeType.ELECTRICIAN]: { icon: '💡', label: 'Electrics' },
  [TradeType.CARPENTER]: { icon: '🔨', label: 'Carpentry / Joinery' },
  [TradeType.PAINTER]: { icon: '🎨', label: 'Painting & Decorating' },
  [TradeType.BUILDER]: { icon: '🧱', label: 'Building' },
  [TradeType.ROOFER]: { icon: '🏠', label: 'Roofing' },
  [TradeType.GARDENER]: { icon: '🌿', label: 'Gardening & Landscaping' },
  [TradeType.CLEANER]: { icon: '🧹', label: 'Cleaning' },
  [TradeType.HANDYMAN]: { icon: '🔧', label: 'Handywork' },
  [TradeType.TILER]: { icon: '◼️', label: 'Tiling' },
  [TradeType.PLASTERER]: { icon: '🔨', label: 'Plastering & Rendering' },
  [TradeType.FLOORING]: { icon: '📐', label: 'Flooring' },
  [TradeType.BATHROOM]: { icon: '🛁', label: 'Bathroom Fitting' },
  [TradeType.HEATING]: { icon: '🔥', label: 'Heating / Gas Work' },
  [TradeType.WINDOWS]: { icon: '🪟', label: 'Windows' },
  [TradeType.OTHER]: { icon: '⚙️', label: 'Other' },
};

const TIMEFRAME_OPTIONS = [
  { value: 'immediate', label: '🔥 Immediate / Urgent', description: 'Need help today or tomorrow' },
  { value: '7_days', label: '📅 Within 7 Days', description: 'Within the next week' },
  { value: '10_days', label: '📆 Within 10 Days', description: 'Within 10 days' },
  { value: '30_days', label: '🗓️ Within 30 Days', description: 'Within a month' },
  { value: '90_days', label: '📊 Within 90 Days', description: 'Within 3 months' },
  { value: 'flexible', label: '⏰ Flexible Timeline', description: 'No rush, anytime' }
];

const PostProjectPage: React.FC<PostProjectPageProps> = ({ user }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<'select-trade' | 'form'>('select-trade');
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    category: TradeType.PLUMBER,
    location: '',
    zipcode: '',
    description: '',
    budget: '',
    timeframe: 'flexible',
    images: [] as string[]
  });

  const handleTradeSelect = (trade: TradeType) => {
    setFormData({ ...formData, category: trade });
    setStep('form');
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (formData.images.length + files.length > 5) {
      Swal.fire('Too Many Images', 'You can upload a maximum of 5 images.', 'warning');
      return;
    }

    setUploadingImages(true);

    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        if (!file.type.startsWith('image/')) {
          Swal.fire('Invalid File', `${file.name} is not an image file.`, 'error');
          continue;
        }

        if (file.size > 5 * 1024 * 1024) {
          Swal.fire('File Too Large', `${file.name} exceeds 5MB limit.`, 'error');
          continue;
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { data, error } = await supabase.storage
          .from('job-images')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('job-images')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));

      Swal.fire({
        title: 'Images Uploaded!',
        text: `${uploadedUrls.length} image(s) added successfully.`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (err: any) {
      console.error('❌ Error uploading images:', err);
      Swal.fire('Upload Failed', err.message || 'Failed to upload images.', 'error');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        Swal.fire('Error', 'Please log in again.', 'error');
        navigate('/login');
        return;
      }

      const currentUser = JSON.parse(storedUser);

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
          timeframe: formData.timeframe,
          images: formData.images,
          status: 'open',
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      Swal.fire({
        title: 'Project Posted!',
        html: `
          <p>Your project has been successfully submitted to the marketplace.</p>
          <p class="text-sm text-gray-600 mt-2">Verified professionals in your area will be notified.</p>
        `,
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

  // Trade Selection Step
  if (step === 'select-trade') {
    return (
      <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">What type of work do you need doing?</h1>
            <p className="text-gray-600 font-medium">Select the service you need</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(TRADE_ICONS).map(([trade, { icon, label }]) => (
              <button
                key={trade}
                onClick={() => handleTradeSelect(trade as TradeType)}
                className="bg-white p-6 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 hover:shadow-xl transition-all flex flex-col items-center justify-center gap-3 group"
              >
                <span className="text-5xl group-hover:scale-110 transition-transform">{icon}</span>
                <span className="font-bold text-gray-800 text-center text-sm">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  

  // Form Step (existing form code)
  return (
    <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <button
            onClick={() => setStep('select-trade')}
            className="mb-4 text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-2 mx-auto"
          >
            ← Back to Category Selection
          </button>
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
                    {Object.entries(TRADE_ICONS).map(([trade, { label }]) => (
                      <option key={trade} value={trade}>{label}</option>
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

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Timeline</label>
                  <select
                    value={formData.timeframe}
                    onChange={e => setFormData({...formData, timeframe: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                  >
                    {TIMEFRAME_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label} - {option.description}
                      </option>
                    ))}
                  </select>
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
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all uppercase" 
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Images */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">03</span>
                Project Images
                <span className="ml-2 text-xs font-normal text-gray-400">(Optional)</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImages || formData.images.length >= 5}
                    />
                    <div className={`px-6 py-3 rounded-xl border-2 border-dashed transition-all ${
                      uploadingImages || formData.images.length >= 5
                        ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed'
                        : 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100 cursor-pointer'
                    }`}>
                      <span className="font-bold text-sm">
                        {uploadingImages ? '⏳ Uploading...' : '📷 Upload Images'}
                      </span>
                    </div>
                  </label>
                  <p className="text-xs text-gray-500">
                    Add photos of the area/problem (Max 5 images, 5MB each)
                  </p>
                </div>

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {formData.images.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Project ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl border-2 border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-bold"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section 4: Budget */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">04</span>
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
                disabled={loading || uploadingImages}
                className="w-full py-5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-[2rem] font-bold text-xl shadow-xl shadow-indigo-100 hover:shadow-2xl hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Posting Project...' : uploadingImages ? 'Uploading Images...' : 'Post Project to Marketplace'}
              </button>
            </div>
          </form>
        </div>

        {/* Help Tip */}
        <div className="mt-8 p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex items-start space-x-4">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-xl shadow-sm flex-shrink-0">💡</div>
          <div>
            <h4 className="font-bold text-blue-900">Pro Tip</h4>
            <p className="text-sm text-blue-700/80 leading-relaxed">
              Adding clear photos helps professionals understand your project better and provide more accurate quotes. Include multiple angles if possible!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostProjectPage;