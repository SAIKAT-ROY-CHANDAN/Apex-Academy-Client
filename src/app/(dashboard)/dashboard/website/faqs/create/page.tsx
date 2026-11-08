import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteFaqSection } from "@/services/websiteFaqSection";
import FaqEntriesForm from "../_components/FaqEntriesForm";
import FaqSectionForm from "../_components/FaqSectionForm";

export default async function CreateFaqPage() {
  let sectionData = null;

  try {
    const response = await getWebsiteFaqSection();
    sectionData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load FAQ section:", error);
  }

  return (
    <div className="space-y-6">
      <PageHeader title="FAQ's" backHref="/dashboard/website/faqs" />

      {/* Mirrors screenshot: Heading + Image with its own Reset/Save */}
      <FaqSectionForm initialData={sectionData} />

      {/* Question / Answer block with Add More */}
      <FaqEntriesForm />
    </div>
  );
}
