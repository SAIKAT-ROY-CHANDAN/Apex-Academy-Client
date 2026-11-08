import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getStaffs } from "@/services/staff";
import { getAllStaffResignations } from "@/services/staffResignation";
import type { TStaffResignation } from "@/types/modules/staff/staff-resignation.type";
import type { QueryParams } from "@/types/shared/query.type";
import StaffResignationFilter from "./_components/StaffResignationFilter";
import StaffResignationTable from "./_components/StaffResignationTable";

type AdminResponse = {
  success?: boolean;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data?: TStaffResignation[];
};

const StaffResignationManagement = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
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
  if (staffFilter && typeof staffFilter === "string") {
    filter.staff_id = staffFilter;
  }
  if (Object.keys(filter).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filter) });
  }

  const [response, staffsRes] = await Promise.all([
    getAllStaffResignations(query) as Promise<AdminResponse>,
    getStaffs([{ label: "limit", value: "100" }]),
  ]);

  const resignations: TStaffResignation[] = response?.data ?? [];
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
        title="Resignation Management"
        backHref="/dashboard/employees"
        actions={{
          href: "/dashboard/employees/staffs/resignation-management/add",
          label: "Add Resignation",
        }}
      />

      <StaffResignationFilter staffs={staffs} />

      <StaffResignationTable resignations={resignations} />

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

export default StaffResignationManagement;
