import FeatureCard from "@/components/dashboard/FeatureCard";
import { PageHeader } from "@/components/shared/page-header";
import STUDENT_MANAGEMENT_FEATURES from "@/constant/feature/studentManagement";

const StudentManagement = () => {
  return (
    <div className="space-y-8">
      <PageHeader title="Student Management" backHref="/dashboard" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {STUDENT_MANAGEMENT_FEATURES.map((feature) => (
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
  );
};

export default StudentManagement;
