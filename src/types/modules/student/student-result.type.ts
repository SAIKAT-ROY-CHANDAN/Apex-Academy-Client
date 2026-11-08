// Rewired to match backend TStudentResult (obtainMarks/totalMarks/percentage/letterGrade/gradePoint)
// Keep grade/grade_id as legacy-flagged fields – do NOT drop columns until migration/backfill decided.
export type TStudentResultComputed = {
  obtainMarks: number;
  totalMarks: number;
  percentage: number;
  letterGrade: string;
  gradePoint: number;
  status: "Passed" | "Failed";
};

export type TStudentExamResult = {
  id: string;
  student_id: string;
  exam_schedule_id: string;
  obtained_marks: number | string | null;
  grade_id?: string | null; // legacy FK to GradeSystem – flagged, GradeScale is new source
  created_at: string;
  updated_at: string;

  // Enriched computed fields (populated by new grade service when available)
  computed?: TStudentResultComputed | null;
  percentage?: number | null;
  letterGrade?: string | null;
  gradePoint?: number | null;
  status?: "Passed" | "Failed" | null;

  student?: {
    id: string;
    name: string;
    photo: string | null;
  } | null;

  grade?: {
    id: string;
    grade_name: string;
    grade_point: number;
    mark_from: number;
    mark_to: number;
  } | null;

  examSchedule?: {
    id: string;
    examConfigId: string;
    subjectId: string;
    fullMarks: number;
    passMarks: number;
    examDate?: string | null;
    year?: number | null;
    examTakenYear?: number | null;
    examConfig?: {
      id: string;
      exam_name: string;
      exam_date?: string | null;
    } | null;
    subject?: {
      id: string;
      name: string;
      subject_code?: string | null;
    } | null;
  } | null;
};

export type TStudentExamResultResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: TStudentExamResult[];
};
