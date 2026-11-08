import { redirect } from "next/navigation";
import StudentAttendanceReport from "@/app/(student)/student-dashboard/attendance/_components/StudentAttendanceReport";
import { getStudentAttendances } from "@/services/studentAttendance";
import type { TStudentAttendanceDetail } from "@/types/modules/teacher/attendance.type";
import PageRoute from "../../../components/dynamicRoute";
import BackButton from "./_components/BackButton";

const StudentAttendanceReportPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const get = (key: string) =>
    typeof searchParams[key] === "string" ? (searchParams[key] as string) : "";

  const studentId = get("student_id");
  const studentName = get("student_name") || "Student";
  if (!studentId) {
    redirect("/teacher/attendance");
  }

  // Fetch the student's full attendance history (all pages).
  const records: TStudentAttendanceDetail[] = [];
  const pageSize = 500;
  let page = 1;

  while (true) {
    const res = await getStudentAttendances([
      { label: "filter", value: JSON.stringify({ student_id: studentId }) },
      { label: "page", value: String(page) },
      { label: "limit", value: String(pageSize) },
      {
        label: "orderBy",
        value: JSON.stringify({ attendance_date: "desc" }),
      },
    ]);
    const data = res?.data ?? [];
    records.push(...data);

    const meta = res?.meta as { totalPages?: number } | undefined;
    const totalPages = meta?.totalPages ?? 1;
    if (!res || page >= totalPages || data.length < pageSize) break;
    page += 1;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageRoute
            title="Student Attendance Report"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Attendance", href: "/teacher/attendance" },
              { label: studentName },
            ]}
          />
          <BackButton />
        </div>

        <StudentAttendanceReport
          records={records}
          studentName={studentName}
          currentFromDate=""
          currentToDate=""
        />
      </div>
    </div>
  );
};

export default StudentAttendanceReportPage;
