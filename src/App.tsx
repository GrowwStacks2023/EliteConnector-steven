import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';

import Swal from 'sweetalert2';

// Layout
import Header from './components/Header';
import Footer from './components/Footer';

// Auth
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import LeadsDashboard from './pages/LeadsDashboard';
import ClientDashboard from './pages/ClientDashboard';
import MyPurchases from './pages/MyPurchases';
import ViewLead from './pages/ViewLead';
import AdminDashboard from './pages/AdminDashboard-Refactored';
import SubmitLeadPage from './pages/SubmitLeadPage';
import PostProjectPage from './pages/PostProjectPage';
import ProfilePage from './pages/ProfilePage';
import LeadQuestionnairePage from './pages/LeadQuestionnairePage';
import SubscriptionPage from './pages/SubscriptionPage';
import CartPage from './pages/CartPage';
import PortfolioPage from './pages/PortfolioPage';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import ClientLandingPage from './pages/ClientLandingPage';

// Service
import {
  reserveLead,
  releaseLead,
  releaseMultipleLeads
} from './services/reservationService';

// Types
import { UserRole, Lead } from '../types';

/* -------------------------------------------------- */
/* Loader */
/* -------------------------------------------------- */
const FullPageLoader = () => (
  <div className="flex items-center justify-center h-screen">
    <span className="text-lg font-medium">Loading...</span>
  </div>
);

