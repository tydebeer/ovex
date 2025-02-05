export interface RFQuote {
  market: string;
  side: 'buy' | 'sell';
  from_currency: string;
  from_amount: string;
  to_currency: string;
  to_amount: string;
  rate: string;
  rate_is_from_currency: boolean;
  requested_at: number;
  expires_at: number;
  is_prefunded: boolean;
  sn: string | null;
  message: string | null;
} 