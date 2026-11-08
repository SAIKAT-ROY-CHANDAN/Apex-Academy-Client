import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getInstitutionDetails } from "@/services/institution";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getPrograms } from "@/services/program";
import { getTeacherTakenAttendance } from "@/services/teacherAttendance";
import type { TTeacherTakenAttendanceResponse } from "@/types/modules/teacher/attendance.type";
import PageRoute from "../components/dynamicRoute";
import AttendanceHistoryFilters from "./_components/AttendanceHistoryFilters";
import AttendanceHistoryTable from "./_components/AttendanceHistoryTable";

const TeacherAttendancePage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;

  const fromDate =
    typeof searchParams.from_date === "string" ? searchParams.from_date : "";
  const toDate =
    typeof searchParams.to_date === "string" ? searchParams.to_date : "";
  const programId =
    typeof searchParams.program_id === "string" ? searchParams.program_id : "";
  const departmentId =
    typeof searchParams.department_id === "string"
      ? searchParams.department_id
      : "";
  const classId =
    typeof searchParams.academic_class_id === "string"
      ? searchParams.academic_class_id
      : typeof searchParams.class_id === "string"
        ? searchParams.class_id
        : "";

  const [loggedInTeacher, institutionDetails, programsRes, classesRes] =
    await Promise.all([
      loggedInTeacherUser(),
      getInstitutionDetails(),
      getPrograms([]),
      getAcademicClassDetails([{ label: "limit", value: "200" }]),
    ]);

  const mode = institutionDetails?.data?.mode || "SCHOOL";
  const programs = programsRes?.data ?? [];
  const classes = classesRes?.data ?? [];

  // Build the report query scoped to the logged-in teacher.
  const query: { label: string; value: string }[] = [];
  if (loggedInTeacher.id) {
    query.push({ label: "teacher_id", value: loggedInTeacher.id });
  }
  if (programId) query.push({ label: "program_id", value: programId });
  if (departmentId) query.push({ label: "department_id", value: departmentId });
  if (classId) query.push({ label: "academic_class_id", value: classId });
  if (fromDate) query.push({ label: "start_date", value: fromDate });
  if (toDate) query.push({ label: "end_date", value: toDate });

  const reportRes = await getTeacherTakenAttendance(query);
  const report = reportRes as TTeacherTakenAttendanceResponse;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageRoute
            title="Attendance"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Attendance" },
            ]}
          />
          <div className="flex items-center gap-3">
            <Link
              href="/teacher"
              className="flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
            >
              <FaArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </Link>
            <Link
              href="/teacher/attendance/take"
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-blue-700 hover:shadow-md"
            >
              <FaPlus className="h-4 w-4" />
              <span>Take Attendance</span>
            </Link>
          </div>
        </div>

        <AttendanceHistoryFilters
          mode={mode}
          programs={programs}
          classes={classes}
        />

        <AttendanceHistoryTable
          data={report?.data ?? []}
          totalRecords={report?.meta?.totalGroups ?? report?.data?.length ?? 0}
        />
      </div>
    </div>
  );
};

export default TeacherAttendancePage;
