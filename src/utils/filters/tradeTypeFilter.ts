import { TradeType } from '../../../types';

export interface Lead {
  id: string;
  serviceRequired: TradeType;
  [key: string]: any;
}

export const filterByTradeType = (
  leads: Lead[],
  userTradeTypes: TradeType[]
): Lead[] => {
  return leads.filter(lead =>
    userTradeTypes.includes(lead.serviceRequired)
  );
};