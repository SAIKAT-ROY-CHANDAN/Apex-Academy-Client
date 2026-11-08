import FeatureCard from "@/components/dashboard/FeatureCard";
import { PageHeader } from "@/components/shared/page-header";
import { PAYROLL_CARDS } from "@/constant/feature/payroll";

const PayrollPage = () => {
  return (
    <div className="space-y-8">
      <PageHeader title="Payroll & Overtime" backHref="/dashboard" />

      <div className="space-y-10 pb-4">
        {PAYROLL_CARDS.map((group) => (
          <section key={group.section} className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-slate-500 shadow-sm">
                <span
                  className={`flex size-6 items-center justify-center rounded-full ${group.accentClass}`}
                >
                  <group.icon className="size-3.5" />
                </span>
                {group.section}
              </div>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <p className="px-1 text-sm text-slate-500">{group.description}</p>

            <div className="grid grid-cols-1 gap-4 sm:max-w-sm">
              {group.cards.map((card) => (
                <FeatureCard
                  key={card.name}
                  name={card.name}
                  icon={<group.icon className="h-5 w-5" />}
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

export default PayrollPage;
