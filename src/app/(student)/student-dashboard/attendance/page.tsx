import { redirect } from "next/navigation";
import { loggedInStudentUser } from "@/services/logged-user";
import { getMyAttendance } from "@/services/studentAttendance";
import type { TStudentAttendanceDetail } from "@/types/modules/teacher/attendance.type";
import StudentAttendanceReport from "./_components/StudentAttendanceReport";

const StudentAttendancePage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const user = await loggedInStudentUser();
  if (!user?.id) redirect("/student-login");

  const fromDate =
    typeof searchParams.from_date === "string" ? searchParams.from_date : "";
  const toDate =
    typeof searchParams.to_date === "string" ? searchParams.to_date : "";

  const records: TStudentAttendanceDetail[] = [];
  const pageSize = 500;
  let page = 1;

  while (true) {
    const res = await getMyAttendance([
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
    <div className="space-y-6">
      <StudentAttendanceReport
        records={records}
        studentName={user.name}
        currentFromDate={fromDate}
        currentToDate={toDate}
      />
    </div>
  );
};

export default StudentAttendancePage;
