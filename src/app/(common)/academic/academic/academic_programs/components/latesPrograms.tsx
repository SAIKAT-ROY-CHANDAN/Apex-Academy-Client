import { PageTitle, TTitle } from "@/components/shared/page-title";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";
import { getAcademicProgramMedia } from "@/services/academicProgramMedia";
import AcademicProgramsTabs from "./AcademicProgramsTabs";

type MediaRow = {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  captureDate: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
};

type TTitleProps = {
  titleData: TTitle;
};

const LatesPrograms = async ({ titleData }: TTitleProps) => {
  let photos: MediaRow[] = [];
  let videos: MediaRow[] = [];

  try {
    const [photoRes, videoRes] = await Promise.all([
      getAcademicProgramMedia("photo"),
      getAcademicProgramMedia("video"),
    ]);
    if (photoRes?.success && Array.isArray(photoRes?.data)) {
      photos = photoRes.data as MediaRow[];
    }
    if (videoRes?.success && Array.isArray(videoRes?.data)) {
      videos = videoRes.data as MediaRow[];
    }
  } catch (e) {
    console.error("Failed to load academic programs for public page:", e);
  }

  return (
    <section className="bg-white py-10 px-6">
      <div className="mx-auto max-w-6xl">
        <PageTitle titleData={titleData} />

        <AcademicProgramsTabs photos={photos} videos={videos} previewLimit={6} />

        <div className="flex justify-center mt-10">
          <Link
            href="/academic/academic/academic_programs/gallery"
            className="mx-auto w-full md:w-fit h-fit flex justify-center items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold font-almarai uppercase text-[#0F284E] md:mx-0 text-xs "
          >
            View More
            <FaAngleRight className="h-7 w-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default LatesPrograms;
