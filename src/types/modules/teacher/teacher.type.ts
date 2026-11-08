import { Department } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import { TShift } from "../shift/shift.type";
import { TDesignation } from "../designation/designation.type";

export type AddTeacherFormProps = {
  mode: string;
  shifts: { id: string; name: string }[];
  programs: {
    id: string;
    program_name: string;
    departments: { id: string; name: string }[];
  }[];
  designations: { id: string; name: string }[];
};

export type TTeacher = {
  id: string;
  full_name: string;
  email?: string;
  phone: string;
  bkash_number?: string;
  address?: string;
  photo?: string;
  gender?: string;
  last_qualification?: string;
  academic_document?: string;
  previous_institution_resign_letter?: string;
  nid_front?: string;
  nid_back?: string;
  isResigned?: boolean;
  is_active?: boolean;
  designation_id: string;
  designation: TDesignation;
  shift_id: string;
  shift?: TShift;
  department_id: string;
  department?: Department;
  teacher_type: string;
  administrative_position?: string;
  overtimeTeacherConfig?: TTeacherOvertimeConfig;
}

export type TTeacherOvertimeConfig = {
  id: string;
  teacher_id: string;
  teacher: TTeacher;
  overtime_hourly_amount: number;
  created_at: string;
  updated_at: string;
}

export type TTeacherOverview = {
  totalApproveLeaves: number;
  totalPendingLeaves: number;
  totalRejectedLeaves: number;
  averageAttendancePercentage: number;
  averageAbsentPercentage: number;
  totalOvertimeHours: number;
}