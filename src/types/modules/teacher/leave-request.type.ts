import type { ApplyLeaveRequestFormValues } from "@/validation/teacher/leave-request.validation";

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

export type TApplyLeaveRequest = ApplyLeaveRequestFormValues;

export type TLeaveRequest = {
  id: string;
  teacher_id: string;
  leave_start_date: string;
  leave_end_date: string;
  leave_type: LeaveType;
  leave_application: string;
  leave_status: LeaveStatus;
  created_at: string;
  updated_at: string;
  otherRequests?: TLeaveRequestBrief[];
  teacher?: {
    id: string;
    full_name: string;
    email?: string | null;
    phone: string;
    photo?: string | null;
    teacher_type?: string;
    administrative_position?: string | null;
    designation?: { id: string; name: string } | null;
    department?: { id: string; department_name: string } | null;
    shift?: { id: string; name: string } | null;
  };
};

export type TLeaveRequestBrief = {
  id: string;
  leave_start_date: string;
  leave_end_date: string;
  leave_type: LeaveType;
  leave_status: LeaveStatus;
};

export type TLeaveRequestResponse = {
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
    data: TLeaveRequest[];
  };
};
