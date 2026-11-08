// Values MUST match the Prisma `LeaveType` enum in server/prisma/schema.prisma
// and the canonical list in `@/constant/leave/leaveType`.
export enum LeaveType {
  LEAVE_WITHOUT_PAY = "LEAVE_WITHOUT_PAY",
  SICK = "SICK",
  PAID_TIME_OFF = "PAID_TIME_OFF",
  CASUAL = "CASUAL",
  EARNED = "EARNED",
  COMPENSATORY_OFF = "COMPENSATORY_OFF",
  LOSS_OF_PAY = "LOSS_OF_PAY",
  MATERNITY = "MATERNITY",
  ANNUAL = "ANNUAL",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type TStaffLeave = {
  id: string;
  staff_id: string;
  leave_start_date: string;
  leave_end_date: string;
  leave_type: LeaveType;
  leave_application: string;
  leave_status: LeaveStatus;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    full_name: string;
    phone: string;
    designation?: {
      id: string;
      name: string;
    };
  };
};

export type TStaffLeaveResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    meta: {
      totalItems: number;
      currentPage: number;
      totalPages: number;
      limit: number;
    };
    data: TStaffLeave[];
  };
};

export type TAdminStaffLeaveResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: TStaffLeave[];
};
