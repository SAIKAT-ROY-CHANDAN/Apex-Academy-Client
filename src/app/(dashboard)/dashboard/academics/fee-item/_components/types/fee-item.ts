export const MONTHS = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER",
] as const;

export type Month = (typeof MONTHS)[number];

export type FeeAssignFor = "REGULAR" | "SUPPLEMENTARY";

export interface FeeItem {
  id: string;
  fee_type_id: string;
  name: string;
 FeeItemType: "Monthly" | "OneTime" | "" | undefined;
  fee_assign_for: FeeAssignFor;
  isFine: boolean;
  payment_start_date: number | null;
  last_payment_date: number | null;
  everydayFine_amount: number | null;
  amount: number;
  amount_every_subject: number | null;
  feeStartMonth: Month | null;
  feeEndMonth: Month | null;
  created_at: string;
  updated_at: string;
}
export type TFeeType = {
  id: string;
  name: string;
  academicClass: any | null;
  created_at: string;
  updated_at: string;
};

export type TFeeItem = {
  id: string;
  fee_type_id: string;
  name: string;
  FeeItemType: "Monthly" | "OneTime" | "" | undefined;
  fee_assign_for: FeeAssignFor;
  isFine: boolean;
  payment_start_date: number | null;
  last_payment_date: number | null;
  everydayFine_amount: number | null;
  amount: number;
  amount_every_subject: number | null;
  feeStartMonth: Month | null;
  feeEndMonth: Month | null;
  created_at: string;
  updated_at: string;
  feeType: TFeeType | null;
};
