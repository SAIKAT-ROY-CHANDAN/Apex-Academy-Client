import { getAllOverviewCount } from "@/services/report";
import FeatureCard from "@/components/dashboard/FeatureCard";
import REPORT_FEATURES from "@/constant/feature/report";
import {
  AlertCircle,
  BanknoteArrowDown,
  BanknoteArrowUp,
  HandCoins,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";

type OverviewMetricKey =
  | "totalFineAmount"
  | "totalOrganizationExpenses"
  | "totalOrganizationIncome"
  | "totalStudentCollection"
  | "totalStudentDueAmount";

type OverviewMetrics = Record<OverviewMetricKey, number>;

const metricConfigs: Array<{
  key: OverviewMetricKey;
  label: string;
  icon: LucideIcon;
  accentClass: string;
}> = [
  {
    key: "totalFineAmount",
    label: "Total Late Fee",
    icon: AlertCircle,
    accentClass: "text-amber-600 bg-amber-50",
  },
  {
    key: "totalOrganizationExpenses",
    label: "Total Organization Expenses",
    icon: BanknoteArrowDown,
    accentClass: "text-rose-600 bg-rose-50",
  },
  {
    key: "totalOrganizationIncome",
    label: "Total Organization Income",
    icon: BanknoteArrowUp,
    accentClass: "text-emerald-600 bg-emerald-50",
  },
  {
    key: "totalStudentCollection",
    label: "Total Student Collection",
    icon: HandCoins,
    accentClass: "text-sky-600 bg-sky-50",
  },
  {
    key: "totalStudentDueAmount",
    label: "Total Student Due Amount",
    icon: Wallet,
    accentClass: "text-violet-600 bg-violet-50",
  },
];

const defaultMetrics: OverviewMetrics = {
  totalFineAmount: 0,
  totalOrganizationExpenses: 0,
  totalOrganizationIncome: 0,
  totalStudentCollection: 0,
  totalStudentDueAmount: 0,
};

const toSafeNumber = (value: unknown) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const normalizeOverviewMetrics = (payload: unknown): OverviewMetrics => {
  const source =
    payload && typeof payload === "object"
      ? ((payload as { data?: unknown }).data ?? payload)
      : {};

  const data = source as Partial<Record<OverviewMetricKey, unknown>>;

  return {
    totalFineAmount: toSafeNumber(data.totalFineAmount),
    totalOrganizationExpenses: toSafeNumber(data.totalOrganizationExpenses),
    totalOrganizationIncome: toSafeNumber(data.totalOrganizationIncome),
    totalStudentCollection: toSafeNumber(data.totalStudentCollection),
    totalStudentDueAmount: toSafeNumber(data.totalStudentDueAmount),
  };
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const ReportManagement = async () => {
  const overviewCount = await getAllOverviewCount();
  const metrics = normalizeOverviewMetrics(overviewCount ?? defaultMetrics);

  return (
    <div className="space-y-5">
      <div>
        <PageHeader title="Reports" backHref="/dashboard/finance" />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {metricConfigs.map(({ key, label, icon: Icon, accentClass }) => (
            <Card
              key={key}
              className="overflow-hidden border-slate-200/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
            >
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium leading-snug text-slate-600">
                  {label}
                </CardTitle>
              </CardHeader>

              <CardContent className="flex items-center justify-between gap-3 pt-0">
                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {formatAmount(metrics[key])}
                </p>

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accentClass}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>

              <div className="h-1 w-full bg-linear-to-r from-slate-200 via-slate-100 to-white" />
            </Card>
          ))}
        </div>

        <div className="mt-5">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">
              Reports Modules
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Explore various financial reports and analytics to gain insights
              into the institution's financial health and student collection
              trends.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mt-5">
            {REPORT_FEATURES.map((feature) => (
              <FeatureCard
                key={feature.name}
                name={feature.name}
                icon={feature.icon}
                href={feature.href}
                color={feature.color}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportManagement;
