import { supabase } from '../lib/supabaseClient';

export const fetchActiveLeads = async () => {
  try {
    const { data, error } = await supabase
      .from('client_jobs')
      .select(`
        *,
        client:user!client_id(
          full_name,
          email
        )
      `)
      .eq('status', 'open')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching leads:', err);
    throw err;
  }
};