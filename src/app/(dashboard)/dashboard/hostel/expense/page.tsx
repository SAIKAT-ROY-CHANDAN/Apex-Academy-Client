import { PageHeader } from "@/components/shared/page-header";
import { Plus } from "lucide-react";
import Link from "next/link";
import HostelExpenseTable from "./_components/HostelExpenseTable";
import {
  HostelExpenseQueryParams,
  getHostelExpenses,
} from "@/services/hostelExpense";

const PAGE_SIZE = 10;

interface ExpensePageSearchParams {
  page?: string | string[];
  searchTerm?: string | string[];
  fromDate?: string | string[];
  toDate?: string | string[];
  expenseBy?: string | string[];
}

const pick = <T,>(val: T | T[] | undefined): T | undefined =>
  Array.isArray(val) ? val[0] : val;

const ExpensePage = async ({
  searchParams,
}: {
  searchParams: Promise<ExpensePageSearchParams>;
}) => {
  const resolved = await searchParams;

  const page = Math.max(1, Number(pick(resolved.page) ?? 1) || 1);
  const searchTerm = pick(resolved.searchTerm) ?? "";
  const fromDate = pick(resolved.fromDate) ?? "";
  const toDate = pick(resolved.toDate) ?? "";
  const expenseBy = pick(resolved.expenseBy) ?? "";

  const filter: Record<string, any> = {};
  if (fromDate || toDate) {
    const dateFilter: Record<string, any> = {};
    if (fromDate) dateFilter.gte = new Date(fromDate).toISOString();
    if (toDate) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.lte = end.toISOString();
    }
    filter.expense_date = dateFilter;
  }

  const serviceParams: HostelExpenseQueryParams = {
    page,
    limit: PAGE_SIZE,
    orderBy: { created_at: "desc" },
  };

  if (searchTerm) serviceParams.searchTerm = searchTerm;
  if (Object.keys(filter).length > 0) serviceParams.filter = filter;

  const result = await getHostelExpenses(serviceParams);

  const items = (result?.data ?? []) as any[];
  const meta = result?.meta ?? {};
  const totalItems = Number(meta?.totalItems ?? items.length) ?? items.length;
  const totalPages =
    Number(meta?.totalPages ?? Math.ceil(totalItems / PAGE_SIZE)) ?? 1;

  const appliedFilter = {
    fromDate,
    toDate,
    expenseBy,
    searchTerm,
  };

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Hostel Expenses"
        backHref="/dashboard/hostel"
        components={
          <Link
            href="/dashboard/hostel/expense/add-expense"
            className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-primary px-5 text-sm font-semibold text-white shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/20 active:scale-95 dark:bg-primary"
          >
            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
            Add Expense
          </Link>
        }
      />

      <>
        <HostelExpenseTable
          expenses={items}
          currentPage={page}
          pageSize={PAGE_SIZE}
          totalItems={totalItems}
          totalPages={totalPages}
          appliedFilter={appliedFilter}
        />
      </>
    </div>
  );
};

export default ExpensePage;
