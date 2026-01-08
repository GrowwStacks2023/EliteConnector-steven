import { useMemo } from 'react';
import { filterByTradeType, filterByPostcodeAreas } from '../utils/filters';
import { Lead } from './useLeads';
import { User } from '../../types';

export const useLeadFilters = (
  leads: Lead[],
  user: User,
  categoryFilter: string
) => {
  return useMemo(() => {
    let filtered = leads;

    // Filter 1: Trade Type Match
    filtered = filterByTradeType(filtered, user.tradeTypes);

    // Filter 2: Category Dropdown
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(
        lead => lead.serviceRequired === categoryFilter
      );
    }

    // Filter 3: Postcode Areas Filter
    filtered = filterByPostcodeAreas(filtered, {
      postcode_areas: user.postcode_areas
    });

    return filtered;
  }, [leads, user, categoryFilter]);
};