import { PageHeader } from "@/components/shared/page-header";
import HodForm from "../_components/HodForm";

export default function CreateHeadOfDepartmentPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Head of the Departments"
        backHref="/dashboard/website/head-of-departments"
      />
      <HodForm />
    </div>
  );
}
