
export type SalaryAdvance = {
  id: string;
  teacher_id: string;
  staff_id: string | null;
  advance_amount: number;
  reason: string;
  given_at: string;
  payment_method: string;
  transaction_id: string | null;
  bkash_sender_number: string | null;
  bkash_receiver_number: string | null;
  payment_note: string | null;
  advance_status: string;
  paid_by_admin_id?: string | null;
  paid_by_admin?: {
    id: string;
    name: string;
    email?: string;
  } | null;
  is_deducted?: boolean;
  created_at: string;
  updated_at: string;
};

export type TeacherOvertime = {
  id?: string;
  teacher_id?: string;
  overtime_hours?: number;
  overtime_amount?: number;
  overtime_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type OvertimeTeacherConfig = {
  id: string;
  teacher_id: string;
  overtime_hourly_amount: number;
  created_at: string;
  updated_at: string;
};

export type TeacherRecord = {
  id: string;
  full_name: string;
  teacher_type: string;
  designation?: {
    name: string;
  } | null;
  department?: {
    name: string;
  } | null;
  shift?: {
    name: string;
  } | null;
  salary?: {
    total_amount: number;
  } | null;
  salaryAdvances?: SalaryAdvance[];
  teacherOvertimes?: TeacherOvertime[];
  overtimeTeacherConfig?: OvertimeTeacherConfig | null;
};

// export type TeacherPayrollRow = {
//   id: string;
//   name: string;
//   designation: string;
//   department: string;
//   teacherType: string;
//   shift: string;
//   totalSalary: number;
// };

export type PayrollStatus = "Paid" | "Pending" | "NOT_GENERATED" | string;

export type TeacherPayrollRow = {
  id: string;
  teacherId?: string;
  name: string;
  designation: string;
  department: string;
  teacherType?: string;
  shift?: string;
  totalSalary: number;

  advanceSalary?: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  payableAmount?: number;
  status?: PayrollStatus;
  generated?: boolean;
  sl?: number;
};

export type FilterValues = {
  teacherType: string;
  designation: string;
  department: string;
  shift: string;
  search: string;
};

export type PayrollFilterOption = {
  id: string;
  name: string;
};

export interface TeachersPayrollFiltersProps {
  currentFilters: FilterValues;
  designations: PayrollFilterOption[];
  departments: PayrollFilterOption[];
  shifts: PayrollFilterOption[];
}

// Staff Payroll Types
export type StaffPayrollRow = {
  id: string;
  staffId?: string;
  name: string;
  designation: string;
  department?: string;
  staffType?: string;
  totalSalary: number;

  advanceSalary?: number;
  overtimeHours?: number;
  overtimeAmount?: number;
  shift?: string;
  payableAmount?: number;
  status?: PayrollStatus;
  generated?: boolean;
  sl?: number;
};

export type StaffFilterValues = {
  staffType: string;
  designation: string;
  search: string;
};

export interface StaffPayrollFiltersProps {
  currentFilters: StaffFilterValues;
  designations: PayrollFilterOption[];
}
