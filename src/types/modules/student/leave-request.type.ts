// Values MUST match the Prisma `LeaveType` enum in server/prisma/schema.prisma
// and the canonical lists in `@/constant/leave/leaveType` / `@/constant/leave/studentLeaveType`.
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
  SICK_LEAVE = "SICK_LEAVE",
  DOCTORS_APPOINTMENT = "DOCTORS_APPOINTMENT",
  MENTAL_HEALTH_LEAVE = "MENTAL_HEALTH_LEAVE",
  FAMILY_FUNCTION = "FAMILY_FUNCTION",
  EMERGENCY_LEAVE = "EMERGENCY_LEAVE",
  TRAVEL_VACATION = "TRAVEL_VACATION",
  EXAM_PREPARATION_LEAVE = "EXAM_PREPARATION_LEAVE",
  INTERNSHIP_PROJECT_WORK = "INTERNSHIP_PROJECT_WORK",
  RELIGIOUS_FESTIVALS = "RELIGIOUS_FESTIVALS",
  PERSONAL_REASONS = "PERSONAL_REASONS",
}

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export type TStudentLeaveRequest = {
  id: string;
  student_id: string;
  leave_type: LeaveType;
  reason: string;
  start_date: string;
  end_date: string;
  status: LeaveStatus;
  created_at: string;
  updated_at: string;
  student: {
    id: string;
    name: string;
    email: string | null;
    photo: string | null;
    student_phone: string | null;
    father_phone: string;
    gender: string;
    studentEnrollments: Array<{
      is_primary?: boolean;
      roll_number: string | null;
      registration_number: string;
      academicClass: {
        id: string;
        class_name: string;
        class_level: number | null;
      } | null;
      academicSection: { id: string; section_name: string } | null;
      academicSession: { id: string; session_name: string } | null;
      batch: { id: string; batch_name: string } | null;
    }>;
  };
};

export type TStudentLeaveRequestResponse = {
  success: boolean;
  message?: string;
  data: TStudentLeaveRequest[] | TStudentLeaveRequest;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
};

export type TStudentLeaveStats = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
};
