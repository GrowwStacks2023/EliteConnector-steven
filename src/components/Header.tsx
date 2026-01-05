import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole } from '../../types';
import { ShoppingCart, LogOut, AlertCircle, Clock, Zap } from 'lucide-react';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
  cartCount: number;
  timeLeft: number | null;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, cartCount, timeLeft }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const isProfileIncomplete = user?.role === UserRole.SERVICE_PROVIDER && !user?.isProfileComplete;

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      console.log('✅ User logged out and localStorage cleared');
      onLogout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userRole');
      onLogout();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:rotate-6 transition-all duration-300 shadow-md">
                <span className="text-white font-black text-base">EC</span>
              </div>
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              EliteConnector
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {user?.role === UserRole.SERVICE_PROVIDER && (
              <>
                <Link
                  to={isProfileIncomplete ? "/profile" : "/dashboard"}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isProfileIncomplete 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                  onClick={(e) => isProfileIncomplete && e.preventDefault()}
                >
                  Marketplace
                </Link>
                <Link 
                  to="/my-purchases" 
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  Purchases
                </Link>
                <Link 
                  to="/cart" 
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center relative"
                >
                  <ShoppingCart className="w-4 h-4 mr-1.5" />
                  Cart
                  {cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-md">
                      {cartCount}
                    </span>
                  )}
                </Link>
              </>
            )}

            {user?.role === UserRole.CLIENT && (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all"
                >
                  My Projects
                </Link>
                <Link 
                  to="/post-project" 
                  className="ml-2 px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold hover:shadow-lg hover:scale-105 transition-all"
                >
                  Post Project
                </Link>
              </>
            )}

            {user?.role === UserRole.ADMIN && (
              <Link 
                to="/admin" 
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-bold hover:shadow-lg transition-all"
              >
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Profile Incomplete Warning */}
            {isProfileIncomplete && location.pathname !== '/profile' && (
              <Link
                to="/profile"
                className="hidden lg:flex items-center bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-all"
              >
                <AlertCircle className="w-3.5 h-3.5 text-red-600 mr-2" />
                <span className="text-red-700 font-semibold text-xs">Complete Profile</span>
              </Link>
            )}

            {/* Cart Timer */}
            {timeLeft !== null && timeLeft > 0 && (
              <div className="hidden sm:flex items-center bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg">
                <Clock className="w-3.5 h-3.5 text-amber-600 mr-2" />
                <span className="text-amber-700 font-bold text-xs font-mono">{formatTime(timeLeft)}</span>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-3">
                {/* Credits Badge - Clickable */}
                {user.role === UserRole.SERVICE_PROVIDER && (
                  <Link
                    to="/subscription"
                    className="hidden lg:flex items-center bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 px-3 py-1.5 rounded-lg hover:shadow-md hover:scale-105 transition-all group cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-600 mr-1.5 group-hover:text-purple-600 transition-colors" />
                    <span className="text-blue-700 font-bold text-sm group-hover:text-purple-700 transition-colors">{user.credits}</span>
                    <span className="text-blue-600 text-xs ml-1 font-medium group-hover:text-purple-600 transition-colors">credits</span>
                  </Link>
                )}

                {/* Profile Button with Full Name */}
                <Link 
                  to="/profile" 
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-all group"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-sm ${
                    isProfileIncomplete 
                      ? 'bg-red-100 text-red-600 border border-red-200' 
                      : 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                  }`}>
                    {user.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:flex flex-col">
                    <span className="text-gray-800 text-sm font-semibold leading-tight group-hover:text-blue-600 transition-colors">
                      {user.fullName}
                    </span>
                  </div>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  to="/login" 
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 text-sm font-semibold transition-colors rounded-lg hover:bg-gray-100"
                >
                  Log in
                </Link>
                <Link 
                  to="/register" 
                  className="px-5 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
                >
                  Join Elite
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;