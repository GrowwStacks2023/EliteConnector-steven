import { useState, useEffect } from 'react';
import { fetchActiveLeads } from '../services/leadsService';
import { TradeType } from '../../types';

export interface Lead {
  id: string;
  clientName: string;
  clientEmail: string;
  serviceRequired: TradeType;
  location: string;
  zipcode: string;
  description: string;
  budget_min: number | null;
  postedDate: string;
  price: number;
  timeframe?: string;      // Add this
  images?: string[];       // Add this
}

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveLeads();

        const formattedLeads: Lead[] = data.map((job: any) => ({
          id: job.id,
          clientName: job.client?.full_name || 'Anonymous Client',
          clientEmail: job.client?.email || '',
          serviceRequired: job.category as TradeType,
          location: job.location,
          zipcode: job.zipcode,
          description: job.description,
          budget_min: job.budget,
          postedDate: new Date(job.created_at).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          }),
          price: 5, // Default credit cost per lead
          timeframe: job.timeframe,      // ✅ Added
          images: job.images || []        // ✅ Added
        }));

        setLeads(formattedLeads);
      } catch (err: any) {
        console.error('Error loading leads:', err);
        setError(err.message || 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  return { leads, loading, error };
};