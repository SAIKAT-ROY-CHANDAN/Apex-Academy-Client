import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteCollegeAtGlance } from "@/services/websiteCollegeAtGlance";
import { getWebsiteHistoricalOutline } from "@/services/websiteHistoricalOutline";
import { getWebsiteVisionMission } from "@/services/websiteVisionMission";
import CollegeAtGlanceForm from "./_components/CollegeAtGlanceForm";
import HistoricalOutlineForm from "./_components/HistoricalOutlineForm";
import VisionMissionForm from "./_components/VisionMissionForm";

export default async function AboutCollegePage() {
  let glanceData = null;
  let outlineData = null;
  let visionMissionData = null;

  try {
    const response = await getWebsiteCollegeAtGlance();
    glanceData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load college at a glance section:", error);
  }

  try {
    const response = await getWebsiteHistoricalOutline();
    outlineData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load historical outline section:", error);
  }

  try {
    const response = await getWebsiteVisionMission();
    visionMissionData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load vision & mission section:", error);
  }

  return (
    <div className="space-y-2">
      <PageHeader title="About College" backHref="/dashboard/website" />
      <CollegeAtGlanceForm initialData={glanceData} />
      <HistoricalOutlineForm initialData={outlineData} />
      <VisionMissionForm initialData={visionMissionData} />
    </div>
  );
}
