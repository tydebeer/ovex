export interface Currency {
  id: string;
  name: string;
  symbol: string;
  explorer_transaction: string;
  explorer_address: string;
  type: string;
  erc20: boolean;
  deposit_fee: string;
  min_deposit_amount: string;
  min_confirmations: number;
  withdraw_fee: string;
  min_withdraw_amount: string;
  withdraw_limit_24h: string;
  withdraw_limit_72h: string;
  deposit_enabled: boolean;
  withdrawal_enabled: boolean;
  instant_exchange: boolean;
  base_factor: number;
  precision: number;
  display_precision: number;
  icon_url: string;
  updated_at: string;
} 