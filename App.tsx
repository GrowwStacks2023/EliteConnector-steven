import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from '../EliteConnector-steven/src/components/Header';
import Footer from '../EliteConnector-steven/src/components/Footer';
import Swal from 'sweetalert2';
import { AuthProvider, useAuth } from '../EliteConnector-steven/src/context/AuthContext';

// Pages
import HomePage from '../EliteConnector-steven/src/pages/HomePage';
import LoginPage from '../EliteConnector-steven/src/pages/LoginPage';
import RegisterPage from '../EliteConnector-steven/src/pages/RegisterPage';
import ForgotPasswordPage from '../EliteConnector-steven/src/pages/ForgotPasswordPage';
import ResetPasswordPage from './src/pages/ResetPasswordPage';
import LeadsDashboard from '../EliteConnector-steven/src/pages/LeadsDashboard';
import ClientDashboard from '../EliteConnector-steven/src/pages/ClientDashboard';
import MyPurchases from '../EliteConnector-steven/src/pages/MyPurchases';
import ViewLead from '../EliteConnector-steven/src/pages/ViewLead';
import AdminDashboard from '../EliteConnector-steven/src/pages/AdminDashboard';
import SubmitLeadPage from '../EliteConnector-steven/src/pages/SubmitLeadPage';
import PostProjectPage from '../EliteConnector-steven/src/pages/PostProjectPage';
import ProfilePage from '../EliteConnector-steven/src/pages/ProfilePage';
import LeadQuestionnairePage from '../EliteConnector-steven/src/pages/LeadQuestionnairePage';
import SubscriptionPage from '../EliteConnector-steven/src/pages/SubscriptionPage';
import CartPage from '../EliteConnector-steven/src/pages/CartPage';
import PortfolioPage from '../EliteConnector-steven/src/pages/PortfolioPage';
import SubscriptionSuccess from '../EliteConnector-steven/src/pages/SubscriptionSuccess';
import ClientLandingPage from '../EliteConnector-steven/src/pages/ClientLandingPage';

// Services
import { reserveLead, releaseLead, releaseMultipleLeads } from './src/services/reservationService';


// Types
import { User, UserRole, Lead } from './types';


