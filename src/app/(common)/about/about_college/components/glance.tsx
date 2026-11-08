import fallbackImage from "@/assets/about/image.jpg";
import fallbackImage1 from "@/assets/about/image1.jpg";
import fallbackImage2 from "@/assets/about/image2.jpg";
import fallbackImage3 from "@/assets/about/image3.jpg";
import { getWebsiteCollegeAtGlance } from "@/services/websiteCollegeAtGlance";

const AboutGlance = async () => {
  let collegeData: Record<string, string> | null = null;

  try {
    const data = await getWebsiteCollegeAtGlance();
    collegeData = data?.data ?? null;
  } catch {
    collegeData = null;
  }

  const gridImages = [
    collegeData?.imageUrl1 ?? fallbackImage1,
    collegeData?.imageUrl2 ?? fallbackImage2,
    collegeData?.imageUrl3 ?? fallbackImage3,
  ];
  const mainImage = collegeData?.imageUrl4 ?? fallbackImage;

  return (
    <div className="mx-auto xl:max-w-4xl 2xl:max-w-6xl grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 px-4 mt-20">
      <div>
        <p className="text-sm uppercase font-semibold text-[#E6A61E] mb-4 text-center md:text-start font-almarai">
          At a Glance
        </p>
        <h2 className="mt-2 text-4xl uppercase text-[#0F284E] sm:text-5xl text-center md:text-start font-bebas">
          {collegeData?.heading || "Apex International College"}
        </h2>
        {collegeData?.description ? (
          <div
            className="mt-4 text-[18px] leading-6 text-[#404040] text-center md:text-start font-almarai space-y-4"
            // biome-ignore lint/security/noDangerouslySetInnerHtml: API content is trusted
            dangerouslySetInnerHTML={{ __html: collegeData.description }}
          />
        ) : (
          <>
            <p className="mt-4 text-[18px] leading-6 text-[#404040] text-center md:text-start font-almarai">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="mt-2 text-[18px] leading-6 text-[#404040] text-center md:text-start font-almarai">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat.
            </p>
            <p className="mt-2 text-[18px] leading-6 text-[#404040] text-center md:text-start font-almarai">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua
            </p>
          </>
        )}

        <div className="mt-5 flex gap-5">
          {[
            { img: gridImages[0], key: "glance_1" },
            { img: gridImages[1], key: "glance_2" },
            { img: gridImages[2], key: "glance_3" },
          ].map(({ img, key }) => (
            <div key={key} className="relative aspect-square flex-1">
              {/* biome-ignore lint/performance/noImgElement: next/image blocks localhost private IPs */}
              <img
                src={typeof img === "string" ? img : img.src}
                alt="Apex International Colleges"
                className="absolute inset-0 h-full w-full rounded-2xl object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative h-[320px] w-full lg:h-full">
        {/* biome-ignore lint/performance/noImgElement: next/image blocks localhost private IPs */}
        <img
          src={typeof mainImage === "string" ? mainImage : mainImage.src}
          alt="Apex International Colleges"
          className="absolute inset-0 h-full w-full rounded-2xl object-cover"
        />
      </div>
    </div>
  );
};

export default AboutGlance;
