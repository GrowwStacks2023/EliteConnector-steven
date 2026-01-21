import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,       // 🚫 no localStorage
    autoRefreshToken: false,     // 🚫 no refresh
    detectSessionInUrl: false,   // 🚫 no URL parsing
  },
  global: {
    headers: {
      'x-client-info': 'eliteconnector-web',
    },
  },
});