const AppContent: React.FC = () => {
  const { user, logout: authLogout, updateUserProfile } = useAuth();
  const [cart, setCart] = useState<Lead[]>([]);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initial cart load
  useEffect(() => {
    const savedCart = localStorage.getItem('ec_cart');
    const savedTime = localStorage.getItem('ec_cart_time');

    if (savedCart && savedTime) {
      const parsedCart = JSON.parse(savedCart);
      const expiry = parseInt(savedTime);
      const remaining = Math.max(0, Math.floor((expiry - Date.now()) / 1000));

      if (remaining > 0 && parsedCart.length > 0) {
        setCart(parsedCart);
        setTimeLeft(remaining);
      } else {
        // Cart expired - release all leads
        const leadIds = parsedCart.map((lead: Lead) => lead.id);
        if (leadIds.length > 0) {
          releaseMultipleLeads(leadIds).catch(() => { });
        }
        localStorage.removeItem('ec_cart');
        localStorage.removeItem('ec_cart_time');
      }
    }
  }, []);

  // Timer loop
  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSessionExpire();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const markLeadsAsAbandoned = (leadIds: string[]) => {
    if (user) {
      const currentAbandoned = user.abandonedLeadIds || [];
      const newlyAbandoned = leadIds.filter(id => !currentAbandoned.includes(id));

      if (newlyAbandoned.length > 0) {
        const updatedUser = {
          ...user,
          abandonedLeadIds: [...currentAbandoned, ...newlyAbandoned]
        };
        updateUserProfile(updatedUser);
      }
    }
  };

  const handleSessionExpire = async () => {
    const leadIdsInCart = cart.map(l => l.id);
    markLeadsAsAbandoned(leadIdsInCart);

    if (leadIdsInCart.length > 0) {
      try {
        await releaseMultipleLeads(leadIdsInCart);
      } catch (err) { }
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
    const leadIdsInCart = cart.map(l => l.id);
    if (leadIdsInCart.length > 0) {
      try {
        await releaseMultipleLeads(leadIdsInCart);
      } catch (err) { }
    }

    await authLogout();
    setCart([]);
    setTimeLeft(null);
    localStorage.removeItem('ec_cart');
    localStorage.removeItem('ec_cart_time');
  };

  const updateCredits = (newCredits: number) => {
    if (user) {
      const updatedUser = { ...user, credits: newCredits };
      updateUserProfile(updatedUser);
    }
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

    try {
      await reserveLead(lead.id, user.id);

      setCart((prev) => {
        if (prev.find(item => item.id === lead.id)) return prev;

        const expiry = Date.now() + (3 * 60 * 1000);
        const newLead = { ...lead, reservedUntil: expiry };
        const newCart = [...prev, newLead];

        localStorage.setItem('ec_cart', JSON.stringify(newCart));
        if (prev.length === 0) {
          setTimeLeft(180);
          localStorage.setItem('ec_cart_time', expiry.toString());
        }

        return newCart;
      });

      Swal.fire({
        title: 'Added to Cart!',
        text: 'Lead reserved for 3 minutes.',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end'
      });

    } catch (err: any) {
      Swal.fire({
        title: 'Already Reserved',
        text: 'This lead was just reserved by another provider.',
        icon: 'error',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const removeFromCart = async (leadId: string) => {
    markLeadsAsAbandoned([leadId]);

    try {
      await releaseLead(leadId);
    } catch (err) { }

    setCart((prev) => {
      const newCart = prev.filter(item => item.id !== leadId);
      localStorage.setItem('ec_cart', JSON.stringify(newCart));
      if (newCart.length === 0) {
        setTimeLeft(null);
        localStorage.removeItem('ec_cart_time');
      }
      return newCart;
    });
  };

  const clearCart = async () => {
    const leadIdsInCart = cart.map(l => l.id);

    if (leadIdsInCart.length > 0) {
      try {
        await releaseMultipleLeads(leadIdsInCart);
      } catch (err) { }
    }

    setCart([]);
    setTimeLeft(null);
    localStorage.removeItem('ec_cart');
    localStorage.removeItem('ec_cart_time');
  };

  const isServiceProviderAndIncomplete = user?.role === UserRole.SERVICE_PROVIDER && !user.isProfileComplete;

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={user} onLogout={handleLogout} cartCount={cart.length} timeLeft={timeLeft} />

      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage user={user} />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route
            path="/portfolio"
            element={user ? <PortfolioPage user={user} onUpdateProfile={updateUserProfile} /> : <Navigate to="/login" />}
          />
          <Route
            path="/client-home"
            element={user?.role === UserRole.CLIENT ? <ClientLandingPage user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/dashboard"
            element={
              user ? (
                isServiceProviderAndIncomplete ? (
                  <Navigate to="/profile" replace />
                ) : user.role === UserRole.CLIENT ? (
                  <ClientDashboard user={user} />
                ) : (
                  <LeadsDashboard user={user} cart={cart} onAddToCart={addToCart} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/cart"
            element={
              user ? (
                isServiceProviderAndIncomplete ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <CartPage
                    user={user}
                    cart={cart}
                    onRemoveFromCart={removeFromCart}
                    onClearCart={clearCart}
                    onUpdateCredits={updateCredits}
                    timeLeft={timeLeft}
                  />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/my-purchases"
            element={
              user ? (
                isServiceProviderAndIncomplete ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <MyPurchases user={user} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/lead/:id"
            element={
              user ? (
                isServiceProviderAndIncomplete ? (
                  <Navigate to="/profile" replace />
                ) : (
                  <ViewLead user={user} />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />

          <Route
            path="/profile"
            element={user ? <ProfilePage user={user} onUpdateProfile={updateUserProfile} /> : <Navigate to="/login" />}
          />

          <Route
            path="/subscription"
            element={user ? <SubscriptionPage /> : <Navigate to="/login" />}
          />

          <Route
            path="/subscription/success"
            element={<SubscriptionSuccess />}
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