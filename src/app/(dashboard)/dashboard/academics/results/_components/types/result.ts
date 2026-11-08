import type { TStudentExamResult } from "@/types/modules/student/student-result.type";

// The admin listing needs Program / Department context per result. Those live
// on the related examSchedule (same shape the exam-schedule endpoint returns),
// so extend the shared student-facing type here instead of mutating it.
export type TResultRow = Omit<TStudentExamResult, "examSchedule"> & {
  examSchedule?:
    | (NonNullable<TStudentExamResult["examSchedule"]> & {
        program_id?: string | null;
        program?: {
          id: string;
          program_name: string;
        } | null;
        department_id?: string | null;
        department?: {
          id: string;
          department_name: string;
        } | null;
      })
    | null;
};

export type TProgramOption = {
  id: string;
  program_name: string;
};

export type TDepartmentOption = {
  id: string;
  program_id: string | null;
  department_name: string;
};

export type TSubjectOption = {
  id: string;
  name: string;
  class_id?: string | null;
  academicClass?: {
    id?: string;
    program_id?: string | null;
    department_id?: string | null;
    year_level?: number | null;
    class_level?: number | null;
  } | null;
};

export type TAcademicClassOption = {
  id: string;
  program_id: string | null;
  department_id: string | null;
  class_name?: string;
  class_level?: number | null;
  year_level?: number | null;
};

export type TExamOption = {
  id: string;
  exam_name: string;
};

// View model handed to the table: every row carries its resolved
// Program / Department / Year / Subject / Exam so filtering and rendering stay trivial downstream.
export type TEnrichedResultRow = TResultRow & {
  resolvedProgramId: string | null;
  resolvedDepartmentId: string | null;
  resolvedYear: string | null;
  resolvedSubjectId: string | null;
  resolvedExamId: string | null;
  programName: string;
  departmentName: string;
};
