import { PageHeader } from "@/components/shared/page-header";
import { getStudents } from "@/services/student";
import type { QueryParams } from "@/types/shared/query.type";
import StudentTable from "./_components/StudentTable";
import {
  buildStudentEnrollmentFilter,
  parseStudentFilters,
} from "./_components/student-filters";

const PAGE_SIZE = 10;

type StudentPageSearchParams = {
  page?: string | string[];
  searchTerm?: string | string[];
  search?: string | string[];
  program_id?: string | string[];
  department_id?: string | string[];
  academic_class_id?: string | string[];
  class_id?: string | string[];
};

const firstParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const Student = async ({
  searchParams,
}: {
  searchParams: Promise<StudentPageSearchParams>;
}) => {
  const resolvedSearchParams = await searchParams;
  const currentPage = Math.max(
    1,
    Number(firstParam(resolvedSearchParams.page) ?? 1) || 1,
  );
  const searchTerm =
    firstParam(resolvedSearchParams.searchTerm) ??
    firstParam(resolvedSearchParams.search) ??
    "";

  const filters = parseStudentFilters(resolvedSearchParams);
  const filterObject = buildStudentEnrollmentFilter(filters);

  const query: QueryParams[] = [
    { label: "page", value: currentPage },
    { label: "limit", value: PAGE_SIZE },
  ];
  if (Object.keys(filterObject).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filterObject) });
  }
  if (searchTerm.trim()) {
    query.push({ label: "searchTerm", value: searchTerm.trim() });
  }

  const students = await getStudents(query);
  const items = students?.data ?? [];
  const totalItems =
    students?.meta?.total ?? students?.meta?.totalItems ?? items.length;
  const totalPages =
    students?.meta?.totalPages ??
    students?.meta?.lastPage ??
    students?.meta?.last_page;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Students"
        backHref="/dashboard/student-management"
        actions={{
          label: "Add Student",
          href: "/dashboard/student-management/students/create-student",
        }}
      />
      <StudentTable
        students={items}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        initialFilters={filters}
        initialSearchTerm={searchTerm}
      />
    </div>
  );
};

export default Student;
