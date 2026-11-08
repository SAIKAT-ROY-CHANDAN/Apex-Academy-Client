import { PageHeader } from "@/components/shared/page-header";
import StaffAttendanceTable from "./_components/StaffAttendanceTable";
import AttendanceFilter from "./_components/AttendanceFilter";
import { getStaffs } from "@/services/staff";
import { getDesignations } from "@/services/designation";
import { getStaffsAttendanceStatus } from "@/services/staffAttendance";
import { getStaffsOvertimeStatus } from "@/services/staffOvertime";
import { QueryParams } from "@/types/shared/query.type";
import PaginationWrapper from "@/components/shared/PaginationWrapper";

const StaffAttendancePage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const designationFilterResult = searchParams.designationFilter;
  const staffTypeFilterResult = searchParams.staffTypeFilter;
  const search = searchParams.search;
  const query: QueryParams[] = [
    {
      label: "page",
      value: page.toString(),
    },
    {
      label: "limit",
      value: "100",
    }
  ];

  if (search && typeof search === "string") {
    query.push({
      label: "searchTerm",
      value: search,
    });
  }

  const filter: Record<string, any> = {};

  if (designationFilterResult && typeof designationFilterResult === "string") {
    filter.designation_id = designationFilterResult;
  }

  if (staffTypeFilterResult && typeof staffTypeFilterResult === "string") {
    filter.staff_type = staffTypeFilterResult;
  }

  if (Object.keys(filter).length > 0) {
    query.push({
      label: "filter",
      value: JSON.stringify(filter),
    });
  }

  const [staffs, designationsRes] = await Promise.all([
    getStaffs(query),
    getDesignations([{ label: "limit", value: "100" }]),
  ]);

  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
  );

  // Bulk attendance status fetch — needs staff IDs, so it runs after the
  // Promise.all above rather than inside it. One call regardless of table size.
  const staffIds = (staffs?.data || []).map(
    (s: { id: string }) => s.id,
  );
  const attendanceStatusRes = await getStaffsAttendanceStatus(staffIds);
  const attendanceMap = attendanceStatusRes?.data ?? {};

  const overtimeStatusRes = await getStaffsOvertimeStatus(staffIds);
  const overtimeMap = overtimeStatusRes?.data ?? {};

  return (
    <div className="space-y-8">
      <PageHeader
        title="Staff Attendance"
        backHref="/dashboard/employees"
      />

      <AttendanceFilter
        designations={designations}
        currentDesignation={typeof designationFilterResult === "string" ? designationFilterResult : ""}
        currentStaffType={typeof staffTypeFilterResult === "string" ? staffTypeFilterResult : ""}
        currentSearch={typeof search === "string" ? search : ""}
      />

      <StaffAttendanceTable
        staffs={staffs?.data || []}
        attendanceMap={attendanceMap}
        overtimeMap={overtimeMap}
      />

      {staffs?.meta?.totalPages > 1 && (
        <PaginationWrapper
          totalPages={staffs?.meta?.totalPages}
          totalItems={staffs?.meta?.totalItems}
          active={page}
        />
      )}
    </div>

  );
};

export default StaffAttendancePage;
