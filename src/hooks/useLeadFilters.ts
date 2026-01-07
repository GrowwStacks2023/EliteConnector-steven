import { useMemo } from 'react';
import { filterByTradeType } from '../utils/filters/tradeTypeFilter';
import { filterByRadius } from '../utils/filters/radiusFilter';
import { Lead } from './useLeads';
import { TradeType, User } from '../../types';

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

    // Filter 3: Radius Filter (with distance calculation)
    filtered = filterByRadius(filtered, {
      latitude: user.latitude,
      longitude: user.longitude,
      operatingRadius: user.operatingRadius
    });

    return filtered;
  }, [leads, user, categoryFilter]);
};