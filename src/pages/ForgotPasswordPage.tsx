import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import Swal from 'sweetalert2';

const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // ✅ STEP 1: Check if email exists in database
      console.log('🔍 Checking if email exists:', email);
      
      const { data: userExists, error: checkError } = await supabase
        .from('user')
        .select('email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle();

      if (checkError) {
        console.error('Error checking email:', checkError);
        throw new Error('Unable to verify email. Please try again.');
      }

      if (!userExists) {
        console.log('❌ Email not found in database');
        
        Swal.fire({
          title: 'Email Not Found',
          text: 'This email is not registered in our system. Please check your email or create a new account.',
          icon: 'error',
          confirmButtonColor: '#4f46e5',
          showCancelButton: true,
          confirmButtonText: 'Try Again',
          cancelButtonText: 'Sign Up Instead'
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            window.location.href = '/register';
          }
        });
        
        setLoading(false);
        return;
      }

      console.log('✅ Email exists in database, sending reset email...');

      // ✅ STEP 2: Send password reset email (only if email exists)
      const { error } = await supabase.auth.resetPasswordForEmail(email.toLowerCase().trim(), {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;

      console.log('✅ Password reset email sent to:', email);
      setEmailSent(true);

      Swal.fire({
        title: 'Email Sent!',
        html: `
          <p>Check your email for a password reset link.</p>
          <p class="text-sm text-gray-500 mt-2">The link will expire in 1 hour.</p>
          <p class="text-xs text-gray-400 mt-2">If you don't see it, check your spam folder.</p>
        `,
        icon: 'success',
        confirmButtonColor: '#4f46e5'
      });

    } catch (err: any) {
      console.error('❌ Reset email error:', err);
      
      Swal.fire({
        title: 'Error',
        text: err.message || 'Failed to send reset email. Please try again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-gray-900 brand-font mb-3">Reset Password</h1>
          <p className="text-gray-600 font-medium">
            {emailSent 
              ? 'Check your email for the reset link' 
              : 'Enter your registered email address'}
          </p>
        </div>

        <div className="bg-white shadow-2xl rounded-[3rem] p-8 border border-gray-50">
          {!emailSent ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-black transition-all"
                  placeholder="your.email@example.com"
                />
              </div>

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
                    Checking email...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-6">📧</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Check Your Email</h3>
              <p className="text-gray-600 text-sm mb-6">
                We've sent a password reset link to <strong className="text-indigo-600">{email}</strong>
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                <p className="text-amber-800 text-xs font-medium">
                  ⏰ The link will expire in 1 hour
                </p>
              </div>
              <p className="text-gray-500 text-xs mb-6">
                Didn't receive it? Check your spam folder or try again.
              </p>
              <button
                onClick={() => setEmailSent(false)}
                className="text-indigo-600 font-bold text-sm hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-gray-500 text-sm hover:text-indigo-600 font-medium transition-colors"
            >
              ← Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;