export interface THistoryEnrollment {
  id: string;
  student_id: string;
  academic_session_id?: string | null;
  academic_class_id?: string | null;
  academic_section_id?: string | null;
  batch_id?: string | null;
  shift_id?: string | null;
  roll_number?: string | null;
  registration_number?: string | null;
  enrollment_status?: string | null;
  enrollment_type?: string | null;
  is_primary?: boolean | null;
  subject_fail_count?: number | null;
  created_at?: string;
  student: {
    id: string;
    name: string;
    student_phone?: string | null;
    email?: string | null;
  };
  academicSession?: { id: string; session_name: string } | null;
  academicClass?: { id: string; class_name: string } | null;
  academicSection?: { id: string; section_name: string } | null;
  batch?: { id: string; batch_name: string } | null;
  shift?: { id: string; name: string } | null;
}
