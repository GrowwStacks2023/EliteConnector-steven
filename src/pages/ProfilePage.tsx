import React, { useState } from 'react';
import { User, UserRole, TradeType, Project } from '../../types';
import Swal from 'sweetalert2';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (user: User) => void;
}

// UK Postcode Areas
const UK_POSTCODE_AREAS = [
  'AB', 'AL', 'B', 'BA', 'BB', 'BD', 'BH', 'BL', 'BN', 'BR', 'BS', 'BT',
  'CA', 'CB', 'CF', 'CH', 'CM', 'CO', 'CR', 'CT', 'CV', 'CW',
  'DA', 'DD', 'DE', 'DG', 'DH', 'DL', 'DN', 'DT', 'DY',
  'E', 'EC', 'EH', 'EN', 'EX',
  'FK', 'FY',
  'G', 'GL', 'GU',
  'HA', 'HD', 'HG', 'HP', 'HR', 'HS', 'HU', 'HX',
  'IG', 'IP', 'IV',
  'KA', 'KT', 'KW', 'KY',
  'L', 'LA', 'LD', 'LE', 'LL', 'LN', 'LS', 'LU',
  'M', 'ME', 'MK', 'ML',
  'N', 'NE', 'NG', 'NN', 'NP', 'NR', 'NW',
  'OL', 'OX',
  'PA', 'PE', 'PH', 'PL', 'PO', 'PR',
  'RG', 'RH', 'RM',
  'S', 'SA', 'SE', 'SG', 'SK', 'SL', 'SM', 'SN', 'SO', 'SP', 'SR', 'SS', 'ST', 'SW', 'SY',
  'TA', 'TD', 'TF', 'TN', 'TQ', 'TR', 'TS', 'TW',
  'UB',
  'W', 'WA', 'WC', 'WD', 'WF', 'WN', 'WR', 'WS', 'WV',
  'YO',
  'ZE'
];

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
    postcode_areas: user.postcode_areas || [],
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

  const handleTogglePostcodeArea = (area: string) => {
    setFormData(prev => ({
      ...prev,
      postcode_areas: prev.postcode_areas.includes(area)
        ? prev.postcode_areas.filter(a => a !== area)
        : [...prev.postcode_areas, area]
    }));
  };

  const handleSelectAllPostcodes = () => {
    setFormData(prev => ({
      ...prev,
      postcode_areas: UK_POSTCODE_AREAS
    }));
  };

  const handleClearAllPostcodes = () => {
    setFormData(prev => ({
      ...prev,
      postcode_areas: []
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
      formData.postcode_areas.length > 0 &&
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
          postcode_areas: formData.postcode_areas,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (updateError) throw updateError;

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
        postcode_areas: formData.postcode_areas,
        projects: formData.projects,
        isProfileComplete: isNowComplete
      };

      // Update localStorage with complete user object
      localStorage.setItem('user', JSON.stringify(updatedUser));
      onUpdateProfile(updatedUser);

      if (e) {
        if (isNowComplete) {
          Swal.fire({
            title: 'Verification Successful!',
            text: 'Your professional credentials have been updated. Your account is now fully verified.',
            icon: 'success',
            confirmButtonColor: '#4f46e5'
          }).then(() => {
            navigate('/dashboard');
          });
        } else {
          Swal.fire({
            title: 'Compliance Incomplete',
            text: 'Profile saved. However, to access the Lead Marketplace, you must fill in ALL fields including service areas.',
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

  // Admin & Client simplified view (unchanged)
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

  // Portfolio handlers (unchanged)
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

                  {/* Section 3: Service Coverage - Postcode Areas */}
                  <div className="space-y-6">
                    <h2 className="text-xl font-bold text-gray-900 brand-font flex items-center">
                      <span className="w-8 h-8 bg-green-100 text-green-600 rounded-lg flex items-center justify-center mr-3 text-sm font-bold">04</span>
                      Service Coverage Areas
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                      Select the UK postcode areas you want to serve. You will only see leads from these areas.
                      {formData.postcode_areas.length > 0 && (
                        <span className="ml-2 font-bold text-indigo-600">
                          ({formData.postcode_areas.length} selected)
                        </span>
                      )}
                    </p>

                    {/* Quick Actions */}
                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={handleSelectAllPostcodes}
                        className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold border border-indigo-100 hover:bg-indigo-100 transition-all"
                      >
                        Select All
                      </button>
                      <button
                        type="button"
                        onClick={handleClearAllPostcodes}
                        className="px-4 py-2 bg-gray-50 text-gray-700 rounded-lg text-xs font-bold border border-gray-200 hover:bg-gray-100 transition-all"
                      >
                        Clear All
                      </button>
                    </div>

                    {/* Postcode Grid */}
                    <div className="max-h-96 overflow-y-auto bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
                        {UK_POSTCODE_AREAS.map(area => (
                          <button
                            key={area}
                            type="button"
                            onClick={() => handleTogglePostcodeArea(area)}
                            className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                              formData.postcode_areas.includes(area)
                                ? 'bg-indigo-600 text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                            }`}
                          >
                            {area}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.postcode_areas.length === 0 && (
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-sm text-amber-700">
                          ⚠️ You must select at least one postcode area to receive leads.
                        </p>
                      </div>
                    )}
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
            // Portfolio tab (unchanged - keeping it as is)
            <div className="p-8 sm:p-12 min-h-[600px] flex flex-col">
              {/* ... portfolio content remains unchanged ... */}
            </div>
          )}
        </div>

        {/* Help Tip */}
        <div className="mt-12 p-8 bg-purple-50 rounded-[2.5rem] border border-purple-100 flex items-start space-x-6">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-xl shadow-sm">💡</div>
          <div>
            <h4 className="font-bold text-purple-900">Service Area Selection</h4>
            <p className="text-sm text-purple-700/80 leading-relaxed font-medium">
              Select multiple postcode areas to maximize your lead opportunities. You can update your service areas anytime based on your capacity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;