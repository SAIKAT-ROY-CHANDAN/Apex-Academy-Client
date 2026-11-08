import { PageHeader } from "@/components/shared/page-header";
import TuitionForm from "../_components/TuitionForm";

export default function CreateTuitionPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Add Tuition"
        backHref="/dashboard/website/tuition-fees"
      />
      <TuitionForm />
    </div>
  );
}
