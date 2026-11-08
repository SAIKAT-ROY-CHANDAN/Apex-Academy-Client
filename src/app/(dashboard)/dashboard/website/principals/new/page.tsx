import { PageHeader } from "@/components/shared/page-header";
import PrincipalForm from "../_components/PrincipalForm";

export default function NewPrincipalPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="List of Our Principals"
        backHref="/dashboard/website/principals"
      />
      <PrincipalForm />
    </div>
  );
}
