export interface HostelExpenseItem {
  id: string;
  hostel_expense_id: string;
  item_name: string;
  item_amount: number;
  item_quantity_or_unit: string;
  created_at?: string;
  updated_at?: string;
}

export interface HostelExpense {
  id: string;
  expense_date: string;
  total_amount: number;
  created_at: string;
  updated_at: string;
  hostelExpenseItems: HostelExpenseItem[];
}
