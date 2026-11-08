export type ExpenseDay = {
  date: string;
  totalAmount: number;
  expenseCount: number;
};

export type ExpenseMonth = {
  month: string; // YYYY-MM
  year: number;
  totalAmount: number;
  expenseCount: number;
  days: ExpenseDay[];
};

export type MonthlyExpenseReport = {
  month: string;
  year: number;
  totalAmount: number;
  expenseCount: number;
  days: ExpenseDay[];
};

export type ExpenseReportResponse = {
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: MonthlyExpenseReport[];
};