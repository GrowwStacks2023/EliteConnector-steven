import { supabase } from '../lib/supabaseClient';

/**
 * Reserve a lead for 3 minutes by setting is_active = false
 */
export const reserveLead = async (leadId: string, userId: string) => {
  try {
    const reservedUntil = new Date(Date.now() + 3 * 60 * 1000).toISOString();
    
    // First, check if lead is available
    const { data: checkData, error: checkError } = await supabase
      .from('client_jobs')
      .select('id, is_active, reserved_until')
      .eq('id', leadId)
      .single();

    if (checkError) {
      console.error('❌ Error checking lead:', checkError);
      throw new Error('Lead not found');
    }

    // Check if already reserved
    if (!checkData.is_active) {
      throw new Error('Lead is already reserved by another provider');
    }

    // Check if reservation expired but not yet cleaned up
    if (checkData.reserved_until && new Date(checkData.reserved_until) > new Date()) {
      throw new Error('Lead is currently reserved');
    }

    // Now reserve it
    const { data, error } = await supabase
      .from('client_jobs')
      .update({
        is_active: false,  // Hide from marketplace
        reserved_until: reservedUntil
      })
      .eq('id', leadId)
      .eq('is_active', true)  // Double-check it's still available
      .select();

    if (error) {
      console.error('❌ Supabase error reserving lead:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      throw new Error('Lead was just reserved by another provider');
    }
    
    console.log('✅ Lead reserved:', leadId);
    return data[0];
  } catch (err: any) {
    console.error('❌ Failed to reserve lead:', err);
    throw err;
  }
};

/**
 * Release a lead reservation (make it available again)
 */
export const releaseLead = async (leadId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_jobs')
      .update({
        is_active: true,  // Show in marketplace again
        reserved_until: null
      })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('❌ Error releasing lead:', error);
      throw error;
    }
    
    console.log('✅ Lead released:', leadId);
    return data;
  } catch (err: any) {
    console.error('❌ Failed to release lead:', err);
    // Don't throw - we want this to fail silently
  }
};

/**
 * Release multiple leads at once
 */
export const releaseMultipleLeads = async (leadIds: string[]) => {
  try {
    const { data, error } = await supabase
      .from('client_jobs')
      .update({
        is_active: true,
        reserved_until: null
      })
      .in('id', leadIds)
      .select();

    if (error) {
      console.error('❌ Error releasing multiple leads:', error);
      throw error;
    }
    
    console.log('✅ Multiple leads released:', leadIds.length);
    return data;
  } catch (err: any) {
    console.error('❌ Failed to release leads:', err);
    // Don't throw - we want this to fail silently
  }
};

/**
 * Mark lead as purchased (permanently unavailable)
 */
export const markLeadAsPurchased = async (leadId: string) => {
  try {
    const { data, error } = await supabase
      .from('client_jobs')
      .update({
        status: 'purchased',
        is_active: false,  // Hide forever
        reserved_until: null  // No longer temporary
      })
      .eq('id', leadId)
      .select();

    if (error) {
      console.error('❌ Error marking lead as purchased:', error);
      throw error;
    }
    
    console.log('✅ Lead marked as purchased:', leadId);
    return data;
  } catch (err: any) {
    console.error('❌ Failed to mark lead as purchased:', err);
    throw err;
  }
};

/**
 * Cleanup expired reservations (optional background task)
 */
export const cleanupExpiredReservations = async () => {
  try {
    const { data, error } = await supabase
      .from('client_jobs')
      .update({
        is_active: true,
        reserved_until: null
      })
      .lt('reserved_until', new Date().toISOString())
      .eq('status', 'open')
      .select();

    if (error) {
      console.error('❌ Error cleaning up expired reservations:', error);
      throw error;
    }
    
    console.log('✅ Expired reservations cleaned up:', data?.length || 0);
    return data;
  } catch (err: any) {
    console.error('❌ Failed to cleanup expired reservations:', err);
  }
};