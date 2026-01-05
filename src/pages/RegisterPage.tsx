import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, TradeType } from '../../types';

interface RegisterPageProps {
  onRegister: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const [role, setRole] = useState<UserRole>(UserRole.SERVICE_PROVIDER);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    selectedTrades: [] as TradeType[]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const tradeOptions = Object.values(TradeType);

  const toggleTrade = (trade: TradeType) => {
    setFormData(prev => ({
      ...prev,
      selectedTrades: prev.selectedTrades.includes(trade)
        ? prev.selectedTrades.filter(t => t !== trade)
        : [...prev.selectedTrades, trade]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (role === UserRole.SERVICE_PROVIDER && formData.selectedTrades.length === 0) {
      setError("Please select at least one trade service.");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: role
          }
        }
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('User creation failed');

      // Step 2: Insert into user table
      const { error: userError } = await supabase
        .from('user')
        .insert({
          id: authData.user.id,
          email: formData.email,
          role: role,
          serviceType: role === UserRole.SERVICE_PROVIDER ? formData.selectedTrades.join(',') : null,
          operating_radius: role === UserRole.SERVICE_PROVIDER ? 10 : null,
          is_verified: false,
          is_active: true,
        });

      if (userError) throw userError;

      // Step 3: Create complete user object
      const newUser: User = {
        id: authData.user.id,
        email: formData.email,
        fullName: formData.fullName,
        role: role,
        tradeTypes: role === UserRole.SERVICE_PROVIDER ? formData.selectedTrades : [],
        credits: role === UserRole.SERVICE_PROVIDER ? 5 : 0,
        rating: 5.0,
        isProfileComplete: role === UserRole.CLIENT,
        projects: []
      };

      // Store complete user object in localStorage
      localStorage.setItem('user', JSON.stringify(newUser));
      
      console.log('✅ User registered and stored in localStorage:', newUser);

      onRegister(newUser);

      // Step 4: Redirect
      if (role === UserRole.SERVICE_PROVIDER) {
        navigate('/profile');
      } else {
        navigate('/post-project');
      }

    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50/50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-gray-900 brand-font mb-4">Join Elite Connector</h2>
          <p className="text-gray-600 font-medium">Connect with top-tier talent or find your next project.</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100 overflow-hidden border border-indigo-50">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setRole(UserRole.SERVICE_PROVIDER)}
              className={`flex-1 py-6 font-bold text-sm transition-all ${role === UserRole.SERVICE_PROVIDER ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              I am a Pro (Service Provider)
            </button>
            <button
              onClick={() => setRole(UserRole.CLIENT)}
              className={`flex-1 py-6 font-bold text-sm transition-all ${role === UserRole.CLIENT ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              I am a Client (Need Work Done)
            </button>
          </div>

          <div className="p-10">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-black"
                  placeholder="Minimum 6 characters"
                />
              </div>

              {role === UserRole.SERVICE_PROVIDER && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-4">Which services do you provide? (Mandatory)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {tradeOptions.map(trade => (
                      <button
                        key={trade}
                        type="button"
                        onClick={() => toggleTrade(trade)}
                        className={`px-4 py-3 rounded-xl border-2 text-xs font-bold transition-all ${formData.selectedTrades.includes(trade)
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                          }`}
                      >
                        {trade}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-gray-50 flex flex-col items-center">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : role === UserRole.SERVICE_PROVIDER ? 'Create Your Elite Pro Profile' : 'Register as Client'}
                </button>
                <p className="mt-4 text-gray-500 text-sm">
                  Already have an account? <Link to="/login" className="text-indigo-600 font-bold">Log in here</Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;