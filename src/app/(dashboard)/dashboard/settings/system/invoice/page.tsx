import { PageHeader } from "@/components/shared/page-header";
import { getInstitutionInvoiceSettings } from "@/services/institutionInvoiceSetting";
import InstitutionInvoiceSettingForm from "./_components/InvoiceUploadSection";

export default async function InvoicePage() {
  const response = await getInstitutionInvoiceSettings();
  const initialData = response?.data;


  return (
    <div className="space-y-2">
      <PageHeader title="Invoice" backHref="/dashboard/settings/system" />
      <InstitutionInvoiceSettingForm initialData={initialData} />
    </div>
  );
}