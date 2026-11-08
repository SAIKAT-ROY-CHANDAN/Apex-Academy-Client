import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import {
  previewPayroll,
  PreviewPayrollBackendRow,
  getStaffAdvanceSalary,
} from "@/services/payroll/staff-payroll";
import { getDesignations } from "@/services/designation";
import { QueryParams } from "@/types/shared/query.type";
import type { SalaryAdvance } from "@/types/modules/payroll";
import StaffPayrollFilters from "./_components/StaffPayrollFilters";
import StaffPayrollTable from "./_components/StaffPayrollTable";
import { StaffFilterValues, StaffPayrollRow } from "@/types/modules/payroll";

export const dynamic = "force-dynamic";

const mapBackendToPayrollRow = (
  row: PreviewPayrollBackendRow,
  summedAdvance: number,
): StaffPayrollRow => ({
  id: row.staffId,
  staffId: row.staffId,
  name: row.name,
  designation: row.designation,
  department: row.department,
  staffType: undefined,
  totalSalary: row.netSalary,
  advanceSalary: summedAdvance > 0 ? summedAdvance : undefined,
  payableAmount: row.payableAmount,
  status: row.status,
  generated: row.generated,
  sl: row.sl,
});

interface StaffPayrollPageProps {
  searchParams: Promise<
    StaffFilterValues & { month?: string; year?: string; page?: string }
  >;
}

const StaffPayroll = async ({ searchParams }: StaffPayrollPageProps) => {
  const now = new Date();
  const filters = await searchParams;

  const {
    staffType = "All",
    designation = "All",
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

  if (staffType && staffType !== "All") {
    filter.staff_type = staffType;
  }

  if (designation && designation !== "All") {
    filter.designation_id = designation;
  }

  if (Object.keys(filter).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filter) });
  }

  let rows: StaffPayrollRow[] = [];
  let totalPages = 1;
  let totalItems = 0;
  let designations: { id: string; name: string }[] = [];

  try {
    const [previewResponse, designationsRes] = await Promise.all([
      previewPayroll({
        month: selectedMonth,
        year: selectedYear,
        query,
      }),
      getDesignations([{ label: "limit", value: "100" }]),
    ]);

    const payload = previewResponse?.data ?? previewResponse;

    const backendRows = Array.isArray(payload?.data)
      ? (payload.data as PreviewPayrollBackendRow[])
      : Array.isArray(payload)
        ? (payload as PreviewPayrollBackendRow[])
        : [];

    const staffIds = Array.from(
      new Set(backendRows.map((row) => row.staffId)),
    );

    const advanceResponses = await Promise.allSettled(
      staffIds.map((id) =>
        getStaffAdvanceSalary(id, selectedMonth, selectedYear),
      ),
    );

    const advanceSumMap = advanceResponses.reduce(
      (map, result, idx) => {
        if (result.status === "fulfilled") {
          const advances: SalaryAdvance[] = (result.value?.data ?? []).filter(
            (advance) => {
              const givenAt = new Date(advance.given_at);
              return (
                !Number.isNaN(givenAt.getTime()) &&
                givenAt.getMonth() + 1 === selectedMonth &&
                givenAt.getFullYear() === selectedYear
              );
            },
          );
          const sum = advances.reduce(
            (acc, a) => acc + (a.advance_amount || 0),
            0,
          );
          map[staffIds[idx]] = sum;
        }
        return map;
      },
      {} as Record<string, number>,
    );

    rows = backendRows.map((row) =>
      mapBackendToPayrollRow(
        row,
        advanceSumMap[row.staffId] ?? 0,
      ),
    );

    totalPages = payload?.meta?.totalPages ?? 1;
    totalItems = payload?.meta?.totalItems ?? rows.length;

    designations = (designationsRes?.data ?? []).map(
      (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
    );
  } catch (error) {
    console.error("Failed to load staff payroll:", error);
  }

  const currentFilters = { staffType, designation, search };

  return (
    <div className="space-y-8">
      <PageHeader title="Staff Payroll" backHref="/dashboard/payroll" />

      <StaffPayrollFilters
        currentFilters={currentFilters}
        designations={designations}
      />

      <StaffPayrollTable
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

export default StaffPayroll;
