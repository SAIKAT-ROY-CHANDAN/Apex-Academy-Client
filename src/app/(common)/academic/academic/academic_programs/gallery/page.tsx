import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { getAcademicProgramMedia } from "@/services/academicProgramMedia";
import AcademicProgramsTabs from "../components/AcademicProgramsTabs";

const titleData = {
  subTitle: "Academic Programs",
  title: "All Academic Programs",
};

const GalleryPage = async () => {
  let photos: any[] = [];
  let videos: any[] = [];

  try {
    const [photoRes, videoRes] = await Promise.all([
      getAcademicProgramMedia("photo"),
      getAcademicProgramMedia("video"),
    ]);
    if (photoRes?.success && Array.isArray(photoRes?.data)) photos = photoRes.data;
    if (videoRes?.success && Array.isArray(videoRes?.data)) videos = videoRes.data;
  } catch (e) {
    console.error("Failed to load gallery media:", e);
  }

  return (
    <div>
      <CoverPageBanner
        pageKey="academic"
        fallbackBanner={banner}
        title="Academic Programs Gallery"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic", href: "/academic/academic/academic_programs" },
          { label: "Gallery" },
        ]}
      />
      <section className="bg-white py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <PageTitle titleData={titleData} />
          <p className="text-center text-sm text-slate-500 -mt-8 mb-8 font-almarai">
            Explore all photos and videos from our Academic Programs
          </p>

          <AcademicProgramsTabs photos={photos} videos={videos} />

          {(photos.length === 0 && videos.length === 0) && (
            <p className="text-center text-xs text-slate-400 mt-6">
              Admin can add media from Website Settings → Academic Programs
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
