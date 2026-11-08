export interface DashboardOverviewResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: DashboardOverviewData;
}

export interface DashboardOverviewData {
  summary: SummaryData;
  students: StudentsData;
  teachers: TeachersData;
  staff: StaffData;
  attendance: AttendanceData;
  leaves: LeavesData;
}

export interface SummaryData {
  totalStudents: number;
  totalTeachers: number;
  totalStaff: number;
  totalStudentLeaves: number;
  totalTeacherLeaves: number;
  totalStaffLeaves: number;
}

export interface StudentsData {
  gender: Record<string, number>;
  religion: Array<{ religion: string | null; count: number }>;
  classWise: Array<{ classId: string; className: string | null; count: number }>;
}

export interface TeachersData {
  gender: Record<string, number>;
  typeWise: Array<{ teacherType: string | null; count: number }>;
  subjectWise: Array<{ subjectId: string | null; subjectName: string | null; count: number }>;
}

export interface StaffData {
  gender: Record<string, number>;
}

export interface AttendanceData {
  students: AttendanceSection;
  teachers: AttendanceSection;
  staff: AttendanceSection;
}

export interface AttendanceSection {
  present: number;
  absent: number;
  total: number;
  percentage: number;
}

export interface LeavesData {
  students: LeaveSection;
  teachers: LeaveSection;
  staff: LeaveSection;
}

export interface LeaveSection {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface DashboardFilter {
  student?: { gender?: string; religion?: string; class_name?: string };
  teacher?: { teacher_type?: string; subject?: string };
  staff?: { staff_type?: string };
  class?: { class_name?: string };
  subject?: { name?: string };
  studentAttendance?: { attendance_status?: string };
  teacherAttendance?: { attendance_status?: string };
  staffAttendance?: { attendance_status?: string };
  teacherLeave?: { leave_status?: string };
  staffLeave?: { leave_status?: string };
}