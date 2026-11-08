import Image from "next/image";
import FaqSuggestions from "./faqAnswer";
import { TWebsiteFAQ } from "../../page";
import { getWebsiteFaqSection } from "@/services/websiteFaqSection";

interface FaqSectionProps {
  faqData: TWebsiteFAQ[];
}

const FaqSection = async ({ faqData }: FaqSectionProps) => {
  const faqRes = await getWebsiteFaqSection();
  const faqImg = Array.isArray(faqRes?.data?.imageUrl)
    ? faqRes?.data?.imageUrl[0]
    : faqRes?.data?.imageUrl;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 xl:max-w-4xl 2xl:max-w-6xl mx-auto px-4 my-24">
      <div className="rounded-2xl overflow-hidden">
        <div className="relative overflow-hidden rounded-2xl h-[550px]">
          {faqImg && (
            <Image
              src={faqImg}
              alt="Apex International Colleges"
              fill
              className="object-cover"
              unoptimized
            />
          )}
        </div>
      </div>
      <div>
        <p className="text-[#E6A61E] text-sm font-semibold mb-4 text-center md:text-start font-almarai">
          FAQ
        </p>
        <h2 className="text-[#0F284E] text-4xl lg:text-5xl leading-10 lg:leading-14 uppercase mb-6 text-center md:text-start font-bebas">
          Everything You Need to Know
        </h2>
        <p className="text-[18px] text-white bg-[#0F284E] py-5 px-4 rounded-[12px] mb-8 font-almarai">
          What curriculum does the school follow?
        </p>
        <p className="text-[#404040] mb-5 font-almarai">
          We follow the National Curriculum of Bangladesh, enriched with modern
          teaching methods and digital learning.
        </p>
        <FaqSuggestions faqData={faqData} />
      </div>
    </div>
  );
};

export default FaqSection;
