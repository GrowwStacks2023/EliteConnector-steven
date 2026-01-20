import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lead } from '../../types';
import Swal from 'sweetalert2';
import { markLeadAsPurchased, releaseMultipleLeads } from '../services/reservationService';

interface CartPageProps {
  user: User;
  cart: Lead[];
  onRemoveFromCart: (leadId: string) => void;
  onClearCart: () => void;
  onUpdateCredits: (credits: number) => void;
  timeLeft: number | null;
}

const CartPage: React.FC<CartPageProps> = ({ 
  user, 
  cart, 
  onRemoveFromCart, 
  onClearCart, 
  onUpdateCredits, 
  timeLeft 
}) => {
  const navigate = useNavigate();
  const totalCredits = cart.reduce((sum, item) => sum + item.price, 0);

  // Handle expired reservations
  useEffect(() => {
    const handleExpiredCart = async () => {
      if (cart.length > 0 && (timeLeft === null || timeLeft <= 0)) {
        console.log('⏰ Cart expired, releasing leads...');
        
        // Release all leads in cart
        const leadIds = cart.map(lead => lead.id);
        await releaseMultipleLeads(leadIds);
        
        // Clear cart
        onClearCart();
        
        // Show notification
        Swal.fire({
          title: 'Reservation Expired',
          text: 'Your cart reservation has expired. Leads have been released back to the marketplace.',
          icon: 'warning',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          navigate('/dashboard');
        });
      }
    };

    handleExpiredCart();
  }, [timeLeft, cart, onClearCart, navigate]);

  // Check for expired reservations on mount
  useEffect(() => {
    const checkExpiredReservations = async () => {
      if (cart.length === 0) return;

      const cartData = localStorage.getItem('cart');
      if (!cartData) return;

      try {
        const { leads, timestamp } = JSON.parse(cartData);
        const reservationTime = 3 * 60 * 1000; // 3 minutes
        const elapsed = Date.now() - timestamp;

        if (elapsed >= reservationTime) {
          console.log('⏰ Cart expired on mount, clearing...');
          const leadIds = leads.map((l: Lead) => l.id);
          await releaseMultipleLeads(leadIds);
          onClearCart();
          
          Swal.fire({
            title: 'Cart Cleared',
            text: 'Your previous cart reservation expired.',
            icon: 'info',
            confirmButtonColor: '#4f46e5'
          }).then(() => {
            navigate('/dashboard');
          });
        }
      } catch (error) {
        console.error('❌ Error checking cart expiration:', error);
      }
    };

    checkExpiredReservations();
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    // Check if cart expired
    if (timeLeft === null || timeLeft <= 0) {
      Swal.fire({
        title: 'Reservation Expired',
        text: 'Please add leads to your cart again.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        onClearCart();
        navigate('/dashboard');
      });
      return;
    }

    if (user.credits < totalCredits) {
      Swal.fire({
        title: 'Insufficient Credits',
        text: `You need ${totalCredits} credits but have ${user.credits}.`,
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Buy Credits'
      }).then((result) => {
        if (result.isConfirmed) navigate('/subscription');
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Purchase',
      text: `Unlock ${cart.length} lead(s) for ${totalCredits} credits?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      confirmButtonText: 'Confirm Checkout'
    });

    if (!result.isConfirmed) return;

    try {
      Swal.fire({
        title: 'Processing...',
        text: 'Purchasing leads...',
        allowOutsideClick: false,
        didOpen: () => Swal.showLoading()
      });

      let totalDeducted = 0;
      const purchased = [];
      const failed = [];

      // Process each lead
      for (const lead of cart) {
        try {
          const result = await markLeadAsPurchased(lead.id);
          totalDeducted += result.creditsDeducted;
          purchased.push(lead);
        } catch (err: any) {
          console.error(`❌ Failed to purchase ${lead.id}:`, err);
          failed.push({ lead, error: err.message });
        }
      }

      if (purchased.length > 0) {
        // Update credits in state
        const newCredits = user.credits - totalDeducted;
        onUpdateCredits(newCredits);

        // Update localStorage
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          userData.credits = newCredits;
          localStorage.setItem('user', JSON.stringify(userData));
        }

        // Clear cart
        onClearCart();

        Swal.fire({
          title: 'Success!',
          html: `
            <p class="text-lg font-bold text-gray-900">${purchased.length} lead(s) purchased!</p>
            <p class="text-sm text-gray-600 mt-2">Credits deducted: ${totalDeducted}</p>
            <p class="text-sm text-indigo-600 mt-1">New balance: ${newCredits} credits</p>
            ${failed.length > 0 ? `<p class="text-sm text-red-600 mt-2">${failed.length} failed to purchase</p>` : ''}
          `,
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        }).then(() => navigate('/my-purchases'));

      } else {
        throw new Error('All purchases failed. Please try again.');
      }

    } catch (err) {
      console.error('❌ Checkout error:', err);
      Swal.fire({
        title: 'Purchase Failed',
        text: err instanceof Error ? err.message : 'Please try again',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  // Show empty cart if no items
  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🛒</div>
              <p className="text-gray-400 font-bold text-xl mb-4">Your cart is empty.</p>
              <Link to="/dashboard" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Browse Marketplace
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 brand-font mb-2">Review Your Cart</h1>
            <p className="text-gray-500 font-medium">Complete your purchase before the timer expires</p>
          </div>
          {timeLeft !== null && timeLeft > 0 && (
            <div className="text-right">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Reservation Timer</div>
              <div className={`text-2xl font-mono font-extrabold px-4 py-1 rounded-xl border inline-block ${
                timeLeft < 60 
                  ? 'text-red-600 bg-red-50 border-red-100 animate-pulse' 
                  : 'text-amber-600 bg-amber-50 border-amber-100'
              }`}>
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Client & Service</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Credits</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Remove</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {cart.map((lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{lead.clientName}</div>
                      <div className="text-[10px] text-indigo-600 font-bold uppercase">{lead.serviceRequired}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                      {lead.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600">
                      {lead.price}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => onRemoveFromCart(lead.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-2"
                        title="Remove from cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Total Requirement</div>
              <div className="text-3xl font-extrabold text-indigo-600">{totalCredits} Credits</div>
              <div className="text-xs text-gray-500 mt-1 font-medium">
                Available Balance: <span className={user.credits >= totalCredits ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>{user.credits}</span> Credits
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={timeLeft === null || timeLeft <= 0 || user.credits < totalCredits}
              className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {timeLeft === null || timeLeft <= 0 ? 'Reservation Expired' : 'Checkout & Unlock'}
            </button>
          </div>
        </div>

        {timeLeft !== null && timeLeft < 60 && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-red-900">Hurry! Your reservation is expiring soon</p>
              <p className="text-sm text-red-700 mt-1">Complete your purchase now or these leads will be released back to the marketplace.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;