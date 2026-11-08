import Image from "next/image";
import { FaAngleRight } from "react-icons/fa6";
import { IoIosRocket } from "react-icons/io";
import building1 from "@/assets/about/building1.jpg";
import building2 from "@/assets/about/building2.jpg";
import building3 from "@/assets/about/building3.jpg";
import man from "@/assets/about/man.jpg";
import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { getWebsiteHistoricalOutline } from "@/services/websiteHistoricalOutline";
import { getWebsitePrincipalMessage } from "@/services/websitePrincipalMessage";
import { getWebsiteVisionMission } from "@/services/websiteVisionMission";
import AboutGlance from "./components/glance";
import PrincipalsList from "./components/principalsList";

const titleData = {
  subTitle: "Principals",
  title: "List of Our Principals",
};

const Page = async () => {
  let historicalOutline: Record<string, string> | null = null;
  let visionMission: Record<string, string> | null = null;

  try {
    const outlineData = await getWebsiteHistoricalOutline();
    historicalOutline = outlineData?.data ?? null;
  } catch {
    historicalOutline = null;
  }

  try {
    const visionMissionData = await getWebsiteVisionMission();
    visionMission = visionMissionData?.data ?? null;
  } catch {
    visionMission = null;
  }

  const outlineImages = [
    historicalOutline?.imageUrl1,
    historicalOutline?.imageUrl2,
    historicalOutline?.imageUrl3,
  ].filter(Boolean);
  const gridImages = [
    outlineImages[0] ?? building1,
    outlineImages[1] ?? building3,
    outlineImages[2] ?? building2,
  ];

  let principalData = null;
  try {
    const response = await getWebsitePrincipalMessage();
    principalData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load principal message:", error);
  }
  const principalImageUrl = principalData?.imageUrl;
  return (
    <div>
      {/* Banner */}
      <CoverPageBanner
        pageKey="aboutCollege"
        fallbackBanner={banner}
        title="About College"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About College" }]}
      />

      <div className="mx-auto xl:max-w-4xl 2xl:max-w-6xl">
        <AboutGlance />
      </div>

      {/* Content Section */}
      <div className="xl:max-w-4xl 2xl:max-w-6xl grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8 px-4 mt-16 lg:mt-32 max-w-6xl mx-auto">
        {/* Image Grid */}
        <div className="w-full order-2 lg:order-1">
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <div className="relative h-[180px] sm:h-[220px] lg:h-[250px] overflow-hidden rounded-2xl">
              {/* biome-ignore lint/performance/noImgElement: next/image blocks localhost private IPs */}
              <img
                src={
                  typeof gridImages[0] === "string"
                    ? gridImages[0]
                    : gridImages[0].src
                }
                alt="Apex International Colleges"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="relative h-[180px] sm:h-[220px] lg:h-[250px] overflow-hidden rounded-2xl">
              {/* biome-ignore lint/performance/noImgElement: next/image blocks localhost private IPs */}
              <img
                src={
                  typeof gridImages[1] === "string"
                    ? gridImages[1]
                    : gridImages[1].src
                }
                alt="Apex International Colleges"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="col-span-2 relative h-[220px] sm:h-[280px] lg:h-[350px] overflow-hidden rounded-2xl">
              {/* biome-ignore lint/performance/noImgElement: next/image blocks localhost private IPs */}
              <img
                src={
                  typeof gridImages[2] === "string"
                    ? gridImages[2]
                    : gridImages[2].src
                }
                alt="Apex International Colleges"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Text Content */}
        <div className="order-1 lg:order-2">
          <p className="text-sm font-semibold text-[#E6A61E] mb-3 sm:mb-4 text-center uppercase md:text-start font-almarai">
            Historical Outline
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl uppercase text-[#0F284E] xl:text-5xl text-center md:text-start font-bebas">
            {historicalOutline?.heading || "Apex International College"}
          </h2>
          {historicalOutline?.description ? (
            <div
              className="mt-4 sm:mt-6 text-base sm:text-[18px] leading-6 text-[#404040] text-center md:text-start font-almarai"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: API content is trusted
              dangerouslySetInnerHTML={{
                __html: historicalOutline.description,
              }}
            />
          ) : (
            <>
              <p className="mt-4 sm:mt-6 text-base sm:text-[18px] leading-6 text-[#404040] text-center md:text-start font-almarai">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua
              </p>
              <p className="text-center md:text-start text-base sm:text-[18px] leading-6 text-[#404040] font-almarai">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Lorem ipsum dolor sit
                amet, consectetur adipiscing elit, sed do eiusmod tempor
                incididunt ut labore et dolore magna aliqua. Ut enim ad minim
                veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip ex ea commodo consequat. Lorem ipsum dolor sit amet,
                consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
                labore et dolore magna aliqua
              </p>
            </>
          )}
        </div>
      </div>

      {/* banner */}
      <div className="bg-[#0F284E] rounded-2xl py-20 mt-20 mx-4 md:mx-0">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 w-full">
            <div className="p-4">
              <p className="text-[#F59E0B] uppercase mb-4 text-center lg:text-start font-almarai">
                Vission &amp; Mission
              </p>
              <h2 className="text-[25px] uppercase text-white text-center lg:text-start font-bebas">
                {visionMission?.heading ||
                  "Quality education for a brighter future"}
              </h2>
            </div>
            <div />
            <div className="p-4">
              <p className="text-[18px] text-white text-center lg:text-start font-almarai">
                {visionMission?.subHeading ||
                  "We are committed to providing quality education, a supportive environment, and the skills students need to succeed in today\u2019s world."}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mt-10 px-4 lg:px-0">
          <div>
            <p className="bg-[#F59E0B] p-8 rounded-2xl w-fit mb-8 mx-auto lg:mx-0">
              <IoIosRocket className="text-4xl text-[#0F284E]" />
            </p>
            <hr className="mb-8" />
            <h2 className="text-3xl uppercase mb-6 text-white text-center lg:text-start font-bebas">
              Our Vision
            </h2>
            <p className="text-[18px] leading-7 text-white text-center lg:text-start font-almarai">
              {visionMission?.vision ||
                "To provide quality education in a disciplined environment that builds knowledge, skills, and values."}
            </p>
          </div>
          <div>
            <p className="bg-[#F59E0B] p-8 rounded-2xl w-fit mb-8 mx-auto lg:mx-0">
              <IoIosRocket className="text-4xl text-[#0F284E]" />
            </p>
            <hr className="mb-8" />
            <h2 className="text-3xl uppercase mb-6 text-white text-center lg:text-start font-bebas">
              Our Mission
            </h2>
            <p className="text-[18px] leading-7 text-white text-center lg:text-start font-almarai">
              {visionMission?.mission ||
                "To provide quality education in a disciplined environment that builds knowledge, skills, and values."}
            </p>
          </div>
          <div>
            <p className="bg-[#F59E0B] p-8 rounded-2xl w-fit mb-8 mx-auto lg:mx-0">
              <IoIosRocket className="text-4xl text-[#0F284E]" />
            </p>
            <hr className="mb-8" />
            <h2 className="text-3xl uppercase mb-6 text-white text-center lg:text-start font-bebas">
              Our Goal
            </h2>
            <p className="text-[18px] leading-7 text-white text-center lg:text-start font-almarai">
              {visionMission?.goal ||
                "To provide quality education in a disciplined environment that builds knowledge, skills, and values."}
            </p>
          </div>
        </div>
      </div>

      {/* QUOTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:max-w-4xl 2xl:max-w-6xl mx-auto mt-20 px-4 lg:px-0">
        <div className="relative w-full h-100 md:h-full overflow-hidden rounded-2xl">
          {typeof principalImageUrl === "string" && principalImageUrl ? (
            <Image
              src={principalImageUrl}
              alt={principalData?.name ?? "Principal"}
              fill
              className="rounded-2xl object-cover"
              unoptimized
            />
          ) : (
            <Image
              src={man}
              alt="Principal"
              fill
              className="rounded-2xl object-cover"
            />
          )}
        </div>

        <div className="h-full rounded-2xl bg-[#0F284E] p-4 lg:p-6">
          <h1 className="mb-4 text-sm font-semibold text-[#E6A61E] text-center md:text-start font-almarai">
            QUOTE
          </h1>
          <h2 className="mb-6 text-4xl font-bebas uppercase text-white text-center md:text-start">
            {principalData?.name}
          </h2>
          <div
            className="mb-10"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: API content is trusted
            dangerouslySetInnerHTML={{ __html: principalData?.message || "" }}
          />
          <button
            type="button"
            className="mx-auto flex w-fit items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold uppercase text-[#0F284E] md:mx-0 font-almarai"
          >
            READ MORE
            <FaAngleRight className="h-7 w-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
          </button>
        </div>
      </div>

      {/* principals list */}
      <div className="mt-28 lg:max-w-4xl 2xl:max-w-6xl mx-auto">
        <PageTitle titleData={titleData} />
        <PrincipalsList />
      </div>
    </div>
  );
};

export default Page;
