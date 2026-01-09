
export enum UserRole {
  ADMIN = 'ADMIN',
  SERVICE_PROVIDER = 'ServiceProvider',  // ← Updated
  CLIENT = 'CLIENT'
}

export enum TradeType {
  PLUMBER = 'Plumber',
  ELECTRICIAN = 'Electrician',
  PLASTERER = 'Plasterer',
  CARPENTER = 'Carpenter',
  PAINTER = 'Painter'
}

export enum SubscriptionTier {
  NONE = 'None',
  TIER1 = 'Tier 1',
  TIER2 = 'Tier 2',
  TIER3 = 'Tier 3'
}

export interface Project {
  id: string;
  title: string;
  description: string;
  images: string[];
  dateCompleted: string;
}

export interface Proposal {
  id: string;
  tradeId: string;
  tradeName: string;
  tradeRating: number;
  tradeType: TradeType;
  message: string;
  quote?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED';
  submittedAt: string;
}

export interface User {
  id: string;
  email: string;
  phone?: string; // NEW
  fullName: string;
  role: UserRole;
  tradeTypes: TradeType[];
  credits: number;
  rating: number;
  subscription?: SubscriptionTier;
  isProfileComplete?: boolean;
  experience?: string;
  age?: number;
  gender?: string;
  address?: string;
  zipcode?: string; // NEW
  insuranceDetails?: string;
  qualifications?: string;
  operatingRadius?: number;
  abandonedLeadIds?: string[];
  declinedLeadIds?: string[];
  projects?: Project[];
  postcode_areas?: string[];
}

export interface Lead {
  id: string;
  clientName: string;
  serviceRequired: TradeType;
  description: string;
  location: string;
  postedDate: string;
  price: number;
  purchasedBy: string[];
  purchasedByTradeTypes: TradeType[];
  drawings?: string[];
  isPremium?: boolean;
  reservedUntil?: number;
  proposals?: Proposal[];
  timeframe?: string; 
   images?: string[];
}

export interface Opportunity {
  id: string;
  leadId: string;
  tradeId: string;
  status: 'PENDING' | 'FORM_SENT' | 'COMPLETED';
  qrCodeUrl: string;
}
