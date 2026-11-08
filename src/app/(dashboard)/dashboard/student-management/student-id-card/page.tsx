import type { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getAcademicSessions } from "@/services/academicSession";
import { getInstitutionDetails } from "@/services/institution";
import { getPrograms } from "@/services/program";
import { getStudentEnrollments } from "@/services/studentEnrollment";
import type { QueryParams } from "@/types/shared/query.type";
import IdCardFilters from "./_components/IdCardFilters";
import StudentIdCardTable from "./_components/StudentIdCardTable";
import type { TIdCardEnrollment, TInstitutionInfo } from "./_components/types";

const PAGE_SIZE = 10;

const StudentIdCardPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : "";
  const sessionId =
    typeof searchParams.session_id === "string" ? searchParams.session_id : "";
  const classId =
    typeof searchParams.class_id === "string" ? searchParams.class_id : "";
  const sectionId =
    typeof searchParams.section_id === "string" ? searchParams.section_id : "";

  const institutionRes = await getInstitutionDetails();
  const institution = (institutionRes?.data ?? null) as TInstitutionInfo | null;
  const mode = institution?.mode || "SCHOOL";

  const filter: Record<string, unknown> = {};
  if (sessionId) filter.academic_session_id = sessionId;
  if (classId) filter.academic_class_id = classId;
  if (sectionId) filter.academic_section_id = sectionId;

  const query: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: String(PAGE_SIZE) },
    { label: "filter", value: JSON.stringify(filter) },
  ];

  if (search) {
    query.push({ label: "searchTerm", value: search });
  }

  const [enrollmentsRes, sessionsRes, classesRes, programsRes] =
    await Promise.all([
      getStudentEnrollments(query),
      getAcademicSessions([]),
      getAcademicClassDetails([]),
      mode === "COLLEGE_UNIVERSITY"
        ? getPrograms([])
        : Promise.resolve({ success: true, data: [] as TProgram[] }),
    ]);

  const meta = enrollmentsRes?.meta;
  const enrollments = (enrollmentsRes?.data ?? []) as TIdCardEnrollment[];
  const sessions = sessionsRes?.data ?? [];
  const classes = (classesRes?.data ?? []) as TAcademicClass[];
  const programs = (programsRes?.data ?? []) as TProgram[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student ID Card"
        backHref="/dashboard/student-management"
      />

      <IdCardFilters
        mode={mode}
        sessions={sessions}
        programs={programs}
        classes={classes}
      />

      <StudentIdCardTable
        enrollments={enrollments}
        currentPage={page}
        pageSize={PAGE_SIZE}
        institution={institution}
      />

      {meta?.totalPages > 1 && (
        <PaginationWrapper
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          active={page}
        />
      )}
    </div>
  );
};

export default StudentIdCardPage;
