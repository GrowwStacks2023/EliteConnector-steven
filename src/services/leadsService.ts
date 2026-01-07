import { supabase } from '../lib/supabaseClient';
import { TradeType } from '../../types';

export interface LeadData {
  id: string;
  client_id: string;
  title: string;
  category: TradeType;
  description: string;
  location: string;
  zipcode: string;
  budget_min: number | null;
  latitude?: number;
  longitude?: number;
  is_active: boolean;
  created_at: string;
}

export const fetchActiveLeads = async (): Promise<LeadData[]> => {
  try {
    const { data, error } = await supabase
      .from('client_jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching leads:', err);
    return [];
  }
};