import Link from "next/link";
import { FaArrowLeft, FaPlus } from "react-icons/fa6";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getAllLeaveRequests } from "@/services/teacherLeave";
import type {
  TLeaveRequest,
  TLeaveRequestResponse,
} from "@/types/modules/teacher/leave-request.type";
import type { QueryParams } from "@/types/shared/query.type";
import PageRoute from "../components/dynamicRoute";
import LeaveRequestFilters from "./_components/LeaveRequestFilters";
import LeaveRequestTable from "./_components/LeaveRequestTable";

const LeaveRequestPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search = searchParams.search;
  const leaveType = searchParams.leave_type;
  const leaveStatus = searchParams.leave_status;

  const query: QueryParams[] = [
    {
      label: "page",
      value: page.toString(),
    },
    {
      label: "limit",
      value: "10",
    },
  ];

  if (leaveType && typeof leaveType === "string") {
    query.push({
      label: "leave_type",
      value: leaveType,
    });
  }

  if (leaveStatus && typeof leaveStatus === "string") {
    query.push({
      label: "leave_status",
      value: leaveStatus,
    });
  }

  // searchTerm must be a top-level query param, NOT inside filter
  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const loggedInTeacher = await loggedInTeacherUser();
  const response = (await getAllLeaveRequests(
    loggedInTeacher.id,
    query,
  )) as TLeaveRequestResponse;
  const meta = response?.data?.meta;
  const requests: TLeaveRequest[] = response?.data?.data ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <PageRoute
            title="Leave Request"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Leave Request" },
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
              href="/teacher/leave-request/apply-request"
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <FaPlus className="w-4 h-4" />
              <span>Apply Leave</span>
            </Link>
          </div>
        </div>

        <LeaveRequestFilters />

        <LeaveRequestTable
          requests={requests}
          currentPage={page}
          totalItems={meta?.totalItems ?? requests.length}
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

export default LeaveRequestPage;
