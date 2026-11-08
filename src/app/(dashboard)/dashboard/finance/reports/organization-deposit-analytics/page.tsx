import { PageHeader } from "@/components/shared/page-header";
import { getOrganizationalIncomeReport } from "@/services/report";
import type { DepositMonth } from "../_components/types/depositReport";
import { DepositReportFilters } from "../_components/DepositReportFilters";
import { DepositSummaryCards } from "../_components/DepositSummaryCards";
import { DepositMonthlyBarChart } from "../_components/DepositMonthlyBarChart";
import { DepositMonthlyTable } from "../_components/DepositMonthlyTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface OrganizationDepositAnalyticsProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

const MAX_ITEMS = 100;

const buildFilter = (year: string, month: string): Record<string, unknown> => {
  if (!year) return {};

  const gte = year
    ? month
      ? `${year}-${month}-01`
      : `${year}-01-01`
    : "";
  const lte = year
    ? month
      ? `${year}-${month}-31`
      : `${year}-12-31`
    : "";

  return {
    deposit_date: {
      gte,
      lte,
    },
  };
};

const OrganizationDepositAnalytics = async ({
  searchParams,
}: OrganizationDepositAnalyticsProps) => {
  const resolved = await searchParams;
  const year = resolved.year ?? "";
  const month = resolved.month ?? "";

  const filter = buildFilter(year, month);
  const queryParams = [{ label: "limit", value: String(MAX_ITEMS) }];

  if (Object.keys(filter).length > 0) {
    queryParams.push({ label: "filter", value: JSON.stringify(filter) });
  }

  const response = await getOrganizationalIncomeReport(queryParams);

  const rawData = response?.data?.data ?? [];
  const data = Array.isArray(rawData) ? (rawData as DepositMonth[]) : [];

  const totalAmount = data.reduce((sum, m) => sum + m.totalAmount, 0);
  const totalCount = data.reduce((sum, m) => sum + m.incomeCount, 0);
  const monthCount = data.length;
  const dayCount = data.reduce((sum, m) => sum + m.days.length, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Organization Deposit Analytics"
        backHref="/dashboard/finance/reports"
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-900">
            Deposit Analytics
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Detailed monthly deposit trends with day-wise breakdown for the
            institution.
          </p>
        </div>

        <DepositReportFilters selectedYear={year} selectedMonth={month} />
      </div>

      <DepositSummaryCards
        totalAmount={totalAmount}
        totalCount={totalCount}
        monthCount={monthCount}
        dayCount={dayCount}
      />

      <DepositMonthlyBarChart data={data} />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700">
            Monthly Deposit Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DepositMonthlyTable data={data} />
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationDepositAnalytics;