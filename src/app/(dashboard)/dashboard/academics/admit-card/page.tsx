import type { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getAcademicSessions } from "@/services/academicSession";
import { getExamConfigById, getExamConfigs } from "@/services/examConfig";
import { getInstitutionDetails } from "@/services/institution";
import { getPrograms } from "@/services/program";
import { getStudentEnrollments } from "@/services/studentEnrollment";
import type { QueryParams } from "@/types/shared/query.type";
import AdmitCardFilters from "./_components/AdmitCardFilters";
import AdmitCardTable from "./_components/AdmitCardTable";
import type {
  TAdmitEnrollment,
  TAdmitExam,
  TInstitutionInfo,
} from "./_components/types";

const PAGE_SIZE = 10;

const AdmitCardPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const sessionId =
    typeof searchParams.session_id === "string" ? searchParams.session_id : "";
  const classId =
    typeof searchParams.class_id === "string" ? searchParams.class_id : "";
  const sectionId =
    typeof searchParams.section_id === "string" ? searchParams.section_id : "";
  const examId =
    typeof searchParams.exam_id === "string" ? searchParams.exam_id : "";
  const examType =
    typeof searchParams.exam_type === "string" ? searchParams.exam_type : "";
  const examYear =
    typeof searchParams.exam_year === "string" ? searchParams.exam_year : "";

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

  const [enrollmentsRes, sessionsRes, classesRes, programsRes, examsRes] =
    await Promise.all([
      getStudentEnrollments(query),
      getAcademicSessions([]),
      getAcademicClassDetails([]),
      mode === "COLLEGE_UNIVERSITY"
        ? getPrograms([])
        : Promise.resolve({ success: true, data: [] as TProgram[] }),
      getExamConfigs([]),
    ]);

  const exams = (examsRes?.data ?? []) as TAdmitExam[];

  // Selected exam with its subject-wise schedule (for the admit card)
  let selectedExam: TAdmitExam | null = null;
  let resolvedExamId = examId;

  if (!resolvedExamId && (examType || examYear)) {
    const match = exams.find((e) => {
      const matchesClass = !classId || e.academic_class_id === classId;
      const matchesType = !examType || e.exam_name === examType;
      const scheduleYear = e.examSchedules?.find(
        (s) => s.examTakenYear != null,
      )?.examTakenYear;
      const examDateYear = e.exam_date
        ? new Date(e.exam_date).getFullYear()
        : null;
      const yr =
        scheduleYear != null
          ? String(scheduleYear)
          : examDateYear != null && !Number.isNaN(examDateYear)
            ? String(examDateYear)
            : "";
      const matchesYear = !examYear || yr === examYear;
      return matchesClass && matchesType && matchesYear;
    });
    if (match) {
      resolvedExamId = match.id;
    }
  }

  if (resolvedExamId) {
    const examDetailRes = await getExamConfigById(resolvedExamId);
    selectedExam = (examDetailRes?.data ?? null) as TAdmitExam | null;
  }

  const meta = enrollmentsRes?.meta;
  const enrollments = (enrollmentsRes?.data ?? []) as TAdmitEnrollment[];
  const sessions = sessionsRes?.data ?? [];
  const classes = (classesRes?.data ?? []) as TAcademicClass[];
  const programs = (programsRes?.data ?? []) as TProgram[];

  return (
    <div className="space-y-6">
      <PageHeader title="Admit Card" backHref="/dashboard/academics" />

      <AdmitCardFilters
        mode={mode}
        sessions={sessions}
        programs={programs}
        classes={classes}
        exams={exams}
      />

      <AdmitCardTable
        enrollments={enrollments}
        currentPage={page}
        pageSize={PAGE_SIZE}
        exam={selectedExam}
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

export default AdmitCardPage;
