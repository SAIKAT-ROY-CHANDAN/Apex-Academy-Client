import { GraduationCap, Briefcase } from "lucide-react";
import FeatureCard from "@/components/dashboard/FeatureCard";
import { PageHeader } from "@/components/shared/page-header";
import EMPLOYEE_FEATURES from "@/constant/feature/employee";

const EmployeesPage = () => {
  const teacherFeatures = EMPLOYEE_FEATURES.filter(
    (f) => f.name.includes("Teacher") || f.name === "Class Taken Report",
  );
  const staffFeatures = EMPLOYEE_FEATURES.filter((f) =>
    f.name.includes("Staff"),
  );

  return (
    <div className="space-y-8">
      <PageHeader title="Employees Management" backHref="/dashboard" />

      {/* Teachers Section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
            <GraduationCap className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Teachers</h2>
            <p className="text-xs text-slate-500">
              Manage teacher records, attendance, leave & more
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {teacherFeatures.map((feature) => (
            <FeatureCard
              key={feature.name}
              name={feature.name}
              icon={feature.icon}
              href={feature.href}
              color={feature.color}
            />
          ))}
        </div>
      </section>

      {/* Staffs Section */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
            <Briefcase className="size-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Staffs</h2>
            <p className="text-xs text-slate-500">
              Manage staff records, attendance, leave & more
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {staffFeatures.map((feature) => (
            <FeatureCard
              key={feature.name}
              name={feature.name}
              icon={feature.icon}
              href={feature.href}
              color={feature.color}
            />
          ))}
        </div>
      </section>
    </div>
  );
};

export default EmployeesPage;
