import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getStaffs } from "@/services/staff";
import { getAllStaffLeaves } from "@/services/staffLeave";
import type { TStaffLeave } from "@/types/modules/staff/staff-leave.type";
import type { QueryParams } from "@/types/shared/query.type";
import StaffLeaveFilter from "./_components/StaffLeaveFilter";
import StaffLeaveTable from "./_components/StaffLeaveTable";

type AdminLeaveResponse = {
  success?: boolean;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data?: TStaffLeave[];
};

const StaffLeaveManagement = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const leaveStatus = searchParams.leave_status;
  const leaveType = searchParams.leave_type;
  const staffFilter = searchParams.staffFilter;
  const search = searchParams.search;

  const query: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
  ];

  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const filter: Record<string, any> = {};
  if (leaveStatus && typeof leaveStatus === "string") {
    filter.leave_status = leaveStatus;
  }
  if (leaveType && typeof leaveType === "string") {
    filter.leave_type = leaveType;
  }
  if (staffFilter && typeof staffFilter === "string") {
    filter.staff_id = staffFilter;
  }
  if (Object.keys(filter).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filter) });
  }

  const [response, staffsRes] = await Promise.all([
    getAllStaffLeaves(query) as Promise<AdminLeaveResponse>,
    getStaffs([{ label: "limit", value: "100" }]),
  ]);

  const leaves: TStaffLeave[] = response?.data ?? [];
  const meta = response?.meta;
  const staffs = (staffsRes?.data ?? []).map(
    (s: { id: string; full_name: string }) => ({
      id: s.id,
      name: s.full_name,
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Leave Management"
        backHref="/dashboard/employees"
        actions={{
          href: "/dashboard/employees/staffs/leave-management/add",
          label: "Add Leave",
        }}
      />

      <StaffLeaveFilter staffs={staffs} />

      <StaffLeaveTable leaves={leaves} />

      {meta && meta.totalPages > 1 && (
        <PaginationWrapper
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          active={page}
        />
      )}
    </div>
  );
};

export default StaffLeaveManagement;
