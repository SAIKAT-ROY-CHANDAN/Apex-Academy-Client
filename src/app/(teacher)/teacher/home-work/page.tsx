import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import PageRoute from "../components/dynamicRoute";
import HomeworkTable from "./_components/HomeworkTable";
import HomeworkFilters from "./_components/HomeworkFilters";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getHomeworks } from "@/services/homework";
import { getPrograms } from "@/services/program";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getInstitutionDetails } from "@/services/institution";
import { QueryParams } from "@/types/shared/query.type";
import { THomeworkResponse } from "@/types/modules/teacher/homework.type";

const HomeworkPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search = searchParams.search;
  const programId = searchParams.program_id;
  const departmentId = searchParams.department_id;
  const classId = searchParams.class_id;
  const sectionId = searchParams.section_id;
  const subjectId = searchParams.subject_id;
  const fromDate = searchParams.from_date;
  const toDate = searchParams.to_date;

  const loggedInTeacher = await loggedInTeacherUser();
  const institutionDetails = await getInstitutionDetails();
  const mode = institutionDetails?.data?.mode || "SCHOOL";

  // Build filter object for backend (buildPrismaQuery expects filter as JSON)
  const filter: Record<string, any> = {
    teacher_id: loggedInTeacher.id,
  };
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

  // searchTerm must be a top-level query param, NOT inside filter
  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const [homeworkRes, programsRes, classesRes] = await Promise.all([
    getHomeworks(query),
    getPrograms([]),
    getAcademicClassDetails([]),
  ]);

  const response = homeworkRes as THomeworkResponse;
  const meta = response?.meta;
  const homeworks = response?.data ?? [];
  const programs = programsRes?.data ?? [];
  const classes = classesRes?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageRoute
            title="Homework"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Homework" },
            ]}
          />
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all duration-200"
            >
              <FaArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Link>
            <Link
              href="/teacher/home-work/create"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaPlus className="w-4 h-4" />
              <span>Create Homework</span>
            </Link>
          </div>
        </div>

        <HomeworkFilters
          mode={mode}
          programs={programs}
          classes={classes}
        />

        <HomeworkTable
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
    </div>
  );
};

export default HomeworkPage;