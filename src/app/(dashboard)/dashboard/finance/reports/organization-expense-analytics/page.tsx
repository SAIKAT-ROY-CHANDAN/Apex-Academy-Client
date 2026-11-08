import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getOrganizationalExpensesReport } from "@/services/report";
import { ExpenseMonthlyBarChart } from "../_components/ExpenseMonthlyBarChart";
import { ExpenseMonthlyTable } from "../_components/ExpenseMonthlyTable";
import { ExpenseReportFilters } from "../_components/ExpenseReportFilters";
import { ExpenseSummaryCards } from "../_components/ExpenseSummaryCards";
import type { ExpenseMonth } from "../_components/types/expenseReport";

interface OrganizationExpenseAnalyticsProps {
  searchParams: Promise<{
    from_date?: string;
    to_date?: string;
  }>;
}

const MAX_ITEMS = 100;

const isValidDate = (value: string): boolean =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());

const buildFilter = (
  from_date: string,
  to_date: string,
): Record<string, unknown> => {
  const range: Record<string, string> = {};
  if (from_date) range.gte = from_date;
  // Include the full To date (entries later in the day must not be dropped).
  if (to_date) range.lte = `${to_date}T23:59:59.999Z`;
  if (Object.keys(range).length === 0) return {};

  return { expense_date: range };
};

const OrganizationExpenseAnalytics = async ({
  searchParams,
}: OrganizationExpenseAnalyticsProps) => {
  const resolved = await searchParams;
  const rawFrom = resolved.from_date ?? "";
  const rawTo = resolved.to_date ?? "";

  // Only accept real calendar dates; anything else means "no bound".
  let from_date = isValidDate(rawFrom) ? rawFrom : "";
  let to_date = isValidDate(rawTo) ? rawTo : "";
  // An inverted range would return nothing — swap so it still filters smoothly.
  if (from_date && to_date && to_date < from_date) {
    [from_date, to_date] = [to_date, from_date];
  }

  const filter = buildFilter(from_date, to_date);
  const queryParams = [{ label: "limit", value: String(MAX_ITEMS) }];

  if (Object.keys(filter).length > 0) {
    queryParams.push({ label: "filter", value: JSON.stringify(filter) });
  }

  const response = await getOrganizationalExpensesReport(queryParams);

  const rawData = response?.data?.data ?? [];
  const data = Array.isArray(rawData) ? (rawData as ExpenseMonth[]) : [];

  const totalAmount = data.reduce((sum, m) => sum + m.totalAmount, 0);
  const totalCount = data.reduce((sum, m) => sum + m.expenseCount, 0);
  const monthCount = data.length;
  const dayCount = data.reduce((sum, m) => sum + m.days.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Expense Analytics"
        backHref="/dashboard/finance/reports"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Expense Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Detailed monthly expense trends with day-wise breakdown for the
            institution.
          </p>
        </div>

        <ExpenseReportFilters selectedFrom={from_date} selectedTo={to_date} />
      </div>

      <ExpenseSummaryCards
        totalAmount={totalAmount}
        totalCount={totalCount}
        monthCount={monthCount}
        dayCount={dayCount}
      />

      <ExpenseMonthlyBarChart data={data} />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700">
            Monthly Expense Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ExpenseMonthlyTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationExpenseAnalytics;
