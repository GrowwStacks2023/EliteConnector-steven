import { useState, useEffect } from 'react';
import { fetchActiveLeads, LeadData } from '../services/leadsService';
import { TradeType } from '../../types';

export interface Lead {
  id: string;
  clientName: string;
  serviceRequired: TradeType;
  description: string;
  location: string;
  zipcode: string;
  latitude?: number;
  longitude?: number;
  postedDate: string;
  price: number;
  budget_min: number | null;
  calculatedDistance?: number | null;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return '1 day ago';
  return `${diffDays} days ago`;
};

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        const data = await fetchActiveLeads();

        const mappedLeads: Lead[] = data.map(job => ({
          id: job.id,
          clientName: 'Client', // You can fetch client name from user table if needed
          serviceRequired: job.category,
          description: job.description,
          location: job.location,
          zipcode: job.zipcode,
          latitude: job.latitude,
          longitude: job.longitude,
          postedDate: formatDate(job.created_at),
          price: 1, // You can calculate based on budget or other logic
          budget_min: job.budget_min
        }));

        setLeads(mappedLeads);
      } catch (err: any) {
        console.error('❌ Error loading leads:', err);
        setError(err.message || 'Failed to load leads');
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []);

  return { leads, loading, error };
};