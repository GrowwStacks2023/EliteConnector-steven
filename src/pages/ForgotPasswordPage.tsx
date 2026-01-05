import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isValidToken, setIsValidToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('user');

    const checkResetToken = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');
        
        console.log('🔍 Token check:', { hasAccessToken: !!accessToken, type });

        if (type === 'recovery' && accessToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (sessionError) throw sessionError;

          console.log('✅ Valid recovery session');
          setIsValidToken(true);
        } else {
          throw new Error('Invalid recovery token');
        }
      } catch (err: any) {
        console.error('❌ Token error:', err);
        
        Swal.fire({
          title: 'Invalid Link',
          text: 'This password reset link is invalid or has expired. Please request a new one.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          navigate('/forgot-password');
        });
      } finally {
        setChecking(false);
      }
    };

    checkResetToken();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });

      if (updateError) {
        console.error('❌ Password update error:', updateError);
        
        if (updateError.message.includes('session') || 
            updateError.message.includes('JWT') || 
            updateError.message.includes('expired') ||
            updateError.code === 'session_not_found') {
          
          Swal.fire({
            title: 'Link Expired',
            text: 'Your password reset link has expired. Please request a new password reset.',
            icon: 'error',
            confirmButtonColor: '#4f46e5',
            confirmButtonText: 'Request New Link'
          }).then(() => {
            navigate('/forgot-password');
          });
          return;
        }
        
        throw updateError;
      }

      console.log('✅ Password updated');

      await supabase.auth.signOut();
      localStorage.removeItem('user');

      Swal.fire({
        title: 'Password Updated!',
        text: 'Your password has been successfully changed. Please log in with your new password.',
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        navigate('/login');
      });

    } catch (err: any) {
      console.error('❌ Update error:', err);
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
          <p className="text-gray-600 font-medium">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) return null;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-indigo-50/50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 brand-font">
          Create New Password
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Enter your new password below.
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
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="Minimum 6 characters"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 appearance-none block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                placeholder="Re-enter password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg shadow-indigo-100 text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;