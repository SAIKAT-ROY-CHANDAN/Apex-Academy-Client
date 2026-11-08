import { PageHeader } from "@/components/shared/page-header";
import CareerDevelopmentProgrammeForm from "../_components/CareerDevelopmentProgrammeForm";

export default function CreateCareerDevelopmentProgrammePage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Add Career Development Programme"
        backHref="/dashboard/website/career-development-programmes"
      />
      <CareerDevelopmentProgrammeForm />
    </div>
  );
}
