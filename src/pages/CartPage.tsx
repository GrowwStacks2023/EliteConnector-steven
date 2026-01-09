
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Lead } from '../../types';
import Swal from 'sweetalert2';
import { markLeadAsPurchased } from '../services/reservationService';

interface CartPageProps {
  user: User;
  cart: Lead[];
  onRemoveFromCart: (leadId: string) => void;
  onClearCart: () => void;
  onUpdateCredits: (credits: number) => void;
  timeLeft: number | null;
}

const CartPage: React.FC<CartPageProps> = ({ user, cart, onRemoveFromCart, onClearCart, onUpdateCredits, timeLeft }) => {
  const navigate = useNavigate();
  const totalCredits = cart.reduce((sum, item) => sum + item.price, 0);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    if (user.credits < totalCredits) {
      Swal.fire({
        title: 'Insufficient Credits',
        text: `You need ${totalCredits} credits for these leads, but you only have ${user.credits}. Buy more credits to continue.`,
        icon: 'error',
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Buy Credits'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/subscription');
        }
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirm Purchase',
      text: `Unlock ${cart.length} lead(s) for a total of ${totalCredits} credits?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#9ca3af',
      confirmButtonText: 'Confirm Checkout',
      cancelButtonText: 'Cancel'
    });

    if (result.isConfirmed) {
      try {
        // Mark all leads as purchased (permanently hidden)
        for (const lead of cart) {
          await markLeadAsPurchased(lead.id);
        }

        onUpdateCredits(user.credits - totalCredits);
        onClearCart();

        Swal.fire({
          title: 'Success!',
          text: "Your leads have been unlocked and added to 'My Purchases'.",
          icon: 'success',
          confirmButtonColor: '#4f46e5'
        }).then(() => {
          navigate('/my-purchases');
        });
      } catch (err) {
        console.error('Checkout error:', err);
        Swal.fire({
          title: 'Error',
          text: 'Failed to complete purchase. Please try again.',
          icon: 'error',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 brand-font mb-2">Review Your Cart</h1>
            <p className="text-gray-500 font-medium">Items waiting to be unlocked.</p>
          </div>
          {timeLeft !== null && timeLeft > 0 && (
            <div className="text-right">
              <div className="text-xs font-bold text-amber-500 uppercase tracking-widest mb-1">Reservation Timer</div>
              <div className="text-2xl font-mono font-extrabold text-amber-600 bg-amber-50 px-4 py-1 rounded-xl border border-amber-100 inline-block">
                {formatTime(timeLeft)}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
          {cart.length > 0 ? (
            <>
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
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <div className="text-sm text-gray-400 font-bold uppercase tracking-widest mb-1">Total Requirement</div>
                  <div className="text-3xl font-extrabold text-indigo-600">{totalCredits} Credits</div>
                  <div className="text-xs text-gray-500 mt-1 font-medium">Available Balance: {user.credits} Credits</div>
                </div>
                <button
                  onClick={handleCheckout}
                  className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all active:scale-[0.98]"
                >
                  Checkout & Unlock
                </button>
              </div>
            </>
          ) : (
            <div className="p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">🛒</div>
              <p className="text-gray-400 font-bold text-xl mb-4">Your cart is empty.</p>
              <Link to="/dashboard" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all">
                Browse Marketplace
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartPage;
