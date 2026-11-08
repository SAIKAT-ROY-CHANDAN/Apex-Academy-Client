export type TExpenseItem = {
  id: string;
  item_name: string;
  item_amount: number;
  description?: string;
  details?: string;
};

export type TExpense = {
  id: string;
  expense_type_id: string;
  total_amount: number;
  expense_date?: string;
  description?: string;
  details?: string;
  created_at?: string;
  updated_at?: string;
  expenseItems?: TExpenseItem[];
  expenseType?: { id: string; name: string };
  expense_type?: { id: string; name: string };
  // backend include returns expenseType, handle both casings
};