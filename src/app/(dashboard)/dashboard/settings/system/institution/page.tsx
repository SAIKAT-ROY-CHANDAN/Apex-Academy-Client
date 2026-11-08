import { PageHeader } from "@/components/shared/page-header";
import { getInstitutionDetails } from "@/services/institution";
import InstitutionDetail from "./_components/InstitutionDetail";

const InstitutionPage = async () => {
  const institutionRes = await getInstitutionDetails();
  const institution = institutionRes?.data ?? null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Institution Settings"
        backHref="/dashboard/settings/system"
      />

      <InstitutionDetail institution={institution} />
    </div>
  );
};

export default InstitutionPage;
