import { PageHeader } from "@/components/shared/page-header";
import CollectFeesForm from "./_components/CollectFeesForm";

export default async function HostelFeeForm() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Collect Hostel Fee"
        backHref="/dashboard/hostel/deposited"
      />
      <CollectFeesForm />
    </div>
  );
}
