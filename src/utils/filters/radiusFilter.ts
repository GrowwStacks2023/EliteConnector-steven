import { calculateDistance } from '../distance/distanceCalculator';

export interface LeadWithCoords {
  id: string;
  latitude?: number;
  longitude?: number;
  calculatedDistance?: number | null;
  [key: string]: any;
}

export interface UserCoords {
  latitude?: number;
  longitude?: number;
  operatingRadius?: number;
}

export const filterByRadius = (
  leads: LeadWithCoords[],
  user: UserCoords
): LeadWithCoords[] => {
  const userLat = user.latitude;
  const userLng = user.longitude;
  const radius = user.operatingRadius || 10;

  if (!userLat || !userLng) {
    console.warn('⚠️ User coordinates not set, skipping radius filter');
    return leads.map(lead => ({ ...lead, calculatedDistance: null }));
  }

  return leads
    .map(lead => {
      let distance: number | null = null;

      if (lead.latitude && lead.longitude) {
        distance = calculateDistance(
          userLat,
          userLng,
          lead.latitude,
          lead.longitude
        );
      }

      return { ...lead, calculatedDistance: distance };
    })
    .filter(lead => {
      if (lead.calculatedDistance === null) return true; // Keep if no coords
      return lead.calculatedDistance <= radius;
    });
};