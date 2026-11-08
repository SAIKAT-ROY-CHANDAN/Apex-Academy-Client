import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteHeroSection } from "@/services/websiteHeroSection";
import HeroSectionForm from "./_components/HeroSectionForm";

export default async function HeroSectionPage() {
  let initialData = null;

  try {
    const response = await getWebsiteHeroSection();
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load website hero section:", error);
  }

  return (
    <div className="space-y-2">
      <PageHeader title="Hero Section" backHref="/dashboard/website" />
      <HeroSectionForm initialData={initialData} />
    </div>
  );
}
