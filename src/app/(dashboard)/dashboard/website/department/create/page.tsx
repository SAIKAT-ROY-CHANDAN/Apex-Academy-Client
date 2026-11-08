import { PageHeader } from "@/components/shared/page-header";
import DepartmentForm from "../_components/DepartmentForm";

export default function CreateDepartmentPage() {
  return (
    <div className="space-y-2">
      <PageHeader title="Department" backHref="/dashboard/website/department" />
      <DepartmentForm />
    </div>
  );
}
