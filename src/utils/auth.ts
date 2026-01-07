import { supabase } from '../lib/supabaseClient';

export const logout = async () => {
  // Sign out from Supabase
  await supabase.auth.signOut();
  
  // Clear localStorage
  localStorage.removeItem('user');
};