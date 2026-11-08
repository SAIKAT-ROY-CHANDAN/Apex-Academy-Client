export type TStudentFilterValues = {
  program_id: string;
  department_id: string;
  academic_class_id: string;
};

export const emptyStudentFilters: TStudentFilterValues = {
  program_id: "",
  department_id: "",
  academic_class_id: "",
};

const trimOrEmpty = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

/** Normalize URL `searchParams` into filter values ("" = all). */
export const parseStudentFilters = (params: {
  program_id?: string | string[];
  department_id?: string | string[];
  academic_class_id?: string | string[];
  class_id?: string | string[];
}): TStudentFilterValues => {
  const pick = (v?: string | string[]) =>
    trimOrEmpty(Array.isArray(v) ? v[0] : v);
  return {
    program_id: pick(params.program_id),
    department_id: pick(params.department_id),
    // Accept both `academic_class_id` (canonical) and `class_id` (legacy alias).
    academic_class_id: pick(params.academic_class_id) || pick(params.class_id),
  };
};

export const hasStudentFilters = (filters: TStudentFilterValues) =>
  Boolean(
    filters.program_id || filters.department_id || filters.academic_class_id,
  );

/**
 * Backend contract (verified in-repo):
 * `GET /student?filter=<JSON>` — same shape used by
 * `searchStudentsForHostelFee` (CollectFeesForm) and `student-promotions`.
 * Program/department live on the academic class, so they nest under
 * `enrollmentWhere.academicClass = { is: ... }`.
 */
export const buildStudentEnrollmentFilter = (
  filters: TStudentFilterValues,
): Record<string, unknown> => {
  const academicClassWhere: Record<string, string> = {};
  if (filters.program_id) academicClassWhere.program_id = filters.program_id;
  if (filters.department_id)
    academicClassWhere.department_id = filters.department_id;

  const enrollmentWhere: Record<string, unknown> = {};
  if (filters.academic_class_id) {
    enrollmentWhere.academic_class_id = filters.academic_class_id;
  } else if (Object.keys(academicClassWhere).length > 0) {
    enrollmentWhere.academicClass = { is: academicClassWhere };
  }

  if (Object.keys(enrollmentWhere).length === 0) return {};
  return { studentEnrollments: { some: enrollmentWhere } };
};
