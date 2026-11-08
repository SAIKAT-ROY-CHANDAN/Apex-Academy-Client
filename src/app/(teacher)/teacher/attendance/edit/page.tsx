import Link from "next/link";
import { redirect } from "next/navigation";
import { FaArrowLeft } from "react-icons/fa6";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getTeacherAttendanceDetails } from "@/services/teacherAttendance";
import type { TStudentAttendanceDetail } from "@/types/modules/teacher/attendance.type";
import PageRoute from "../../components/dynamicRoute";
import EditAttendanceTable from "./_components/EditAttendanceTable";

const EditAttendancePage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const get = (key: string) =>
    typeof searchParams[key] === "string" ? (searchParams[key] as string) : "";

  const attendanceDate = get("attendance_date");
  const academicClassId = get("academic_class_id");
  if (!attendanceDate || !academicClassId) {
    redirect("/teacher/attendance");
  }

  const teacherId = (await loggedInTeacherUser()).id ?? "";
  const subjectId = get("subject_id");
  const groupName = get("group");

  // Scope to the logged-in teacher so a teacher can only edit sessions
  // they themselves took.
  const filter: Record<string, unknown> = {
    teacher_id: teacherId,
    academic_class_id: academicClassId,
    attendance_date: {
      gte: `${attendanceDate}T00:00:00.000Z`,
      lte: `${attendanceDate}T23:59:59.999Z`,
    },
  };
  if (subjectId) filter.subject_id = subjectId;
  if (groupName) filter.group = groupName;

  const records: TStudentAttendanceDetail[] = [];
  const pageSize = 500;
  let page = 1;

  while (true) {
    const res = await getTeacherAttendanceDetails([
      { label: "filter", value: JSON.stringify(filter) },
      { label: "page", value: String(page) },
      { label: "limit", value: String(pageSize) },
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
            title="Edit Attendance"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Attendance", href: "/teacher/attendance" },
              { label: "Edit Attendance" },
            ]}
          />
          <Link
            href="/teacher/attendance"
            className="flex w-fit items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-600 transition-all duration-200 hover:bg-blue-100"
          >
            <FaArrowLeft className="h-4 w-4" />
            <span>Back to Attendance</span>
          </Link>
        </div>

        <EditAttendanceTable
          records={records}
          attendanceDate={attendanceDate}
          classNameLabel={get("class_name")}
          subjectName={get("subject_name")}
          groupName={groupName}
        />
      </div>
    </div>
  );
};

export default EditAttendancePage;
