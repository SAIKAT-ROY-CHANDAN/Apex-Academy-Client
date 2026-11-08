import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import {
  PreviewPayrollBackendRow,
  previewPayroll,
} from "@/services/payroll/teachers-payroll";
import { getDesignations } from "@/services/designation";
import { getDepartments } from "@/services/department";
import { getShifts } from "@/services/shift";
import { QueryParams } from "@/types/shared/query.type";
import TeachersPayrollFilters from "./_components/TeachersPayrollFilters";
import TeachersPayrollTable from "./_components/TeachersPayrollTable";
import { FilterValues, TeacherPayrollRow } from "@/types/modules/payroll";

export const dynamic = "force-dynamic";

const mapBackendToPayrollRow = (
  row: PreviewPayrollBackendRow,
): TeacherPayrollRow => ({
  id: row.teacherId,
  teacherId: row.teacherId,
  name: row.name,
  designation: row.designation,
  department: row.department,
  teacherType: undefined,
  shift: undefined,
  totalSalary: row.netSalary,
  advanceSalary: row.advanceSalary > 0 ? row.advanceSalary : undefined,
  overtimeHours: row.overtimeHours > 0 ? row.overtimeHours : undefined,
  overtimeAmount: row.overtimeAmount > 0 ? row.overtimeAmount : undefined,
  payableAmount: row.payableAmount,
  status: row.status,
  generated: row.generated,
  sl: row.sl,
});

interface TeachersPayrollPageProps {
  searchParams: Promise<
    FilterValues & { month?: string; year?: string; page?: string }
  >;
}

const TeachersPayroll = async ({ searchParams }: TeachersPayrollPageProps) => {
  const now = new Date();
  const filters = await searchParams;

  const {
    teacherType = "All",
    designation = "All",
    department = "All",
    shift = "All",
    search = "",
    month,
    year,
    page: pageParam,
  } = filters;

  const selectedMonth = month ? Number(month) : now.getMonth() + 1;
  const selectedYear = year ? Number(year) : now.getFullYear();
  const page = pageParam ? Number(pageParam) : 1;

  const query: QueryParams[] = [{ label: "page", value: page.toString() }];

  if (search) {
    query.push({ label: "searchTerm", value: search });
  }

  const filter: Record<string, string> = {};

  if (teacherType && teacherType !== "All") {
    filter.teacher_type = teacherType;
  }

  if (designation && designation !== "All") {
    filter.designation_id = designation;
  }

  if (department && department !== "All") {
    filter.department_id = department;
  }

  if (shift && shift !== "All") {
    filter.shift_id = shift;
  }

  if (Object.keys(filter).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filter) });
  }

  let rows: TeacherPayrollRow[] = [];
  let totalPages = 1;
  let totalItems = 0;
  let designations: { id: string; name: string }[] = [];
  let shifts: { id: string; name: string }[] = [];
  let departments: { id: string; name: string }[] = [];

  try {
    const [previewResponse, designationsRes, shiftsRes, departmentsRes] =
      await Promise.all([
        previewPayroll({
          month: selectedMonth,
          year: selectedYear,
          query,
        }),
        getDesignations([{ label: "limit", value: "100" }]),
        getShifts([{ label: "limit", value: "100" }]),
        getDepartments([{ label: "limit", value: "100" }]),
      ]);

    const payload = previewResponse?.data ?? previewResponse;
    console.log(previewResponse)

    const backendRows = Array.isArray(payload?.data)
      ? (payload.data as PreviewPayrollBackendRow[])
      : Array.isArray(payload)
        ? (payload as PreviewPayrollBackendRow[])
        : [];

    rows = backendRows.map(mapBackendToPayrollRow);
    totalPages = payload?.meta?.totalPages ?? 1;
    totalItems = payload?.meta?.totalItems ?? rows.length;

    designations = (designationsRes?.data ?? []).map(
      (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
    );
    shifts = (shiftsRes?.data ?? []).map((s: { id: string; name: string }) => ({
      id: s.id,
      name: s.name,
    }));
    departments = (departmentsRes?.data ?? []).map(
      (d: { id: string; department_name: string }) => ({
        id: d.id,
        name: d.department_name,
      }),
    );
  } catch (error) {
    console.error("Failed to load payroll:", error);
  }

  const currentFilters = {
    teacherType,
    designation,
    department,
    shift,
    search,
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Teacher's Payroll" backHref="/dashboard/payroll" />

      <TeachersPayrollFilters
        currentFilters={currentFilters}
        designations={designations}
        departments={departments}
        shifts={shifts}
      />

      <TeachersPayrollTable
        rows={rows}
        currentFilters={currentFilters}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
      />

      {totalPages > 1 && (
        <PaginationWrapper
          totalPages={totalPages}
          totalItems={totalItems}
          active={page}
        />
      )}
    </div>
  );
};

export default TeachersPayroll;
