import { PageHeader } from "@/components/shared/page-header";
import CurriculumForm from "../_components/CurriculumForm";

export default function CreateCurriculumPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Add Curriculum"
        backHref="/dashboard/website/curriculum"
      />
      <CurriculumForm />
    </div>
  );
}
