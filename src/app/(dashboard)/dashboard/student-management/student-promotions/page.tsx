import { GraduationCap } from "lucide-react";
import type { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getAcademicSessions } from "@/services/academicSession";
import { getBatchDetails } from "@/services/batch";
import { getInstitutionDetails } from "@/services/institution";
import { getPrograms } from "@/services/program";
import { getShifts } from "@/services/shift";
import { getStudentEnrollments } from "@/services/studentEnrollment";
import type { QueryParams } from "@/types/shared/query.type";
import PromotionFilters from "./_components/PromotionFilters";
import PromotionTable from "./_components/PromotionTable";
import type { TPromotionEnrollment } from "./_components/types";

const PAGE_SIZE = 10;

const StudentPromotionsPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const programId =
    typeof searchParams.program_id === "string" ? searchParams.program_id : "";
  const departmentId =
    typeof searchParams.department_id === "string"
      ? searchParams.department_id
      : "";
  const classId =
    typeof searchParams.class_id === "string" ? searchParams.class_id : "";
  const sectionId =
    typeof searchParams.section_id === "string" ? searchParams.section_id : "";
  const sessionId =
    typeof searchParams.session_id === "string" ? searchParams.session_id : "";
  const batchId =
    typeof searchParams.batch_id === "string" ? searchParams.batch_id : "";
  const shiftId =
    typeof searchParams.shift_id === "string" ? searchParams.shift_id : "";

  const hasFilter = !!(
    search ||
    programId ||
    departmentId ||
    classId ||
    sectionId ||
    sessionId ||
    batchId ||
    shiftId
  );

  // Lookups are always needed — filters on first load, promotion targets after.
  // Programs come with nested departments → classes → sections for the hierarchy.
  const [
    institutionRes,
    sessionsRes,
    programsRes,
    classesRes,
    batchesRes,
    shiftsRes,
  ] = await Promise.all([
    getInstitutionDetails(),
    getAcademicSessions([]),
    getPrograms([]),
    getAcademicClassDetails([]),
    getBatchDetails([]),
    getShifts([]),
  ]);

  const mode = institutionRes?.data?.mode || "SCHOOL";
  const sessions = sessionsRes?.data ?? [];
  const programs = (programsRes?.data ?? []) as TProgram[];
  const classes = (classesRes?.data ?? []) as TAcademicClass[];
  const batches = batchesRes?.data ?? [];
  const shifts = shiftsRes?.data ?? [];

  // First load shows only the filter — fetch students only once filtered.
  let enrollments: TPromotionEnrollment[] = [];
  let meta: { totalPages?: number; totalItems?: number } | undefined;

  if (hasFilter) {
    const filter: Record<string, unknown> = {};
    if (sessionId) filter.academic_session_id = sessionId;
    if (sectionId) filter.academic_section_id = sectionId;
    if (batchId) filter.batch_id = batchId;
    if (shiftId) filter.shift_id = shiftId;

    // Hierarchy narrows top-down: a selected class wins, otherwise the
    // department, otherwise the program — resolved through the
    // enrollment → class → department → program relations.
    if (classId) {
      filter.academic_class_id = classId;
    } else if (departmentId) {
      filter.academicClass = { department_id: departmentId };
    } else if (programId) {
      filter.OR = [
        { academicClass: { program_id: programId } },
        { academicClass: { department: { program_id: programId } } },
      ];
    }

    const query: QueryParams[] = [
      { label: "page", value: page.toString() },
      { label: "limit", value: String(PAGE_SIZE) },
      { label: "filter", value: JSON.stringify(filter) },
    ];
    if (search) {
      query.push({ label: "searchTerm", value: search });
    }

    const enrollmentsRes = await getStudentEnrollments(query);
    meta = enrollmentsRes?.meta;
    enrollments = (enrollmentsRes?.data ?? []) as TPromotionEnrollment[];
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Promotions"
        backHref="/dashboard/student-management"
      />

      <PromotionFilters
        mode={mode}
        sessions={sessions}
        programs={programs}
        classes={classes}
        batches={batches}
        shifts={shifts}
      />

      {hasFilter ? (
        <>
          <PromotionTable
            enrollments={enrollments}
            currentPage={page}
            pageSize={PAGE_SIZE}
            lookups={{ sessions, classes, batches, shifts }}
            mode={mode}
            programs={programs}
            filterProgramId={programId}
            filterDepartmentId={departmentId}
          />
          {(meta?.totalPages ?? 0) > 1 && (
            <PaginationWrapper
              totalPages={meta?.totalPages ?? 1}
              totalItems={meta?.totalItems ?? enrollments.length}
              active={page}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/70 bg-white py-16 text-center shadow-sm">
          <GraduationCap className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-slate-900">
            Find students to promote
          </p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Use the filters above to find students by program, department,
            class, session, batch or shift — then promote them one by one to the
            next session and class.
          </p>
        </div>
      )}
    </div>
  );
};

export default StudentPromotionsPage;
