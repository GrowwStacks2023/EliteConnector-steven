import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, TradeType } from '../../types';

interface RegisterPageProps {
  onRegister: (user: User) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister }) => {
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>(UserRole.SERVICE_PROVIDER);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    selectedTrades: [] as TradeType[]
  });

  // Check if email already exists
  const checkEmailExists = async (email: string): Promise<{ exists: boolean; role?: UserRole; fullName?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();

      const { data, error } = await supabase
        .from('user')
        .select('email, role, full_name')
        .eq('email', normalizedEmail)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking email:', error);
        return { exists: false };
      }

      if (data) {
        return {
          exists: true,
          role: data.role as UserRole,
          fullName: data.full_name
        };
      }

      return { exists: false };
    } catch (err) {
      console.error('💥 EXCEPTION in email check:', err);
      return { exists: false };
    }
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
      // STEP 1: Check if email exists
      console.log('🔍 Checking if email exists...');
      const emailCheck = await checkEmailExists(formData.email);

      if (emailCheck.exists) {
        const roleDisplay = emailCheck.role === UserRole.SERVICE_PROVIDER
          ? 'Service Provider'
          : emailCheck.role === UserRole.CLIENT
            ? 'Client'
            : 'Admin';

        setError(`This email is already registered as a ${roleDisplay}. Please log in instead or use a different email.`);
        setLoading(false);
        return;
      }

      console.log('✅ Email available');

      // STEP 2: Create auth user
      console.log('🔐 Creating auth account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            full_name: formData.fullName,
            role: role
          }
        }
      });

      if (authError) {
        console.error('❌ Auth error:', authError);

        if (authError.message.includes('User already registered') ||
          authError.message.includes('already been registered')) {
          setError('This email is already registered. Please log in instead.');
        } else if (authError.message.includes('Email rate limit')) {
          setError('Too many signup attempts. Please wait a few minutes and try again.');
        } else {
          setError('Unable to create account. Please try again.');
        }
        setLoading(false);
        return;
      }

      if (!authData.user) {
        console.error('❌ No user object returned');
        setError('Account creation failed. Please try again.');
        setLoading(false);
        return;
      }

     console.log('✅ Auth user created:', authData.user.id);

// Wait a bit for Supabase to process
await new Promise(resolve => setTimeout(resolve, 1500));

// STEP 3: Create database record (skip session check)
console.log('💾 Creating database record...');
const { data: insertData, error: userError } = await supabase
  .from('user')
  .insert({
    id: authData.user.id,
    email: formData.email.toLowerCase().trim(),
    full_name: formData.fullName.trim(),
    phone: role === UserRole.CLIENT ? formData.phone?.trim() : null,
    role: role,
    serviceType: role === UserRole.SERVICE_PROVIDER ? formData.selectedTrades.join(',') : null,
    operating_radius: role === UserRole.SERVICE_PROVIDER ? 10 : null,
    is_verified: false,
    is_active: true,
  })
  .select()
  .single();

if (userError) {
  console.error('❌ Database error:', userError);

  if (userError.code === '42501') {
    setError('Registration error. Please contact support.');
  } else if (userError.code === '23505') {
    setError('This email is already registered.');
  } else {
    setError('Unable to complete registration. Please try again.');
  }

  setLoading(false);
  return;
}

console.log('✅ Database record created:', insertData);

// Check if email confirmation is required
const { data: { user: confirmedUser } } = await supabase.auth.getUser();
const needsEmailConfirmation = confirmedUser && !confirmedUser.email_confirmed_at;

if (needsEmailConfirmation) {
  // Email confirmation required - direct to login
  alert('✅ Account created successfully!\n\nPlease check your email to confirm your account, then log in.');
  setLoading(false);
  navigate('/login');
  return;
}

// STEP 4: Session exists - create user object and login
const { data: { session: activeSession } } = await supabase.auth.getSession();

if (activeSession) {
  // User can login immediately
  const newUser: User = {
    id: authData.user.id,
    email: formData.email.toLowerCase().trim(),
    fullName: formData.fullName.trim(),
    phone: role === UserRole.CLIENT ? formData.phone?.trim() : undefined,
    role: role,
    tradeTypes: role === UserRole.SERVICE_PROVIDER ? formData.selectedTrades : [],
    credits: role === UserRole.SERVICE_PROVIDER ? 5 : 0,
    rating: 5.0,
    isProfileComplete: role === UserRole.CLIENT,
    projects: []
  };

  localStorage.setItem('user', JSON.stringify(newUser));
  onRegister(newUser);

  console.log('✅ Registration complete! Redirecting...');

  if (role === UserRole.SERVICE_PROVIDER) {
    navigate('/profile');
  } else {
    navigate('/client-home');
  }
} else {
  // No session but account created - direct to login
  alert('✅ Account created successfully! Please log in to continue.');
  setLoading(false);
  navigate('/login');
}
      // Navigate based on role
      if (role === UserRole.SERVICE_PROVIDER) {
        navigate('/profile');
      } else {
        navigate('/client-home');
      }

    } catch (err: any) {
      console.error('💥 UNEXPECTED ERROR:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  const toggleTrade = (trade: TradeType) => {
    setFormData(prev => ({
      ...prev,
      selectedTrades: prev.selectedTrades.includes(trade)
        ? prev.selectedTrades.filter(t => t !== trade)
        : [...prev.selectedTrades, trade]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-gray-900 brand-font mb-3">Join Elite</h1>
          <p className="text-gray-600 font-medium">Create your account and get started</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <div className="flex items-start">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <div>
                <p className="text-red-800 text-sm font-semibold">{error}</p>
                {error.includes('already registered') && (
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-2 text-indigo-600 text-sm font-bold hover:underline"
                  >
                    Go to Login →
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-2xl rounded-[3rem] p-8 border border-gray-50">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setRole(UserRole.SERVICE_PROVIDER)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm transition-all ${role === UserRole.SERVICE_PROVIDER
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
            >
              🔧 I am a Pro<br />
              <span className="text-xs opacity-80">(Service Provider)</span>
            </button>
            <button
              type="button"
              onClick={() => setRole(UserRole.CLIENT)}
              className={`py-4 px-4 rounded-2xl font-bold text-sm transition-all ${role === UserRole.CLIENT
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                }`}
            >
              🏠 I am a Client<br />
              <span className="text-xs opacity-80">(Need Work Done)</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                placeholder="John Doe"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                placeholder="john@example.com"
              />
            </div>

            {/* Phone (Only for Clients) */}
            {role === UserRole.CLIENT && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                  placeholder="+44 7700 123456"
                />
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            {/* Trade Selection (Only for Service Providers) */}
            {role === UserRole.SERVICE_PROVIDER && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Select Your Trade(s)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(TradeType).map(trade => (
                    <button
                      key={trade}
                      type="button"
                      onClick={() => toggleTrade(trade)}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${formData.selectedTrades.includes(trade)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                    >
                      {trade}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : role === UserRole.SERVICE_PROVIDER ? (
                'Create Your Elite Pro Profile'
              ) : (
                'Create Client Account'
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-indigo-600 font-bold hover:underline"
              >
                Log in
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;