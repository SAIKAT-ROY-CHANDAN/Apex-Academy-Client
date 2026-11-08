export interface StudentFeeCollectionItem {
  fee_item_id: string;
  discount_amount: number;
  paid_amount: number;
  line_total_amount: number;
  fine_amount: number;
}

export interface StudentFeeCollection {
  id: string;
  student_id: string;
  fee_type_id: string;
  studentFeeCollectionItems: StudentFeeCollectionItem[];
}