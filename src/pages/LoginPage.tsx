import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, TradeType } from '../../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true); // Check existing session
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Check if user is already logged in on component mount
  // Check if user is already logged in on component mount
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        // IMPORTANT: Skip auto-login check if we're on password reset flow
        const urlParams = new URLSearchParams(window.location.hash.substring(1));
        const isPasswordReset = urlParams.get('type') === 'recovery';

        if (isPasswordReset) {
          console.log('⚠️ Password reset flow detected, skipping auto-login');
          setChecking(false);
          return;
        }

        // Check localStorage first
        const storedUser = localStorage.getItem('user');

        if (storedUser) {
          const user: User = JSON.parse(storedUser);
          console.log('✅ Found existing user in localStorage:', user);

          // Verify session with Supabase
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();

          if (session && !sessionError) {
            console.log('✅ Valid Supabase session found');

            // Update app state
            onLogin(user);

            // Redirect based on role and profile completion
            if (user.role === UserRole.ADMIN) {
              navigate('/admin', { replace: true });
            } else if (user.role === UserRole.SERVICE_PROVIDER) {
              if (user.isProfileComplete) {
                navigate('/dashboard', { replace: true });
              } else {
                navigate('/profile', { replace: true });
              }
            } else if (user.role === UserRole.CLIENT) {
              navigate('/post-project', { replace: true });
            }
          } else {
            // Session expired, clear localStorage
            console.log('⚠️ Session expired, clearing localStorage');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Session check error:', err);
        localStorage.removeItem('user');
      } finally {
        setChecking(false);
      }
    };

    checkExistingSession();
  }, [navigate, onLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Step 1: Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('Login failed');

      console.log('✅ Auth successful:', authData.user.id);

      // Step 2: Fetch user profile from custom 'user' table
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error('User profile not found');

      console.log('✅ User data fetched:', userData);

      // Step 3: Parse tradeTypes from serviceType (comma-separated string)
      const tradeTypes: TradeType[] = userData.serviceType
        ? userData.serviceType.split(',').filter((t: string) => t.trim() !== '') as TradeType[]
        : [];

      // Step 4: Create complete User object
      const loggedInUser: User = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name || email.split('@')[0],
        role: userData.role as UserRole,
        tradeTypes: tradeTypes,
        credits: userData.role === UserRole.SERVICE_PROVIDER ? 5 : 0,
        rating: 5.0,

        // Profile data (may be incomplete)
        phone: userData.phone || undefined,
        experience: userData.experience || undefined,
        age: userData.age || undefined,
        gender: userData.gender || undefined,
        address: userData.address || undefined,
        zipcode: userData.zipcode || undefined,
        insuranceDetails: userData.insurance_details || undefined,
        qualifications: userData.qualifications || undefined,
        operatingRadius: userData.operating_radius || 10,

        // Profile completion check
        isProfileComplete: userData.role === UserRole.CLIENT ? true : !!(
          userData.phone &&
          userData.experience &&
          userData.age &&
          userData.gender &&
          userData.address &&
          userData.zipcode &&
          userData.insurance_details &&
          userData.qualifications &&
          userData.operating_radius &&
          tradeTypes.length > 0
        ),

        projects: []
      };

      console.log('✅ User object created:', loggedInUser);

      // Step 5: Store complete user in localStorage
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      // Step 6: Update app state
      onLogin(loggedInUser);

      // Step 7: Navigate based on role and profile completion
      if (userData.role === UserRole.ADMIN) {
        navigate('/admin');
      } else if (userData.role === UserRole.SERVICE_PROVIDER) {
        if (loggedInUser.isProfileComplete) {
          navigate('/dashboard');
        } else {
          navigate('/profile');
        }
      } else if (userData.role === UserRole.CLIENT) {
        navigate('/post-project');
      } else {
        navigate('/');
      }

    } catch (err: any) {
      console.error('Login error:', err);

      if (err.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (err.message.includes('Email not confirmed')) {
        setError('Please verify your email before logging in.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking session
  if (checking) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600 font-medium">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-indigo-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 brand-font">
          Log in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Or{' '}
          <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
            join the Elite ecosystem today
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-6 shadow-2xl shadow-indigo-100 sm:rounded-[2rem] sm:px-10 border border-indigo-50">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              {/* <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 font-medium">
                  Remember me
                </label>
              </div> */}

              <div className="text-sm ml-auto">
                <Link to="/forgot-password" title="Go to reset password page" className="font-medium text-indigo-600 hover:text-indigo-500 ">
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-100 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;