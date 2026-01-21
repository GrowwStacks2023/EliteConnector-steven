import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import { User, UserRole, TradeType } from '../../types';

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
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
  const [loading, setLoading] = useState(true);

  // -------------------------------
  // Fetch user profile from DB
  // -------------------------------
  const fetchUserProfile = async (
    supabaseUserId: string
  ): Promise<User | null> => {
    try {
      const { data: userData, error } = await supabase
        .from('user')
        .select('*')
        .eq('id', supabaseUserId)
        .single();

      if (error || !userData) return null;

      const tradeTypes: TradeType[] = userData.serviceType
        ? userData.serviceType
            .split(',')
            .filter((t: string) => t.trim() !== '') as TradeType[]
        : [];

      const userProfile: User = {
        id: userData.id,
        email: userData.email,
        fullName: userData.full_name || userData.email.split('@')[0],
        role: userData.role as UserRole,
        tradeTypes,
        postcode_areas: userData.postcode_areas || [],
        credits:
          userData.role === UserRole.SERVICE_PROVIDER
            ? userData.credits || 5
            : 0,
        rating: userData.rating || 5.0,

        phone: userData.phone || undefined,
        experience: userData.experience || undefined,
        age: userData.age || undefined,
        gender: userData.gender || undefined,
        address: userData.address || undefined,
        zipcode: userData.zipcode || undefined,
        insuranceDetails: userData.insurance_details || undefined,
        qualifications: userData.qualifications || undefined,
        operatingRadius: userData.operating_radius || 10,

        isProfileComplete:
          userData.role === UserRole.CLIENT
            ? true
            : !!(
                userData.phone &&
                userData.experience &&
                userData.age &&
                userData.gender &&
                userData.address &&
                userData.zipcode &&
                userData.insurance_details &&
                userData.qualifications &&
                userData.operating_radius &&
                userData.postcode_areas?.length &&
                tradeTypes.length
              ),

        projects: userData.projects || [],
        abandonedLeadIds: userData.abandonedLeadIds || []
      };

      return userProfile;
    } catch {
      return null;
    }
  };

  // -------------------------------
  // Bootstrap auth from localStorage
  // -------------------------------
  useEffect(() => {
    const storedUser = localStorage.getItem('user');

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  // -------------------------------
  // Login
  // -------------------------------
  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user) {
      throw error || new Error('Login failed');
    }

    const userProfile = await fetchUserProfile(data.user.id);

    if (!userProfile) {
      throw new Error('User profile not found');
    }

    setUser(userProfile);
    setSupabaseUser(data.user);
    localStorage.setItem('user', JSON.stringify(userProfile));
  };

  // -------------------------------
  // Logout
  // -------------------------------
  const logout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setSupabaseUser(null);
    localStorage.removeItem('user');
  };

  // -------------------------------
  // Update profile (local only)
  // -------------------------------
  const updateUserProfile = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value: AuthContextType = {
    user,
    supabaseUser,
    loading,
    isAuthenticated: !!user, // ✅ ONLY localStorage based
    login,
    logout,
    updateUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// -------------------------------
// Hook
// -------------------------------
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
