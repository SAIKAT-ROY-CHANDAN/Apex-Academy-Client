export interface TPromotionStudent {
  id: string;
  name: string;
  father_name?: string | null;
  mother_name?: string | null;
  gender?: string | null;
  student_phone?: string | null;
  email?: string | null;
  photo?: string | null;
}

export interface TPromotionEnrollment {
  id: string;
  student_id: string;
  roll_number?: string | null;
  registration_number?: string | null;
  enrollment_status?: string | null;
  enrollment_type?: string | null;
  subject_fail_count?: number | null;
  is_primary?: boolean | null;
  student: TPromotionStudent;
  academicSession?: { id: string; session_name: string } | null;
  academicClass?: {
    id: string;
    class_name: string;
    academicSections?: Array<{ id: string; section_name: string }>;
  } | null;
  academicSection?: { id: string; section_name: string } | null;
  batch?: { id: string; batch_name: string } | null;
  shift?: { id: string; name: string } | null;
}

export type TPromotionOutcome = "PROMOTED" | "WITH_BACKLOG" | "REPEATED";

export interface TSupplementaryAttempt {
  id: string;
  student_id: string;
  academic_session_id: string;
  academic_class_id: string;
  enrollment_status: string;
  enrollment_type: string;
  subject_fail_count: number;
  is_primary: boolean | null;
  created_at: string;
  academicSession?: { id: string; session_name: string } | null;
  academicClass?: { id: string; class_name: string } | null;
}

export interface TPromotionLookups {
  sessions: Array<{ id: string; session_name: string }>;
  classes: Array<{
    id: string;
    class_name: string;
    program_id?: string | null;
    department_id?: string | null;
    academicSections?: Array<{ id: string; section_name: string }>;
  }>;
  batches: Array<{ id: string; batch_name: string }>;
  shifts: Array<{ id: string; name: string }>;
}
