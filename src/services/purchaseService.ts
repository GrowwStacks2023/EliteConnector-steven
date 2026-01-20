import { supabase } from '../lib/supabaseClient';

export interface ServiceProviderDetails {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  serviceType?: string;
  address?: string;
  zipcode?: string;
  qualifications?: string;
  experience?: string;
  is_verified?: boolean;
}

export interface LeadPurchase {
  id: string;
  job_id: string;
  service_provider_id: string;
  purchased_at: string;
  price_paid: number;
  created_at: string;
  service_provider: ServiceProviderDetails;
}

export interface PortfolioProject {
  id: string;
  user_id: string;
  title: string;
  description: string;
  images: string[];
  date_completed: string;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Fetch all purchases for a specific job/lead
 */
export const fetchJobPurchases = async (jobId: string): Promise<LeadPurchase[]> => {
  try {
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchased_leads')
      .select('*')
      .eq('job_id', jobId)
      .order('purchased_at', { ascending: false });

    if (purchasesError) throw purchasesError;

    if (!purchases || purchases.length === 0) {
      return [];
    }

    // Get unique service provider IDs
    const providerIds = [...new Set(purchases.map(p => p.service_provider_id))];

    // Fetch service provider details from user table
    const { data: providers, error: providersError } = await supabase
      .from('user')
      .select('id, full_name, email, phone, role, serviceType, address, zipcode, qualifications, experience, is_verified')
      .in('id', providerIds);

    if (providersError) throw providersError;

    // Create a map for quick lookup
    const providersMap = new Map(
      (providers || []).map(p => [p.id, p])
    );

    // Combine purchases with provider details
    const enrichedPurchases: LeadPurchase[] = purchases.map(purchase => ({
      id: purchase.id,
      job_id: purchase.job_id,
      service_provider_id: purchase.service_provider_id,
      purchased_at: purchase.purchased_at,
      price_paid: purchase.price_paid,
      created_at: purchase.created_at,
      service_provider: providersMap.get(purchase.service_provider_id) || {
        id: purchase.service_provider_id,
        full_name: 'Unknown Provider',
        email: '',
        phone: '',
        role: ''
      }
    }));

    return enrichedPurchases;
  } catch (err) {
    console.error('Error fetching job purchases:', err);
    throw err;
  }
};

/**
 * Fetch all purchases for all jobs of a specific client
 */
export const fetchClientJobPurchases = async (clientId: string): Promise<Map<string, LeadPurchase[]>> => {
  try {
    // First, get all jobs for this client
    const { data: jobs, error: jobsError } = await supabase
      .from('client_jobs')
      .select('id')
      .eq('client_id', clientId);

    if (jobsError) throw jobsError;

    const jobIds = jobs?.map(job => job.id) || [];

    if (jobIds.length === 0) {
      return new Map();
    }

    // Fetch all purchases for these jobs
    const { data: purchases, error: purchasesError } = await supabase
      .from('purchased_leads')
      .select('*')
      .in('job_id', jobIds)
      .order('purchased_at', { ascending: false});

    if (purchasesError) throw purchasesError;

    if (!purchases || purchases.length === 0) {
      return new Map();
    }

    // Get unique service provider IDs
    const providerIds = [...new Set(purchases.map(p => p.service_provider_id))];

    // Fetch service provider details
    const { data: providers, error: providersError } = await supabase
      .from('user')
      .select('id, full_name, email, phone, role, serviceType, address, zipcode, qualifications, experience, is_verified')
      .in('id', providerIds);

    if (providersError) throw providersError;

    // Create a map for quick lookup
    const providersMap = new Map(
      (providers || []).map(p => [p.id, p])
    );

    // Group purchases by job_id with enriched provider data
    const purchasesByJob = new Map<string, LeadPurchase[]>();
    
    purchases.forEach(purchase => {
      const enrichedPurchase: LeadPurchase = {
        id: purchase.id,
        job_id: purchase.job_id,
        service_provider_id: purchase.service_provider_id,
        purchased_at: purchase.purchased_at,
        price_paid: purchase.price_paid,
        created_at: purchase.created_at,
        service_provider: providersMap.get(purchase.service_provider_id) || {
          id: purchase.service_provider_id,
          full_name: 'Unknown Provider',
          email: '',
          phone: '',
          role: ''
        }
      };

      if (!purchasesByJob.has(purchase.job_id)) {
        purchasesByJob.set(purchase.job_id, []);
      }
      purchasesByJob.get(purchase.job_id)!.push(enrichedPurchase);
    });

    return purchasesByJob;
  } catch (err) {
    console.error('Error fetching client job purchases:', err);
    throw err;
  }
};

/**
 * Fetch service provider's portfolio projects
 * ONLY returns projects where is_visible = true
 */
export const fetchServiceProviderProjects = async (serviceProviderId: string): Promise<PortfolioProject[]> => {
  try {
    const { data, error } = await supabase
      .from('serviceprovider_portfolio')
      .select('*')
      .eq('user_id', serviceProviderId)
      .eq('is_visible', true)
      .order('date_completed', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching portfolio:', error);
      return [];
    }

    console.log('✅ Visible portfolio projects found:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Error fetching service provider projects:', err);
    return [];
  }
};