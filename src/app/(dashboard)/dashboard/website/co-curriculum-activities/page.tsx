import GallerySectionSettings from "@/app/(dashboard)/website-settings/_components/GallerySectionSettings";
import { getWebsiteSectionMedia } from "@/services/websiteSectionMedia";

const SECTION = "co-curriculum-activities" as const;

export default async function CoCurriculumActivitiesDashboardPage() {
  let initialPhotos: any[] | undefined = undefined;
  let initialVideos: any[] | undefined = undefined;

  try {
    const [photosRes, videosRes] = await Promise.all([
      getWebsiteSectionMedia(SECTION, "photo"),
      getWebsiteSectionMedia(SECTION, "video"),
    ]);
    if (photosRes?.success && Array.isArray(photosRes?.data)) {
      initialPhotos = photosRes.data;
    }
    if (videosRes?.success && Array.isArray(videosRes?.data)) {
      initialVideos = videosRes.data;
    }
  } catch (error) {
    console.error("Failed to load co-curriculum media:", error);
  }

  return (
    <GallerySectionSettings
      config={{ section: SECTION, label: "Co-Curriculum Activities" }}
      initialPhotos={initialPhotos}
      initialVideos={initialVideos}
    />
  );
}
