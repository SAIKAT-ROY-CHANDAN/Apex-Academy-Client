import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteCareerDevelopmentApplicationsByProgramme } from "@/services/websiteCareerDevelopmentApplication";
import { getWebsiteCareerDevelopmentProgrammeById } from "@/services/websiteCareerDevelopmentProgramme";
import CareerDevelopmentApplicationsTable from "../../_components/CareerDevelopmentApplicationsTable";

export default async function CareerDevelopmentApplicationsPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let programme = null;
  let applications: Awaited<
    ReturnType<typeof getWebsiteCareerDevelopmentApplicationsByProgramme>
  >["data"] = [];
  let loadError = false;

  try {
    const programmeResponse =
      await getWebsiteCareerDevelopmentProgrammeById(id);
    programme = programmeResponse?.data ?? null;
  } catch (error) {
    console.error("Failed to load career development programme:", error);
    loadError = true;
  }

  try {
    const response =
      await getWebsiteCareerDevelopmentApplicationsByProgramme(id);
    applications = response?.data ?? [];
  } catch (error) {
    console.error("Failed to load applications:", error);
    loadError = true;
  }

  if (!programme && loadError) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title={programme?.programName ?? "Applications"}
        backHref="/dashboard/website/career-development-programmes"
      />
      <CareerDevelopmentApplicationsTable applications={applications} />
    </div>
  );
}
