import Image from "next/image";
import banner from "@/assets/heroBanner.webp";
import { FaAngleRight } from "react-icons/fa6";
import image1 from "@/assets/students-facilitis/qr.webp";
import { TbCoinTaka } from "react-icons/tb";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import Link from "next/link";
import { getAllWebsiteCareerDevelopmentProgrammes } from "@/services/websiteCareerDevelopmentProgramme";

const titleData = {
  subTitle: "Career Development",
  title: "Registration for Career Development  Programmers",
};

export type TCourse = {
  id: string;
  programName: string;
  entryFee: string;
  description: string;
  create_at: string;
};

const page = async () => {
  const res = await getAllWebsiteCareerDevelopmentProgrammes();
  const courseData: TCourse[] = res?.data || [];
  return (
    <div className="mb-20">
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Registration"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Registration for Career Development" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
        {courseData.map((item) => (
          <div className="bg-[#0F284E] p-6 rounded-2xl flex gap-8 justify-between">
            <div className="flex flex-col justify-between">
              <div>
                <p className="text-[10px] flex items-center gap-1 bg-[#F59E0B] w-fit px-2 py-1 rounded-full text-[#0F284E] font-almarai">
                  <TbCoinTaka />
                  Entry Fee- {item.entryFee}
                </p>
                <h2 className="text-2xl text-white mt-2 font-bebas">
                  {item.programName}
                </h2>
              </div>
              <Link
                href={`/students/student_facilities/career_developments_opportunity/${item.id}`}
                className="mx-auto flex w-fit items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2 font-bold uppercase text-xs font-almarai text-[#0F284E] md:mx-0"
              >
                Apply Now
                <FaAngleRight className="h-4 w-4 rounded-full bg-[#0F284E] text-[#F59E0B]" />
              </Link>
            </div>
            <div className="flex items-center justify-center p-2 overflow-hidden bg-white rounded-2xl h-[150px] w-[150px] shrink-0">
              <Image
                src={image1}
                alt="QR Code"
                width={130}
                height={130}
                className="rounded-lg object-contain"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
