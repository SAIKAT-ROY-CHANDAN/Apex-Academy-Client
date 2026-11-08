import banner from "@/assets/heroBanner.webp";
import Image from "next/image";
import { FaAngleRight } from "react-icons/fa6";
import ManagementTeam from "../management/components/managementTeam";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getWebsiteChairmanMessage } from "@/services/websiteChairmanMessage";
import { getAllWebsiteGoverningBodyMembers } from "@/services/websiteGoverningBody";

const titleData = {
  subTitle: "Administration",
  title: "Meet Our Administration Team ",
};

const managementSectionTitle = {
  subTitle: "Management",
  title: "Meet Our Governing Body Members",
};

const page = async () => {
  let chairmanData = null;
  try {
    const response = await getWebsiteChairmanMessage();
    chairmanData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load chairman message:", error);
  }
  const chairmanImageUrl = chairmanData?.imageUrl;

  let governingBodyData = null;
  try {
    const response = await getAllWebsiteGoverningBodyMembers();
    governingBodyData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load governing body data:", error);
  }

  return (
    <div>
      <CoverPageBanner
        pageKey="managementTeam"
        fallbackBanner={banner}
        title="Administration"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Administration" },
        ]}
      />

      <div className="mt-20">
        <PageTitle titleData={titleData} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 xl:max-w-4xl 2xl:max-w-6xl mx-auto mt-10 px-4 lg:px-0">
          <div className="relative h-full aspect-4/3 w-full">
            <Image
              src={chairmanImageUrl}
              alt="Apex International Colleges"
              className="rounded-2xl object-cover"
              fill
              unoptimized
            />
          </div>

          <div className="h-full rounded-2xl bg-[#0F284E] p-8 ">
            <p className="mb-4 text-sm font-semibold text-[#E6A61E] font-almarai">
              QUOTE
            </p>
            <div
              className="bg-romove-message"
              dangerouslySetInnerHTML={{ __html: chairmanData?.message || "" }}
            />
            <button className="mx-auto flex w-fit items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold uppercase text-sm text-[#0F284E] md:mx-0 font-almarai mt-5">
              READ MORE
              <FaAngleRight className="h-5 w-5 rounded-full bg-[#0F284E] text-[#F59E0B]" />
            </button>
          </div>
        </div>
      </div>
      <div className="mb-20">
        <ManagementTeam
          titleData={managementSectionTitle}
          governingBodyData={governingBodyData}
        />
      </div>
    </div>
  );
};

export default page;
