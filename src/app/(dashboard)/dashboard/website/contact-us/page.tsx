import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteContactUs } from "@/services/websiteContactUs";
import ContactUsForm from "./_components/ContactUsForm";

export default async function ContactUsPage() {
  let initialData = null;

  try {
    const response = await getWebsiteContactUs();
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load Contact Us:", error);
  }

  return (
    <div className="space-y-2">
      <PageHeader title="Contact Us" backHref="/dashboard/website" />
      <ContactUsForm initialData={initialData} />
    </div>
  );
}
