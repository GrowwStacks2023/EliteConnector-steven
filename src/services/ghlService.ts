// src/services/ghlService.ts
import { supabase } from '../lib/supabaseClient';
import { User } from '../../types';

export const syncContactToGHL = async (user: User): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {

    const { data, error } = await supabase.functions.invoke('ghl-contact-creation', {
      body: { user }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data?.success) {
  
      return { success: false, error: data?.error };
    }

    return { success: true, message: data.message };

  } catch (error: any) {
    return { success: false, error: error.message };
  }
};