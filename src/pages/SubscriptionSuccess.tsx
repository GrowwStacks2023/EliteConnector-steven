import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth first
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!user) {
        console.log('❌ No user after 3 seconds, redirecting to login');
        navigate('/login?redirect=/subscription/success', { replace: true });
      }
      setAuthChecked(true);
    }, 3000); // Wait 3 seconds for auth to load

    if (user) {
      clearTimeout(timer);
      setAuthChecked(true);
    }

    return () => clearTimeout(timer);
  }, [user, navigate]);

  useEffect(() => {
    if (!authChecked || !user) return; // Don't proceed until auth is checked
    
    const handleSuccess = async () => {
      try {
        console.log('🔄 Payment successful, waiting for webhook to process...');
        
        // Wait 2 seconds for webhook to process
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Try to fetch updated credits with retries
        let attempts = 0;
        const maxAttempts = 5;
        let updatedUserData = null;
        let fetchError = null;

        while (attempts < maxAttempts) {
          console.log(`📡 Attempt ${attempts + 1}/${maxAttempts} to fetch credits...`);
          
          const { data, error } = await supabase
            .from('user')
            .select('credits, id, email')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            updatedUserData = data;
            console.log('✅ Credits fetched from DB:', data.credits);
            break;
          }

          fetchError = error;
          console.warn(`⚠️ Attempt ${attempts + 1} failed:`, error?.message);
          
          // Wait before retry
          if (attempts < maxAttempts - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
          
          attempts++;
        }

        if (!updatedUserData) {
          console.error('❌ Failed to fetch credits after retries:', fetchError);
          throw new Error('Failed to verify credit update. Please refresh the page.');
        }

        const newCredits = updatedUserData?.credits || 0;
        console.log('✅ Final credits:', newCredits);

        // Update local state
        const updatedUser = { ...user, credits: newCredits };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        updateUserProfile(updatedUser);

        setLoading(false);

        // Show success message
        Swal.fire({
          title: 'Payment Successful! 🎉',
          html: `<p>Your account has been credited with <strong>${newCredits} credits</strong>.</p><p>You can now purchase leads!</p>`,
          icon: 'success',
          confirmButtonColor: '#4f46e5',
          confirmButtonText: 'Go to Dashboard',
          allowOutsideClick: false,
          allowEscapeKey: false
        }).then(() => {
          navigate('/dashboard', { replace: true });
        });

      } catch (err: any) {
        console.error('❌ Error handling success:', err);
        setLoading(false);

        Swal.fire({
          title: 'Payment Processing',
          text: err.message || 'Your payment was successful but we\'re still processing it. Please wait a moment and refresh.',
          icon: 'info',
          confirmButtonColor: '#4f46e5',
          confirmButtonText: 'Refresh Page'
        }).then(() => {
          window.location.reload();
        });
      }
    };

    handleSuccess();
  }, [authChecked, user, searchParams, navigate, updateUserProfile]);

  // Show loading while checking auth
  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 via-white to-emerald-50 flex items-center justify-center px-4">
      {loading ? (
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-green-600 mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processing Payment</h2>
          <p className="text-gray-600">Please wait while we update your credits...</p>
          <p className="text-gray-500 text-sm mt-4">This may take up to 30 seconds</p>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl font-bold">✓</div>
          <h2 className="text-3xl font-extrabold text-gray-900 brand-font mb-4">Payment Complete!</h2>
          <p className="text-gray-600 font-medium mb-8">
            Your credits have been added to your account. You're ready to purchase leads!
          </p>
          <button
            onClick={() => navigate('/dashboard', { replace: true })}
            className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default SubscriptionSuccess;