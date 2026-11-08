import AcademicProgramsSettings from "./_components/AcademicProgramsSettings";
import { getAcademicProgramMedia } from "@/services/academicProgramMedia";

export default async function AcademicProgramsPage() {
  let initialPhotos: any[] | undefined = undefined;
  let initialVideos: any[] | undefined = undefined;

  try {
    const [photosRes, videosRes] = await Promise.all([
      getAcademicProgramMedia("photo"),
      getAcademicProgramMedia("video"),
    ]);
    if (photosRes?.success && Array.isArray(photosRes?.data)) {
      initialPhotos = photosRes.data;
    }
    if (videosRes?.success && Array.isArray(videosRes?.data)) {
      initialVideos = videosRes.data;
    }
  } catch (error) {
    console.error("Failed to load academic program media:", error);
  }

  return (
    <AcademicProgramsSettings
      initialPhotos={initialPhotos}
      initialVideos={initialVideos}
    />
  );
}
