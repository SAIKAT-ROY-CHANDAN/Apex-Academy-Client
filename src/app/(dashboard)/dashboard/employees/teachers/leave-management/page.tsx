import { CalendarCheck2, ListChecks } from "lucide-react";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getDepartments } from "@/services/department";
import { getDesignations } from "@/services/designation";
import { getShifts } from "@/services/shift";
import { getAllTeacherLeaveRequests } from "@/services/teacherLeave";
import type { TLeaveRequest } from "@/types/modules/teacher/leave-request.type";
import type { QueryParams } from "@/types/shared/query.type";
import LeaveManagementFilter from "./_components/LeaveManagementFilter";
import LeaveRequestCard from "./_components/LeaveRequestCard";

type AdminLeaveResponse = {
  success?: boolean;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data?: TLeaveRequest[];
};

const TeacherLeaveManagement = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const designationFilter = searchParams.designationFilter;
  const departmentFilter = searchParams.departmentFilter;
  const teacherTypeFilter = searchParams.teacherTypeFilter;
  const shiftFilter = searchParams.shiftFilter;
  const adminPositionFilter = searchParams.administrativePositionFilter;
  const leaveStatus = searchParams.leave_status;
  const search = searchParams.search;

  const query: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
  ];

  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const teacherFilter: Record<string, any> = {};
  if (departmentFilter && typeof departmentFilter === "string") {
    teacherFilter.department_id = departmentFilter;
  }
  if (designationFilter && typeof designationFilter === "string") {
    teacherFilter.designation_id = designationFilter;
  }
  if (teacherTypeFilter && typeof teacherTypeFilter === "string") {
    teacherFilter.teacher_type = teacherTypeFilter;
  }
  if (shiftFilter && typeof shiftFilter === "string") {
    teacherFilter.shift_id = shiftFilter;
  }
  if (adminPositionFilter && typeof adminPositionFilter === "string") {
    teacherFilter.administrative_position = adminPositionFilter;
  }

  const filter: Record<string, any> = {};
  if (leaveStatus && typeof leaveStatus === "string") {
    filter.leave_status = leaveStatus;
  }
  if (Object.keys(teacherFilter).length > 0) {
    filter.teacher = teacherFilter;
  }
  if (Object.keys(filter).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filter) });
  }

  const [response, designationsRes, departmentsRes, shiftsRes] =
    await Promise.all([
      getAllTeacherLeaveRequests(query) as Promise<AdminLeaveResponse>,
      getDesignations([{ label: "limit", value: "100" }]),
      getDepartments([{ label: "limit", value: "100" }]),
      getShifts([{ label: "limit", value: "100" }]),
    ]);

  const requests: TLeaveRequest[] = response?.data ?? [];
  const meta = response?.meta;
  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
  );
  const departments = (departmentsRes?.data ?? []).map(
    (d: { id: string; department_name: string }) => ({
      id: d.id,
      name: d.department_name,
    }),
  );
  const shifts = (shiftsRes?.data ?? []).map(
    (s: { id: string; name: string }) => ({ id: s.id, name: s.name }),
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Leave Management" backHref="/dashboard/employees" />

      <LeaveManagementFilter
        designations={designations}
        departments={departments}
        shifts={shifts}
      />

      <div className="space-y-4">
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Leave Requests
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {meta?.totalItems ?? requests.length}
            </span>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
            <CalendarCheck2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No leave requests found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the filters above.
            </p>
          </div>
        ) : (
          requests.map((request) => (
            <LeaveRequestCard key={request.id} request={request} />
          ))
        )}

        {meta && meta.totalPages > 1 && (
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

export default TeacherLeaveManagement;
