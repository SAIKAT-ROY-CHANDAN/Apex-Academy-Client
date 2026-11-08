export type DepositDay = {
  date: string;
  totalAmount: number;
  incomeCount: number;
};

export type DepositMonth = {
  month: string; // YYYY-MM
  year: number;
  totalAmount: number;
  incomeCount: number;
  days: DepositDay[];
};

export type DepositReportResponse = {
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: DepositMonth[];
};