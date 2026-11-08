import FeatureCard from "@/components/dashboard/FeatureCard";
import { PageHeader } from "@/components/shared/page-header";
import { HOSTEL_CARDS } from "@/constant/feature/hostel";
import {
  getHostelDashboardSummary,
  HostelDashboardSummary,
} from "@/services/hostel-report/hostel-report";
import HostelSummaryCards from "./_components/HostelSummaryCard";

interface HostelPageProps {
  searchParams: Promise<{ from?: string; to?: string }>;
}

const HostelPage = async ({ searchParams }: HostelPageProps) => {
  const filters = await searchParams;

  let summary: HostelDashboardSummary = {
    totalCollection: 0,
    totalBilled: 0,
    totalDue: 0,
    totalExpense: 0,
  };

  try {
    const response = await getHostelDashboardSummary(
      filters.from,
      filters.to,
    );

    summary = response?.data ?? summary;
  } catch (error) {
    console.error("Failed to load hostel dashboard summary:", error);
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title="Hostel Management" backHref="/dashboard" />

      <HostelSummaryCards
        summary={summary}
        from={filters.from}
        to={filters.to}
      />

      <div className="space-y-6 pb-2 sm:space-y-8">
        {HOSTEL_CARDS.map((group) => (
          <section key={group.section} className="space-y-3">
            {/* Section Header */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="h-px flex-1 bg-slate-200" />

              <div className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm sm:px-3 sm:text-[11px]">
                <span
                  className={`flex size-5 items-center justify-center rounded-full ${group.accentClass}`}
                >
                  <group.icon className="size-3" />
                </span>

                <span>{group.section}</span>
              </div>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Description */}
            <p className="px-0.5 text-xs leading-relaxed text-slate-500 sm:text-sm">
              {group.description}
            </p>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
              {group.cards.map((card) => (
                <FeatureCard
                  key={card.name}
                  name={card.name}
                  icon={<card.icon className="size-4 sm:size-5" />}
                  href={card.href}
                  color={card.color}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default HostelPage;