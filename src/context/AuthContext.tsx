import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, TradeType } from '../../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Fetch user profile from custom 'user' table
  const fetchUserProfile = async (supabaseUserId: string): Promise<User | null> => {
    try {
      
      const { data: userData, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', supabaseUserId)
        .single();

      if (error) {
        throw error;
      }
      
      if (!userData) {
        return null;
      }

      // Parse tradeTypes from serviceType
      const tradeTypes: TradeType[] = userData.serviceType
        ? userData.serviceType.split(',').filter((t: string) => t.trim() !== '') as TradeType[]
        : [];

      // Create complete User object
      const userProfile: User = {
        id: userData.id,
        postcode_areas: userData.postcode_areas || [],
        email: userData.email,
        fullName: userData.full_name || userData.email.split('@')[0],
        role: userData.role as UserRole,
        tradeTypes: tradeTypes,
        credits: userData.role === UserRole.SERVICE_PROVIDER ? userData.credits || 5 : 0,
        rating: userData.rating || 5.0,

        // Profile data
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
          userData.postcode_areas && userData.postcode_areas.length > 0 &&
          tradeTypes.length > 0
        ),

        projects: userData.projects || [],
        abandonedLeadIds: userData.abandonedLeadIds || []
      };

      return userProfile;
    } catch (error) {
      return null;
    }
  };

  // Initialize session on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        
        // Check for existing session
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }

        if (!mounted) return;

        if (currentSession?.user) {
          setSession(currentSession);
          setSupabaseUser(currentSession.user);

          // Fetch full user profile
          const userProfile = await fetchUserProfile(currentSession.user.id);
          
          if (mounted && userProfile) {
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        } else {
          // No session - clear everything
          if (mounted) {
            setSession(null);
            setSupabaseUser(null);
            setUser(null);
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        if (mounted) {
          setSession(null);
          setSupabaseUser(null);
          setUser(null);
          localStorage.removeItem('user');
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialCheckDone(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Listen for auth state changes (separate from initialization)
  useEffect(() => {
    if (!initialCheckDone) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {

        setSession(newSession);
        setSupabaseUser(newSession?.user || null);

        if (newSession?.user) {
          // User logged in - fetch profile
          const userProfile = await fetchUserProfile(newSession.user.id);
          
          if (userProfile) {
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        } else {
          // User logged out
          setUser(null);
          localStorage.removeItem('user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialCheckDone]);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error('Login failed - no user returned');
      }

      // Fetch user profile
      const userProfile = await fetchUserProfile(authData.user.id);
      
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      setUser(userProfile);
      setSupabaseUser(authData.user);
      setSession(authData.session);
      localStorage.setItem('user', JSON.stringify(userProfile));
    } catch (error) {
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      localStorage.removeItem('user');
    } catch (error) {
      throw error;
    }
  };

  // Update user profile in context
  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    session,
    loading,
    isAuthenticated: !!session,
    login,
    logout,
    updateUserProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};