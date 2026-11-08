import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import {
  getTeacherPayrollHistory,
  getTeacherAdvanceSalary,
  TeacherPayrollHistoryRow,
  TeacherPayrollHistorySummary,
  TeacherAdvanceSalaryResponse,
} from "@/services/payroll/teachers-payroll";
import { getTeacherById } from "@/services/teacher";
import { QueryParams } from "@/types/shared/query.type";
import PayrollHistoryFilters from "./_components/PayrollHistoryFilters";
import UnifiedPayrollTable, {
  AdvanceRow,
  PaymentRow,
  UnifiedRow,
} from "../../staff-payroll/[id]/_components/UnifiedPayrollTable";
import { formatDate } from "@/lib/utils";
import {
  handleDownloadAdvanceSalaryReceipt,
  handleDownloadPaymentReceipt,
} from "../_components/PayrollInvoiceReceipt";
import { MONTHS } from "@/constant/payroll/teacher-payroll";

interface TeachersPayrollInvoicesPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ month?: string; year?: string; page?: string }>;
}

const getMonthLabel = (month: number) =>
  MONTHS.find((m) => Number(m.value) === month)?.label ?? month;

const TeachersPayrollInvoicesPage = async ({
  params,
  searchParams,
}: TeachersPayrollInvoicesPageProps) => {
  const { id: teacherId } = await params;
  const filters = await searchParams;

  const page = filters.page ? Number(filters.page) : 1;
  const filterMonth = filters.month && !Number.isNaN(Number(filters.month))
    ? Number(filters.month)
    : undefined;
  const filterYear = filters.year && !Number.isNaN(Number(filters.year))
    ? Number(filters.year)
    : undefined;

  const filterPayload: Record<string, number> = {};
  if (filterMonth !== undefined) filterPayload.month = filterMonth;
  if (filterYear !== undefined) filterPayload.year = filterYear;

  const query: QueryParams[] = [{ label: "page", value: page.toString() }];
  if (Object.keys(filterPayload).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filterPayload) });
  }

  let rows: TeacherPayrollHistoryRow[] = [];
  let totalPages = 1;
  let totalItems = 0;
  let teacherName = "";
  let summary: TeacherPayrollHistorySummary = {
    totalMonthsPaid: 0,
    totalAmountPaid: 0,
  };
  let advanceRows: TeacherAdvanceSalaryResponse["data"] = [];
  let unifiedRows: UnifiedRow<TeacherPayrollHistoryRow>[] = [];

  try {
    const [historyResult, advanceResult, teacherResult] =
      await Promise.allSettled([
        getTeacherPayrollHistory(teacherId, query),
        getTeacherAdvanceSalary(teacherId, filterMonth, filterYear),
        getTeacherById(teacherId),
      ]);

    const historyResponse =
      historyResult.status === "fulfilled" ? historyResult.value : null;
    const advanceResponse =
      advanceResult.status === "fulfilled" ? advanceResult.value : null;
    const teacherResponse =
      teacherResult.status === "fulfilled" ? teacherResult.value : null;

    rows = Array.isArray(historyResponse?.data) ? historyResponse.data : [];
    totalPages = historyResponse?.meta?.totalPages ?? 1;
    totalItems = historyResponse?.meta?.totalItems ?? rows.length;
    summary = historyResponse?.summary ?? summary;

    advanceRows = Array.isArray(advanceResponse?.data)
      ? advanceResponse.data
      : [];

    teacherName =
      rows[0]?.teacherName ||
      (advanceRows[0] as any)?.teacher?.full_name ||
      teacherResponse?.data?.full_name ||
      "";

    const payments: PaymentRow<TeacherPayrollHistoryRow>[] = rows.map((row) => ({
      kind: "payment",
      id: row.paymentId,
      sl: row.sl,
      date: row.paidAt,
      period: `${getMonthLabel(row.month)} ${row.year}`,
      amount: row.amount,
      method: row.paymentMethod,
      reference: row.transactionId ?? row.paymentNote ?? "—",
      detail: "—",
      paidByAdmin: row.paidByAdmin,
      raw: row,
    }));

    const advances: AdvanceRow[] = advanceRows.map((row, index) => ({
      kind: "advance",
      id: row.id,
      sl: index + 1,
      date: row.given_at,
      amount: row.advance_amount,
      method: row.payment_method,
      reference:
        row.payment_method === "BKASH"
          ? row.transaction_id ?? "—"
          : row.payment_note ?? "—",
      detail: row.reason || "—",
      note: row.payment_note || "—",
      paidByAdmin: (row as any)?.paid_by_admin?.name ?? "—",
      raw: {
        ...row,
        teacherName: (row as any)?.teacher?.full_name || teacherName,
        paidByAdmin: (row as any)?.paid_by_admin?.name ?? "—",
      } as any,
    }));

    // Sort by date descending (most recent first)
    const combined = [...payments, ...advances].sort((a, b) => {
      const timeA = a.date ? new Date(a.date).getTime() : 0;
      const timeB = b.date ? new Date(b.date).getTime() : 0;
      return timeB - timeA;
    });

    // Renumber serials sequentially
    unifiedRows = combined.map((row, index) => ({
      ...row,
      sl: index + 1,
    }));
  } catch (error) {
    console.error("Failed to load payroll history:", error);
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={
          teacherName ? `${teacherName} — Payment History` : "Payment History"
        }
        backHref="/dashboard/payroll/teachers-payroll"
      />

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          Filter Payment History
        </span>
      </div>
      <PayrollHistoryFilters
        currentFilters={{ month: filters.month, year: filters.year }}
        summary={summary}
      />

      <UnifiedPayrollTable
        rows={unifiedRows}
        onDownloadPayment={handleDownloadPaymentReceipt}
        onDownloadAdvance={handleDownloadAdvanceSalaryReceipt}
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

export default TeachersPayrollInvoicesPage;
