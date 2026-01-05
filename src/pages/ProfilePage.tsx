import React, { useState } from 'react';
import { User, UserRole, TradeType, Project } from '../../types';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (user: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'details' | 'portfolio'>('details');
  const [isEditingProject, setIsEditingProject] = useState(false);
  const [currentProject, setCurrentProject] = useState<Partial<Project>>({
    title: '',
    description: '',
    images: []
  });

  const [formData, setFormData] = useState({
    fullName: user.fullName || '',
    email: user.email || '',
    phone: user.phone || '',
    password: '',
    confirmPassword: '',
    experience: user.experience || '',
    age: user.age || '',
    gender: user.gender || '',
    address: user.address || '',
    zipcode: user.zipcode || '',
    tradeTypes: user.tradeTypes || [],
    insuranceDetails: user.insuranceDetails || '',
    qualifications: user.qualifications || '',
    operatingRadius: user.operatingRadius || 10,
    projects: user.projects || []
  });

  const handleToggleTrade = (trade: TradeType) => {
    setFormData(prev => ({
      ...prev,
      tradeTypes: prev.tradeTypes.includes(trade)
        ? prev.tradeTypes.filter(t => t !== trade)
        : [...prev.tradeTypes, trade]
    }));
  };

 const handleSaveProfile = async (e?: React.FormEvent) => {
  if (e) e.preventDefault();

  // Get user from localStorage
  const storedUser = localStorage.getItem('user');
  if (!storedUser) {
    Swal.fire('Error', 'User session not found. Please log in again.', 'error');
    navigate('/login');
    return;
  }

  const currentUser = JSON.parse(storedUser);
  const userId = currentUser.id;

  if (user.role === UserRole.ADMIN || user.role === UserRole.CLIENT) {
    if (formData.password && formData.password !== formData.confirmPassword) {
      Swal.fire('Error', 'Passwords do not match', 'error');
      return;
    }

    try {
      // Update Supabase for Admin/Client
      const { error: updateError } = await supabase
        .from('user')
        .update({
          full_name: formData.fullName,
          email: formData.email,
          address: formData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

      const updatedUser: User = {
        ...currentUser,
        fullName: formData.fullName,
        email: formData.email,
        address: formData.address,
        isProfileComplete: true
      };

      // Update localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));

      onUpdateProfile(updatedUser);

      Swal.fire({
        title: 'Profile Updated',
        text: 'Your account information has been successfully saved.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });
    } catch (err: any) {
      console.error('Profile update error:', err);
      Swal.fire('Error', err.message || 'Failed to update profile', 'error');
    }
    return;
  }

  // Check all mandatory fields for Service Provider
  const isNowComplete = !!(
    formData.fullName.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.experience.trim() !== '' &&
    formData.age !== '' &&
    formData.gender !== '' &&
    formData.address.trim() !== '' &&
    formData.zipcode.trim() !== '' &&
    formData.insuranceDetails.trim() !== '' &&
    formData.qualifications.trim() !== '' &&
    formData.operatingRadius > 0 &&
    formData.tradeTypes.length > 0
  );

  try {
    // Update Supabase database with ALL profile fields
    const { error: updateError } = await supabase
      .from('user')
      .update({
        full_name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        experience: formData.experience,
        age: Number(formData.age),
        gender: formData.gender,
        address: formData.address,
        zipcode: formData.zipcode,
        insurance_details: formData.insuranceDetails,
        qualifications: formData.qualifications,
        serviceType: formData.tradeTypes.join(','),
        operating_radius: formData.operatingRadius,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (updateError) throw updateError;

    console.log('✅ All profile fields updated in Supabase for user:', userId);

    // Create updated user object
    const updatedUser: User = {
      ...currentUser,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      experience: formData.experience,
      age: Number(formData.age),
      gender: formData.gender,
      address: formData.address,
      zipcode: formData.zipcode,
      tradeTypes: formData.tradeTypes,
      insuranceDetails: formData.insuranceDetails,
      qualifications: formData.qualifications,
      operatingRadius: Number(formData.operatingRadius),
      projects: formData.projects,
      isProfileComplete: isNowComplete
    };

    // Update localStorage with complete user object
    localStorage.setItem('user', JSON.stringify(updatedUser));

    console.log('✅ localStorage updated with all fields:', updatedUser);

    onUpdateProfile(updatedUser);

    if (e) {
      if (isNowComplete) {
        Swal.fire({
          title: 'Verification Successful!',
          text: 'Your professional credentials and portfolio have been updated. Your account is now fully verified.',
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          navigate('/dashboard');
        });
      } else {
        Swal.fire({
          title: 'Compliance Incomplete',
          text: 'Profile saved. However, to access the Lead Marketplace, you must fill in ALL fields and select at least one Trade Service.',
          icon: 'warning',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  } catch (err: any) {
    console.error('Profile update error:', err);
    Swal.fire('Error', err.message || 'Failed to update profile', 'error');
  }
};
  // Admin & Client simplified view
  if (user.role === UserRole.ADMIN || user.role === UserRole.CLIENT) {
    return (
      <div className="bg-gray-50 min-h-screen py-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link to={user.role === UserRole.ADMIN ? "/admin" : "/"} className="text-indigo-600 font-bold hover:underline flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Back to Home
            </Link>
          </div>

          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100">
            <div className="bg-indigo-600 p-10 text-white">
              <h2 className="text-3xl font-extrabold brand-font">{user.role === UserRole.ADMIN ? 'Admin Settings' : 'Client Profile'}</h2>
              <p className="text-indigo-100 mt-2">Manage your core account information</p>
            </div>

            <form onSubmit={handleSaveProfile} className="p-10 space-y-8">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                  />
                </div>
                {user.role === UserRole.CLIENT && (
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Project Location / City</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                      placeholder="e.g. London, UK"
                    />
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">New Password</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700 transition-all"
              >
                Save Profile Changes
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Service Provider Portfolio Management
  const handleAddProject = () => {
    setCurrentProject({ title: '', description: '', images: [] });
    setIsEditingProject(true);
  };

  const handleSaveProject = () => {
    if (!currentProject.title || !currentProject.description) {
      Swal.fire('Incomplete', 'Title and Description are required for projects.', 'error');
      return;
    }

    const newProject: Project = {
      id: currentProject.id || `proj-${Date.now()}`,
      title: currentProject.title,
      description: currentProject.description,
      images: currentProject.images || [],
      dateCompleted: new Date().toLocaleDateString()
    };

    setFormData(prev => {
      const existingIndex = prev.projects.findIndex(p => p.id === newProject.id);
      let updatedProjects = [...prev.projects];
      if (existingIndex > -1) {
        updatedProjects[existingIndex] = newProject;
      } else {
        updatedProjects = [newProject, ...prev.projects];
      }
      return { ...prev, projects: updatedProjects };
    });

    setIsEditingProject(false);
  };

  const handleDeleteProject = (id: string) => {
    setFormData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id)
    }));
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

  // Service Provider Profile View
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Navigation Header */}
<div className="mb-10 flex flex-col sm:flex-row items-center justify-between gap-4">
  <h1 className="text-3xl font-extrabold text-gray-900 brand-font">Profile & Verification</h1>
  
  <div className="flex gap-3">
    <Link
      to="/portfolio"
      className="bg-purple-50 text-purple-700 px-6 py-2.5 rounded-xl font-bold border border-purple-100 hover:bg-purple-100 transition-all"
    >
      📸 My Portfolio
    </Link>
    
    {user.isProfileComplete && (
      <button
        onClick={() => navigate('/dashboard')}
        className="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-xl font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
      >
        Marketplace Dashboard
      </button>
    )}
  </div>
</div>

        <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border border-gray-100 relative min-h-[600px]">
          {activeTab === 'details' ? (
            <>
              <div className="bg-indigo-50 h-32 relative">
                <div className="absolute -bottom-10 left-12 w-24 h-24 bg-white rounded-[1.5rem] shadow-lg flex items-center justify-center text-3xl font-bold text-indigo-700 border-4 border-white uppercase overflow-hidden">
                  {formData.fullName.charAt(0) || user.fullName.charAt(0)}
                </div>
                {!user.isProfileComplete && (
                  <div className="absolute top-6 right-6 px-4 py-2 bg-rose-600 text-white text-[10px] font-bold rounded-full animate-pulse shadow-lg uppercase tracking-widest">
                    Incomplete Verification
                  </div>
                )}
              </div>

              <div className="pt-16 pb-12 px-8 sm:px-12">
                <form onSubmit={handleSaveProfile} className="space-y-12">
                  {/* Section 1: Business Identity */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                      <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">01</span>
                      Business Identity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Full Name & Email */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Full Legal Name</label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                          />
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Phone Number</label>
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={e => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                          placeholder="+44 20 1234 5678"
                        />
                      </div>

                      {/* Age & Gender */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Age</label>
                          <input
                            type="number"
                            required
                            value={formData.age}
                            onChange={e => setFormData({ ...formData, age: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Gender</label>
                          <select
                            required
                            value={formData.gender}
                            onChange={e => setFormData({ ...formData, gender: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                          >
                            <option value="">Select</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      {/* Address & Zipcode */}
                      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Business/Office Address</label>
                          <textarea
                            required
                            rows={2}
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                            placeholder="123 Main Street, London"
                          ></textarea>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Zipcode / Postcode</label>
                          <input
                            type="text"
                            required
                            value={formData.zipcode}
                            onChange={e => setFormData({ ...formData, zipcode: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                            placeholder="SW1A 1AA"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Trade Selection Section */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                      <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">02</span>
                      Trade Categories
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">Select all services you provide. You will only see leads matching these categories.</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {Object.values(TradeType).map(trade => (
                        <button
                          key={trade}
                          type="button"
                          onClick={() => handleToggleTrade(trade)}
                          className={`px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.tradeTypes.includes(trade)
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                            }`}
                        >
                          {trade}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Section 2: Professional Verification */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                      <span className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">03</span>
                      Compliance & Credentials
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Public Liability Insurance</label>
                          <input
                            type="text"
                            required
                            value={formData.insuranceDetails}
                            onChange={e => setFormData({ ...formData, insuranceDetails: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                            placeholder="e.g. AXA-123456"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Trade Experience</label>
                          <input
                            type="text"
                            required
                            value={formData.experience}
                            onChange={e => setFormData({ ...formData, experience: e.target.value })}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                            placeholder="e.g. 10 Years"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Qualifications</label>
                        <textarea
                          required
                          rows={5}
                          value={formData.qualifications}
                          onChange={e => setFormData({ ...formData, qualifications: e.target.value })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium transition-all"
                          placeholder="List your certifications (NVQ, Gas Safe, etc.)"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Coverage */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">04</span>
                      Logistics
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Operating Radius (Miles)</label>
                        <div className="flex items-center space-x-6">
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={formData.operatingRadius}
                            onChange={e => setFormData({ ...formData, operatingRadius: Number(e.target.value) })}
                            className="flex-grow accent-indigo-600"
                          />
                          <div className="w-20 text-center py-2 bg-indigo-50 border border-indigo-100 rounded-xl font-extrabold text-indigo-700">
                            {formData.operatingRadius} Mi
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      className="flex-grow py-5 bg-indigo-600 text-white rounded-2xl font-bold text-xl shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                      Save Profile & Verification
                    </button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="p-8 sm:p-12 min-h-[600px] flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 brand-font">Portfolio Showcase</h2>
                  <p className="text-gray-500 font-medium">Manage images and details of your best projects.</p>
                </div>
                {!isEditingProject && (
                  <button
                    onClick={handleAddProject}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 transition-all flex items-center"
                  >
                    <span className="text-xl mr-2">+</span> Add Project
                  </button>
                )}
              </div>

              {isEditingProject ? (
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
                    <div>
                      <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Project Gallery</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        {currentProject.images?.map((img, i) => (
                          <div key={i} className="relative group aspect-square rounded-xl overflow-hidden shadow-sm">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button
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
                        onClick={handleSaveProject}
                        className="flex-grow py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-md hover:bg-indigo-700 transition-all"
                      >
                        {currentProject.id ? 'Update Project' : 'Publish to Portfolio'}
                      </button>
                      <button
                        onClick={() => setIsEditingProject(false)}
                        className="px-8 py-4 bg-white text-gray-500 rounded-xl font-bold border border-gray-100 hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-grow">
                  {formData.projects.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {formData.projects.map(proj => (
                        <div key={proj.id} className="group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all h-64 flex flex-col">
                          <div className="h-40 relative bg-gray-100">
                            {proj.images.length > 0 ? (
                              <img src={proj.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs italic">No images</div>
                            )}
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                              <button
                                onClick={() => { setCurrentProject(proj); setIsEditingProject(true); }}
                                className="p-3 bg-white text-indigo-600 rounded-full font-bold shadow-lg hover:scale-110 transition-transform"
                              >
                                ✏️
                              </button>
                              <button
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
                        onClick={handleAddProject}
                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-xl hover:bg-indigo-700 transition-all"
                      >
                        Add Your First Project
                      </button>
                    </div>
                  )}

                  <div className="mt-12 pt-8 border-t border-gray-50 flex justify-center">
                    <button
                      onClick={handleSaveProfile}
                      className="px-12 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition-all shadow-lg"
                    >
                      Save Portfolio Changes
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Help Tip */}
        <div className="mt-12 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex items-start space-x-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💡</div>
          <div>
            <h4 className="font-bold text-purple-900">Why a portfolio matters?</h4>
            <p className="text-sm text-purple-700/80 leading-relaxed font-medium">
              Pro accounts with at least 3 high-quality projects receive 45% more lead conversions.
              Showcase your range and quality to make selecting you an easy choice for clients.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;