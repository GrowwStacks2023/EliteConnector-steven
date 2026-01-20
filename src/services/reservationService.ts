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
        is_active: false,
        reserved_until: reservedUntil,
        reserved_by: userId
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
        reserved_until: null,
        reserved_by: null
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
        reserved_until: null,
        reserved_by: null
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


export const markLeadAsPurchased = async (leadId: string) => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error('User not logged in');

    const currentUser = JSON.parse(storedUser);

    // 1. Get the job details first
    const { data: job, error: jobError } = await supabase
      .from('client_jobs')
      .select(`
        *,
        client:user!client_id(
          id,
          full_name,
          email,
          phone
        )
      `)
      .eq('id', leadId)
      .single();

    if (jobError) {
      console.error('❌ Error fetching job:', jobError);
      throw new Error('Job not found');
    }

    if (!job) throw new Error('Job not found');

    const creditCost = 5;

    // 2. Get current user's credits from USER table (not service_providers)
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('credits')
      .eq('id', currentUser.id)
      .single();

    if (userError || !userData) {
      console.error('❌ Error fetching user:', userError);
      throw new Error('User profile not found');
    }

    const currentCredits = userData.credits || 0;

    if (currentCredits < creditCost) {
      throw new Error(`Insufficient credits. You need ${creditCost} but have ${currentCredits}`);
    }

    // 3. Create purchase record
    const { error: purchaseError } = await supabase
      .from('purchased_leads')
      .insert({
        job_id: job.id,
        service_provider_id: currentUser.id,
        price_paid: creditCost,
        purchased_at: new Date().toISOString()
      });

    if (purchaseError) {
      console.error('❌ Error creating purchase:', purchaseError);

      // Check if already purchased
      if (purchaseError.code === '23505') { // Unique constraint violation
        throw new Error('You have already purchased this lead');
      }
      throw purchaseError;
    }

    // 4. Update job status
    const { error: updateError } = await supabase
      .from('client_jobs')
      .update({
        status: 'in_progress',
        is_active: false,
        reserved_until: null,
        reserved_by: currentUser.id  // Keep purchaser ID, don't null it
      })
      .eq('id', leadId);

    if (updateError) {
      console.error('❌ Error updating job status:', updateError);
      // Continue even if this fails - purchase is already recorded
    }

    // 5. Deduct credits from USER table (not service_providers)
    const { error: creditError } = await supabase
      .from('user')
      .update({
        credits: currentCredits - creditCost
      })
      .eq('id', currentUser.id);

    if (creditError) {
      console.error('❌ Error deducting credits:', creditError);
      throw new Error('Failed to deduct credits');
    }

    console.log('✅ Lead purchased successfully:', leadId);

    // Return updated data
    return {
      job,
      creditsDeducted: creditCost,
      newBalance: currentCredits - creditCost
    };

  } catch (err: any) {
    console.error('❌ Failed to purchase lead:', err);
    throw err;
  }
};

/**
 * Get all purchased leads for current user
 */
export const getUserPurchases = async () => {
  try {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) throw new Error('User not logged in');

    const currentUser = JSON.parse(storedUser);

    const { data, error } = await supabase
      .from('purchased_leads')
      .select(`
        *,
        job:client_jobs(
          *,
          client:user!client_id(
            id,
            full_name,
            email,
            phone
          )
        )
      `)
      .eq('service_provider_id', currentUser.id)
      .order('purchased_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching purchases:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('❌ Error in getUserPurchases:', error);
    throw error;
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
        reserved_until: null,
        reserved_by: null
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