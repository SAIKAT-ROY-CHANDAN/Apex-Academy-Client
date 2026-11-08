import { PageHeader } from "@/components/shared/page-header";
import MemberForm from "../_components/MemberForm";

export default function CreateGoverningBodyMemberPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Governing Body"
        backHref="/dashboard/website/governing-body-administrators"
      />
      <MemberForm />
    </div>
  );
}
