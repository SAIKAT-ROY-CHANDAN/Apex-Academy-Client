import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import StudentLeaveRequestTabs from "./_components/StudentLeaveRequestTabs";
import StudentLeaveRequestCard from "./_components/StudentLeaveRequestCard";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { loggedInStudentUser } from "@/services/logged-user";
import { getMyStudentLeaveRequests } from "@/services/studentLeave";
import { LeaveStatus, TStudentLeaveRequest } from "@/types/modules/student/leave-request.type";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const PAGE_SIZE = 10;

const StudentLeaveRequestPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const status = (searchParams.status ?? searchParams.leave_status) as string | undefined;

  const query: { label: string; value: string }[] = [
    { label: "page", value: String(page) },
    { label: "limit", value: String(PAGE_SIZE) },
  ];
  if (status && typeof status === "string") query.push({ label: "status", value: status });

  // Ensure we use ordering newest first
  query.push({ label: "orderBy", value: JSON.stringify({ created_at: "desc" }) });

  const raw = await getMyStudentLeaveRequests(query as any);

  // Normalize response shape: backend now returns { success, meta, data }
  // Some fallback for nested shape
  let meta = raw?.meta ?? raw?.data?.meta;
  let requests: TStudentLeaveRequest[] = Array.isArray(raw?.data)
    ? raw.data
    : Array.isArray(raw?.data?.data)
      ? raw.data.data
      : [];

  const totalItems = meta?.totalItems ?? requests.length;
  const totalPages = meta?.totalPages ?? Math.ceil(totalItems / PAGE_SIZE);
  const currentPage = meta?.currentPage ?? page;

  // Stats – derived from current page (for full stats we could call getMyStudentLeaveStats)
  const pendingCount = requests.filter((r) => r.status === LeaveStatus.PENDING).length;
  const approvedCount = requests.filter((r) => r.status === LeaveStatus.APPROVED).length;
  const rejectedCount = requests.filter((r) => r.status === LeaveStatus.REJECTED).length;

  const statCards = [
    { label: "Total Requests", value: totalItems, icon: "📋", color: "bg-blue-50 text-blue-600 border-blue-100", iconBg: "bg-blue-100 text-blue-600" },
    { label: "Pending", value: pendingCount, icon: "⏳", color: "bg-amber-50 text-amber-600 border-amber-100", iconBg: "bg-amber-100 text-amber-600" },
    { label: "Approved", value: approvedCount, icon: "✅", color: "bg-green-50 text-green-600 border-green-100", iconBg: "bg-green-100 text-green-600" },
    { label: "Rejected", value: rejectedCount, icon: "❌", color: "bg-red-50 text-red-600 border-red-100", iconBg: "bg-red-100 text-red-600" },
  ];

  const breadcrumbs = [
    { label: "Overview", href: "/student-dashboard" },
    { label: "Leave Request" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Leave Requests</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Manage and track your leave applications • Page {currentPage} of {totalPages || 1}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/student-dashboard"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-all duration-200"
          >
            <FaArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </Link>
          <Link
            href="/student-dashboard/leave-request/apply"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm"
          >
            <FaPlus className="w-4 h-4" />
            <span>Apply Leave</span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-300 hover:shadow-lg ${stat.color}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">{stat.label}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl ${stat.iconBg}`}>
                <span className="text-2xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">My Leave Requests</h2>
            <StudentLeaveRequestTabs />
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {requests.length === 0 ? (
            <div className="py-16 px-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl">📋</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No leave requests found</h3>
              <p className="text-gray-500 text-sm">
                {status ? `No ${status.toLowerCase()} leave requests found.` : "You haven't submitted any leave requests yet."}
              </p>
              <Link
                href="/student-dashboard/leave-request/apply"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaPlus className="w-4 h-4" />
                Create Your First Request
              </Link>
            </div>
          ) : (
            requests.map((request) => <StudentLeaveRequestCard key={request.id} request={request} />)
          )}
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
            <PaginationWrapper totalPages={totalPages} totalItems={totalItems} active={currentPage} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentLeaveRequestPage;
