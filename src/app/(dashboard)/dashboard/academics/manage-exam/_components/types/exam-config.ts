export type TExamConfig = {
  id: string;
  academic_class_id: string;
  academicClass?: {
    id: string;
    class_name: string;
    class_level?: number;
    year_level?: number;
    // NOTE: program/department are NOT nested here on the backend —
    // kept optional in case academicClass itself carries its own program/dept
    // relation separately, but do not rely on this for exam-level program/department.
    // (academicSections is no longer included; the exam's own section comes
    // via the top-level `section` relation.)
  };

  program_id: string;
  program?: {
    id: string;
    program_name: string;
  };

  department_id: string;
  department?: {
    id: string;
    department_name: string;
  };

  section_id?: string | null;
  section?: {
    id: string;
    section_name: string;
  } | null;

  group?: string | null;

  batch_id?: string | null;
  batch?: {
    id: string;
    batch_name?: string;
    [key: string]: unknown;
  } | null;

  exam_name: string;
  exam_date: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;

  examSchedules?: unknown[];
};