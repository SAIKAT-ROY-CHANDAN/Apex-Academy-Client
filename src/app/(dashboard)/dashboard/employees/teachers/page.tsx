import { PageHeader } from "@/components/shared/page-header";
import TeacherTable from "./_components/TeacherTable";
import TeacherFilter from "./_components/TeacherFilter";
import { getTeachers } from "@/services/teacher";
import { getDesignations } from "@/services/designation";
import { getDepartments } from "@/services/department";
import { getShifts } from "@/services/shift";
import { QueryParams } from "@/types/shared/query.type";
import PaginationWrapper from "@/components/shared/PaginationWrapper";

const TeacherPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const designationFilterResult = searchParams.designationFilter;
  const departmentFilterResult = searchParams.departmentFilter;
  const teacherTypeFilterResult = searchParams.teacherTypeFilter;
  const shiftFilterResult = searchParams.shiftFilter;
  const adminPositionFilterResult = searchParams.administrativePositionFilter;
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

  if (departmentFilterResult && typeof departmentFilterResult === "string") {
    filter.department_id = departmentFilterResult;
  }

  if (teacherTypeFilterResult && typeof teacherTypeFilterResult === "string") {
    filter.teacher_type = teacherTypeFilterResult;
  }

  if (shiftFilterResult && typeof shiftFilterResult === "string") {
    filter.shift_id = shiftFilterResult;
  }

  if (adminPositionFilterResult && typeof adminPositionFilterResult === "string") {
    filter.administrative_position = adminPositionFilterResult;
  }

  if (Object.keys(filter).length > 0) {
    query.push({
      label: "filter",
      value: JSON.stringify(filter),
    });
  }

  const [teachers, designationsRes, departmentsRes, shiftsRes] = await Promise.all([
    getTeachers(query),
    getDesignations([{ label: "limit", value: "100" }]),
    getDepartments([{ label: "limit", value: "100" }]),
    getShifts([{ label: "limit", value: "100" }]),
  ]);

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
      <PageHeader
        title="Teachers"
        backHref="/dashboard/employees"
        actions={{
          href: "/dashboard/employees/teachers/add-teacher",
          label: "Add Teacher",
        }}
      />

      <TeacherFilter
        designations={designations}
        departments={departments}
        shifts={shifts}
      />

      <TeacherTable
        teachers={teachers?.data || []}
        filter={filter}
        search={typeof search === "string" ? search : undefined}
      />

      {teachers?.meta?.totalPages > 1 && (
        <PaginationWrapper
          totalPages={teachers?.meta?.totalPages}
          totalItems={teachers?.meta?.totalItems}
          active={page}
        />
      )}
    </div>
  );
};

export default TeacherPage;
