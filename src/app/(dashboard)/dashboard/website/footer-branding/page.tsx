import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteFooterBranding } from "@/services/websiteFooterBranding";
import FooterBrandingForm from "./_components/FooterBrandingForm";

export default async function FooterBrandingPage() {
  let initialData = null;

  try {
    const response = await getWebsiteFooterBranding();
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load website footer branding:", error);
  }

  return (
    <div className="space-y-2">
      <PageHeader title="Footer & Branding" backHref="/dashboard/website" />
      <FooterBrandingForm initialData={initialData} />
    </div>
  );
}