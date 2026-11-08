export type TAttendanceStatus = "present" | "absent" | null;

export type TStudentAttendance = {
  slNo: number;
  name: string;
  avatarUrl: string;
  class: string;
  department: string;
  batch: string;
  year: string;
  section: string;
  courseTitle: string;
  attendance: TAttendanceStatus;
};
