import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteCtaBanner } from "@/services/websiteCtaBanner";
import CtaBannerForm from "./_components/CtaBannerForm";

export default async function CtaBannerPage() {
  let initialData = null;

  try {
    const response = await getWebsiteCtaBanner();
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load CTA banner:", error);
  }

  return (
    <div className="space-y-2">
      <PageHeader title="CTA Banner" backHref="/dashboard/website" />
      <CtaBannerForm initialData={initialData} />
    </div>
  );
}
