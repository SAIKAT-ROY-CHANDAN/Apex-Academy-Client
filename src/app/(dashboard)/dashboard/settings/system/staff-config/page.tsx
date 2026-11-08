import { PageHeader } from '@/components/shared/page-header'
import { getStaffs } from '@/services/staff'
import { getDesignations } from '@/services/designation'
import { QueryParams } from '@/types/shared/query.type'
import PaginationWrapper from '@/components/shared/PaginationWrapper'
import StaffConfigFilter from './_components/StaffConfigFilter'
import StaffConfigTable from './_components/StaffConfigTable'

const OvertimeStaffConfig = async (props: {
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Staff Overtime Config"
        backHref="/dashboard/settings/system/overtime"
      />

      <StaffConfigFilter designations={designations} />

      <StaffConfigTable staffs={staffs?.data || []} />

      {staffs?.meta?.totalPages > 1 && (
        <PaginationWrapper
          totalPages={staffs?.meta?.totalPages}
          totalItems={staffs?.meta?.totalItems}
          active={page}
        />
      )}
    </div>
  )
}

export default OvertimeStaffConfig
