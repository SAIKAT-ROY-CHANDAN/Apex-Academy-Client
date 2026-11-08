export type TDepositItem = {
  id: string;
  item_name: string;
  item_amount: number;
  description?: string;
  details?: string;
};

export type TDeposit = {
  id: string;
  deposit_type_id: string;
  total_amount: number;
  deposit_date?: string;
  description?: string;
  details?: string;
  created_at?: string;
  updated_at?: string;
  depositItems?: TDepositItem[];
  depositType?: { id: string; name: string };
  deposit_type?: { id: string; name: string };
};