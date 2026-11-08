import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { getWebsiteSectionMedia } from "@/services/websiteSectionMedia";
import PublicMediaTabs from "@/components/shared/public-media-tabs";

const titleData = {
  subTitle: "Co-Curriculum Activities",
  title: "All Co-Curriculum Activities",
};

const GalleryPage = async () => {
  let photos: any[] = [];
  let videos: any[] = [];

  try {
    const [photoRes, videoRes] = await Promise.all([
      getWebsiteSectionMedia("co-curriculum-activities", "photo"),
      getWebsiteSectionMedia("co-curriculum-activities", "video"),
    ]);
    if (photoRes?.success && Array.isArray(photoRes?.data)) photos = photoRes.data;
    if (videoRes?.success && Array.isArray(videoRes?.data)) videos = videoRes.data;
  } catch (e) {
    console.error("Failed to load co-curriculum gallery media:", e);
  }

  return (
    <div>
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Co-Curriculum Activities Gallery"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities", href: "/students/student_facilities/co_curriculum" },
          { label: "Gallery" },
        ]}
      />
      <section className="bg-white py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <PageTitle titleData={titleData} />
          <p className="text-center text-sm text-slate-500 -mt-8 mb-8 font-almarai">
            Explore all photos and videos from our Co-Curriculum Activities
          </p>

          <PublicMediaTabs
            photos={photos}
            videos={videos}
            sectionLabel="Co-Curriculum Activities"
          />

          {photos.length === 0 && videos.length === 0 && (
            <p className="text-center text-xs text-slate-400 mt-6">
              Admin can add media from Website Settings → Co-Curriculum Activities
            </p>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
