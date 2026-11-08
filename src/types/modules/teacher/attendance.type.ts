export type TTeacherTakenAttendance = {
  attendance_date: string;
  teacher_id: string | null;
  teacher_name: string;
  academic_class_id: string | null;
  class_name: string;
  subject_id: string | null;
  subject_name: string;
  group: string | null;
  total: number;
  present: number;
  absent: number;
};

export type TTeacherTakenAttendanceResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    totalGroups: number;
    totalRecords: number;
  };
  data: TTeacherTakenAttendance[];
};

export type TStudentAttendanceDetail = {
  id: string;
  student_id: string;
  attendance_status: "PRESENT" | "ABSENT";
  teacher_id: string;
  attendance_date: string;
  subject_id: string | null;
  group: string | null;
  academic_class_id: string | null;
  student?: {
    id: string;
    name: string;
    father_name: string;
    mother_name: string;
    photo: string | null;
    studentEnrollments?: {
      is_primary?: boolean;
      academic_session_id: string;
      academic_class_id: string | null;
      roll_number: string | null;
      registration_number: string;
    }[];
  } | null;
  subject?: { id: string; name: string } | null;
  academicClass?: { id: string; class_name: string } | null;
  teacher?: { id: string; full_name: string } | null;
};

export type TTeacherAttendanceDetailsResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: TStudentAttendanceDetail[];
};
