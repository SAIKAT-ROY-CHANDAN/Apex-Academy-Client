export type CollectionDay = {
  date: string;
  totalAmount: number;
  collectionCount: number;
};

export type CollectionMonth = {
  month: string; // YYYY-MM
  year: number;
  totalAmount: number;
  collectionCount: number;
  days: CollectionDay[];
};

export type StudentCollectionSummary = {
  student_id: string;
  student_name: string;
  registration_number: string;
  class_name: string;
  totalAmount: number;
  collectionCount: number;
  lastCollectionDate: string;
};

export type CollectionRecord = {
  id: string;
  student_id: string;
  student_name: string;
  registration_number: string;
  class_name: string;
  fee_item_name: string;
  paid_amount: number;
  discount_amount: number;
  line_total_amount: number;
  fine_amount: number;
  collection_date: string;
};

export type StudentCollectionReport = {
  monthly: CollectionMonth[];
  students: StudentCollectionSummary[];
  records: CollectionRecord[];
};

export type StudentCollectionReportResponse = {
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: StudentCollectionReport;
};