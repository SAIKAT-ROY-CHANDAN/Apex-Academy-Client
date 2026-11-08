import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteCareerDevelopmentProgrammeById } from "@/services/websiteCareerDevelopmentProgramme";
import CareerDevelopmentProgrammeForm from "../../_components/CareerDevelopmentProgrammeForm";

export default async function EditCareerDevelopmentProgrammePage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteCareerDevelopmentProgrammeById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load career development programme:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Career Development Programme"
        backHref="/dashboard/website/career-development-programmes"
      />
      <CareerDevelopmentProgrammeForm initialData={initialData} />
    </div>
  );
}
