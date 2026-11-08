export interface TAdmitStudent {
  id: string;
  name: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  email?: string | null;
  student_phone?: string | null;
  father_phone?: string | null;
  photo?: string | null;
  sub_district?: string | null;
  district?: string | null;
}

export interface TAdmitEnrollment {
  id: string;
  student_id: string;
  roll_number?: string | null;
  registration_number?: string | null;
  merit_position?: number | null;
  student: TAdmitStudent;
  academicSession?: { id: string; session_name: string } | null;
  academicClass?: {
    id: string;
    class_name: string;
    class_level?: number | null;
    year_level?: number | null;
    program?: { id: string; program_name: string } | null;
    department?: { id: string; department_name: string } | null;
  } | null;
  academicSection?: { id: string; section_name: string } | null;
  batch?: { id: string; batch_name: string } | null;
  shift?: { id: string; name: string } | null;
}

export interface TAdmitExamSchedule {
  id: string;
  examDate: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number | null;
  fullMarks?: number | null;
  passMarks?: number | null;
  examTakenYear?: number | null;
  subject?: { id: string; name: string } | null;
}

export interface TAdmitExam {
  id: string;
  academic_class_id: string;
  exam_name: string;
  exam_date: string;
  is_published: boolean;
  program_id?: string | null;
  program?: { id: string; program_name: string } | null;
  department_id?: string | null;
  department?: { id: string; department_name: string } | null;
  batch_id?: string | null;
  batch?: { id: string; batch_name: string } | null;
  academicClass?: {
    id: string;
    class_name: string;
    year_level?: number | null;
  } | null;
  examSchedules?: TAdmitExamSchedule[];
}

export interface TInstitutionInfo {
  mode?: string | null;
  name?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  logo?: string | null;
}
