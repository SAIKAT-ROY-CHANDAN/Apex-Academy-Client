export type DueFeeItem = {
  fee_item_name: string;
  line_total_amount: number;
  paid_amount: number;
  discount_amount: number;
  fine_amount: number;
  due_amount: number;
};

export type StudentDue = {
  student_id: string;
  student_name: string;
  student_phone: string;
  father_phone: string;
  class_name: string;
  session_name: string;
  registration_number: string;
  totalLineAmount: number;
  totalPaidAmount: number;
  totalDiscountAmount: number;
  totalFineAmount: number;
  dueAmount: number;
  feeItems: DueFeeItem[];
};

export type DueReportSummary = {
  totalDueAmount: number;
  totalStudentsWithDue: number;
  totalLineAmount: number;
  totalPaidAmount: number;
};

export type StudentDueReport = {
  summary: DueReportSummary;
  students: StudentDue[];
};

export type StudentDueReportResponse = {
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: StudentDueReport;
};