import { PageHeader } from "@/components/shared/page-header";
import PrincipalForm from "@/app/(dashboard)/dashboard/website/principals/_components/PrincipalForm";

export default function WebsiteSettingsNewPrincipalPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="List of Our Principals"
        backHref="/website-settings/principals"
      />
      <PrincipalForm />
    </div>
  );
}
