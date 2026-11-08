import { PageHeader } from "@/components/shared/page-header";
import FacilitiesForm from "../_components/FacilitiesForm";

export default function CreateFacilitiesPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Add Facility"
        backHref="/dashboard/website/student-facilities"
      />
      <FacilitiesForm />
    </div>
  );
}
