import { PageHeader } from "@/components/shared/page-header";
import { getAllStudentLeaveRequests, getStudentLeaveStats } from "@/services/studentLeave";
import StudentLeaveAdminTable from "./_components/StudentLeaveAdminTable";
import StudentLeaveFilters from "./_components/StudentLeaveFilters";
import StudentLeaveStatsCards from "./_components/StudentLeaveStatsCards";
import { TStudentLeaveRequest } from "@/types/modules/student/leave-request.type";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 10;

const StudentLeavesPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page ?? 1) || 1;
  const status = searchParams.status as string | undefined;
  const leaveType = searchParams.leave_type as string | undefined;
  const searchTerm = searchParams.searchTerm as string | undefined;

  const query: { label: string; value: string }[] = [
    { label: "page", value: String(page) },
    { label: "limit", value: String(PAGE_SIZE) },
  ];
  if (status) query.push({ label: "status", value: status });
  if (leaveType) query.push({ label: "leave_type", value: leaveType });
  if (searchTerm) query.push({ label: "searchTerm", value: searchTerm });
  query.push({ label: "orderBy", value: JSON.stringify({ created_at: "desc" }) });

  const [listRes, statsRes] = await Promise.all([
    getAllStudentLeaveRequests(query as any),
    getStudentLeaveStats(),
  ]);

  // Normalize list shape: admin returns { meta, data }
  const meta = listRes?.meta;
  const leaves: TStudentLeaveRequest[] = Array.isArray(listRes?.data) ? listRes.data : [];
  const totalItems = meta?.totalItems ?? leaves.length;
  const totalPages = meta?.totalPages ?? 1;
  const currentPage = meta?.currentPage ?? page;

  const stats = statsRes?.success
    ? statsRes.data
    : { total: totalItems, pending: 0, approved: 0, rejected: 0 };

  // If stats endpoint failed to return counts, derive from available data only as fallback
  const hasStats = typeof stats?.total === "number";
  const displayStats = hasStats
    ? stats
    : {
        total: totalItems,
        pending: leaves.filter((l) => l.status === "PENDING").length,
        approved: leaves.filter((l) => l.status === "APPROVED").length,
        rejected: leaves.filter((l) => l.status === "REJECTED").length,
      };

  return (
    <div className="space-y-6">
      <PageHeader title="Student Leave Requests" backHref="/dashboard/student-management" />

      <StudentLeaveStatsCards stats={displayStats} />

      <div className="flex flex-col gap-4">
        <StudentLeaveFilters />
        <StudentLeaveAdminTable
          leaves={leaves}
          currentPage={currentPage}
          totalItems={totalItems}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
};

export default StudentLeavesPage;
