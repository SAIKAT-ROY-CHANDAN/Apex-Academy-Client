import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { getHomeworks } from "@/services/homework";
import { getPrograms } from "@/services/program";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getTeachers } from "@/services/teacher";
import { getInstitutionDetails } from "@/services/institution";
import { QueryParams } from "@/types/shared/query.type";
import { THomeworkResponse } from "@/types/modules/teacher/homework.type";
import AdminHomeworkFilters from "./_components/AdminHomeworkFilters";
import AdminHomeworkTable from "./_components/AdminHomeworkTable";

const DailyHomeworkPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search = searchParams.search;
  const teacherId = searchParams.teacher_id;
  const programId = searchParams.program_id;
  const departmentId = searchParams.department_id;
  const classId = searchParams.class_id;
  const sectionId = searchParams.section_id;
  const subjectId = searchParams.subject_id;
  const fromDate = searchParams.from_date;
  const toDate = searchParams.to_date;

  const institutionDetails = await getInstitutionDetails();
  const mode = institutionDetails?.data?.mode || "SCHOOL";

  const filter: Record<string, any> = {};
  if (teacherId && typeof teacherId === "string") {
    filter.teacher_id = teacherId;
  }
  if (programId && typeof programId === "string") {
    filter.program_id = programId;
  }
  if (departmentId && typeof departmentId === "string") {
    filter.department_id = departmentId;
  }
  if (classId && typeof classId === "string") {
    filter.class_id = classId;
  }
  if (sectionId && typeof sectionId === "string") {
    filter.section_id = sectionId;
  }
  if (subjectId && typeof subjectId === "string") {
    filter.subject_id = subjectId;
  }
  if (fromDate && typeof fromDate === "string") {
    filter.due_date = { gte: new Date(fromDate).toISOString() };
  }
  if (toDate && typeof toDate === "string") {
    filter.due_date = {
      ...(filter.due_date || {}),
      lte: new Date(toDate).toISOString(),
    };
  }

  const query: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
    { label: "filter", value: JSON.stringify(filter) },
  ];

  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const [homeworkRes, programsRes, classesRes, teachersRes] = await Promise.all([
    getHomeworks(query),
    getPrograms([]),
    getAcademicClassDetails([]),
    getTeachers([{ label: "limit", value: "200" }]),
  ]);

  const response = homeworkRes as THomeworkResponse;
  const meta = response?.meta;
  const homeworks = response?.data ?? [];
  const programs = programsRes?.data ?? [];
  const classes = classesRes?.data ?? [];
  const teachers = (teachersRes?.data ?? []).map(
    (t: { id: string; full_name: string }) => ({
      id: t.id,
      name: t.full_name,
    }),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Homework"
        backHref="/dashboard/student-management"
      />

      <AdminHomeworkFilters
        mode={mode}
        programs={programs}
        classes={classes}
        teachers={teachers}
      />

      <AdminHomeworkTable
        homeworks={homeworks}
        currentPage={page}
        totalItems={meta?.totalItems ?? homeworks.length}
        totalPages={meta?.totalPages ?? 1}
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

export default DailyHomeworkPage;
