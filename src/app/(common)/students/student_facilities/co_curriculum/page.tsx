import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";
import { getWebsiteSectionMedia } from "@/services/websiteSectionMedia";
import PublicMediaTabs from "@/components/shared/public-media-tabs";

const titleData = {
  subTitle: "Co-Curriculum Activities",
  title: "View Our Co-Curriculum Activities",
};

const Page = async () => {
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
    console.error("Failed to load co-curriculum for public page:", e);
  }

  return (
    <div className="mb-20">
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Co-Curriculum Activities"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Co-Curriculum Activities" },
        ]}
      />

      <section className="bg-white py-10 px-6">
        <div className="mx-auto max-w-6xl">
          <PageTitle titleData={titleData} />

          <PublicMediaTabs
            photos={photos}
            videos={videos}
            previewLimit={6}
            sectionLabel="Co-Curriculum Activities"
          />

          <div className="flex justify-center mt-10">
            <Link
              href="/students/student_facilities/co_curriculum/gallery"
              className="mx-auto w-full md:w-fit h-fit flex justify-center items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold font-almarai uppercase text-[#0F284E] md:mx-0 text-xs"
            >
              View More
              <FaAngleRight className="h-7 w-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Page;