/* -------------------------------------------------- */
/* APP CONTENT */
/* -------------------------------------------------- */
const AppContent: React.FC = () => {
  const {
    user,
    loading,
    logout: authLogout,
    updateUserProfile
  } = useAuth();

  const [cart, setCart] = useState<Lead[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  /* ---------------- CART INIT ---------------- */
  useEffect(() => {
    const savedCart = localStorage.getItem('ec_cart');
    const savedTime = localStorage.getItem('ec_cart_time');

    if (!savedCart || !savedTime) return;

    const parsedCart: Lead[] = JSON.parse(savedCart);
    const expiry = Number(savedTime);
    const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

    if (remaining > 0 && parsedCart.length > 0) {
      setCart(parsedCart);
      setTimeLeft(remaining);
    } else {
      const leadIds = parsedCart.map(l => l.id);
      if (leadIds.length > 0) {
        releaseMultipleLeads(leadIds).catch(() => {});
      }
      localStorage.removeItem('ec_cart');
      localStorage.removeItem('ec_cart_time');
    }
  }, []);

  /* ---------------- TIMER ---------------- */
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSessionExpire();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  /* ---------------- HELPERS ---------------- */
  const markLeadsAsAbandoned = (leadIds: string[]) => {
    if (!user) return;

    const existing = user.abandonedLeadIds || [];
    const updated = [...new Set([...existing, ...leadIds])];

    updateUserProfile({
      ...user,
      abandonedLeadIds: updated
    });
  };

  const handleSessionExpire = async () => {
    const leadIds = cart.map(l => l.id);
    markLeadsAsAbandoned(leadIds);

    if (leadIds.length > 0) {
      await releaseMultipleLeads(leadIds).catch(() => {});
    }

    setCart([]);
    setTimeLeft(null);
    localStorage.removeItem('ec_cart');
    localStorage.removeItem('ec_cart_time');

    Swal.fire({
      title: 'Session Expired',
      text: 'Your 3-minute cart reservation has ended.',
      icon: 'warning',
      confirmButtonColor: '#4f46e5'
    });
  };

  const handleLogout = async () => {
    const leadIds = cart.map(l => l.id);

    if (leadIds.length > 0) {
      await releaseMultipleLeads(leadIds).catch(() => {});
    }

    await authLogout();
    setCart([]);
    setTimeLeft(null);
    localStorage.removeItem('ec_cart');
    localStorage.removeItem('ec_cart_time');
  };

  const addToCart = async (lead: Lead) => {
    if (!user) {
      Swal.fire({
        title: 'Login Required',
        text: 'Please login to add leads to cart.',
        icon: 'warning',
        confirmButtonColor: '#4f46e5'
      });
      return;
    }

    await reserveLead(lead.id, user.id);

    setCart(prev => {
      if (prev.some(l => l.id === lead.id)) return prev;

      const expiry = Date.now() + 3 * 60 * 1000;
      const updatedCart = [...prev, { ...lead, reservedUntil: expiry }];

      localStorage.setItem('ec_cart', JSON.stringify(updatedCart));
      localStorage.setItem('ec_cart_time', expiry.toString());
      setTimeLeft(180);

      return updatedCart;
    });
  };

  const removeFromCart = async (leadId: string) => {
    markLeadsAsAbandoned([leadId]);
    await releaseLead(leadId).catch(() => {});

    setCart(prev => {
      const updated = prev.filter(l => l.id !== leadId);
      localStorage.setItem('ec_cart', JSON.stringify(updated));
      if (updated.length === 0) {
        setTimeLeft(null);
        localStorage.removeItem('ec_cart_time');
      }
      return updated;
    });
  };

  const clearCart = async () => {
    const leadIds = cart.map(l => l.id);
    if (leadIds.length > 0) {
      await releaseMultipleLeads(leadIds).catch(() => {});
    }
    setCart([]);
    setTimeLeft(null);
    localStorage.removeItem('ec_cart');
    localStorage.removeItem('ec_cart_time');
  };

  const updateCredits = (credits: number) => {
    if (!user) return;
    updateUserProfile({ ...user, credits });
  };

  const isServiceProviderAndIncomplete =
    user?.role === UserRole.SERVICE_PROVIDER && !user.isProfileComplete;

  /* ---------------- LOADING ---------------- */
  if (loading) return <FullPageLoader />;

  /* ---------------- RENDER ---------------- */
  return (
    <div className="flex flex-col min-h-screen">
      <Header
        user={user}
        onLogout={handleLogout}
        cartCount={cart.length}
        timeLeft={timeLeft}
      />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/dashboard" />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              !user ? (
                <Navigate to="/login" />
              ) : isServiceProviderAndIncomplete ? (
                <Navigate to="/profile" replace />
              ) : user.role === UserRole.CLIENT ? (
                <ClientDashboard user={user} />
              ) : (
                <LeadsDashboard user={user} cart={cart} onAddToCart={addToCart} />
              )
            }
          />

          <Route
            path="/client-home"
            element={
              user?.role === UserRole.CLIENT
                ? <ClientLandingPage user={user} />
                : <Navigate to="/login" />
            }
          />

          <Route
            path="/cart"
            element={
              user ? (
                <CartPage
                  user={user}
                  cart={cart}
                  onRemoveFromCart={removeFromCart}
                  onClearCart={clearCart}
                  onUpdateCredits={updateCredits}
                  timeLeft={timeLeft}
                />
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/my-purchases"
            element={user ? <MyPurchases user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/lead/:id"
            element={user ? <ViewLead user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} onUpdateProfile={updateUserProfile} /> : <Navigate to="/login" />}
          />

          <Route
            path="/subscription"
            element={user ? <SubscriptionPage /> : <Navigate to="/login" />}
          />

          <Route path="/subscription/success" element={<SubscriptionSuccess />} />

          <Route
            path="/portfolio"
            element={user ? <PortfolioPage user={user} onUpdateProfile={updateUserProfile} /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={user?.role === UserRole.ADMIN ? <AdminDashboard user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/post-lead"
            element={user?.role === UserRole.ADMIN ? <SubmitLeadPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/post-project"
            element={user?.role === UserRole.CLIENT ? <PostProjectPage user={user} /> : <Navigate to="/login" />}
          />

          <Route path="/form/:leadId" element={<LeadQuestionnairePage />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

/* -------------------------------------------------- */
/* ROOT */
/* -------------------------------------------------- */
const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
};

export default App;
