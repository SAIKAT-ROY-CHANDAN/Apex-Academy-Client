import { TDesignation } from "../designation/designation.type";

export type TStaff = {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  bkash_number?: string;
  address?: string;
  photo?: string;
  gender?: string;
  academic_qualification?: string;
  academic_document?: string;
  previous_institution_resign_letter?: string;
  nid_front?: string;
  nid_back?: string;
  isResigned?: boolean;
  is_active?: boolean;
  designation_id: string;
  designation: TDesignation;
  staff_type: string;
  overtimeStaffConfigs?: {
    id: string;
    overtime_hourly_amount: number;
  }[];
};