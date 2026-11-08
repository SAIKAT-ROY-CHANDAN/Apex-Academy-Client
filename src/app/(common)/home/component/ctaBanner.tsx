import banner from "@/assets/home/middleBanner.webp";
import Image from "next/image";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";
import { TWebsiteCTA } from "../../page";

const BottomBanner = ({ctaData}: {ctaData: TWebsiteCTA}) => {
  return (
    <div className="relative rounded-2xl overflow-hidden mt-24 mx-4 min-h-[500px]">
      <Image
        src={banner}
        alt="Apex International Colleges"
        className="rounded-2xl w-full h-full object-cover absolute inset-0"
        height={500}
        width={500}
      />
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative z-10 p-7 grid grid-cols-1 lg:grid-cols-2 max-w-6xl mx-auto py-10 lg:py-20 gap-6 lg:gap-0 min-h-[500px]">
        <div className="flex flex-col justify-center lg:justify-between gap-4 lg:gap-0">
          <h2 className="text-white text-4xl lg:text-5xl leading-10 uppercase text-center lg:text-start font-bebas">
            {ctaData?.heading}
          </h2>
          <p className="text-white uppercase text-center leading-7 lg:text-start font-almarai">
            {ctaData?.subHeading}
          </p>
        </div>
        <div className="flex flex-col justify-center lg:justify-end items-center lg:items-end">
          <Link
            href="/online_admission"
            className="bg-[#F59E0B] py-2.5 px-4 rounded-full flex items-center gap-2.5 font-bold text-[#0F284E] uppercase w-fit mx-auto md:mx-0 font-almarai"
          >
            Online Admission
            <FaAngleRight className="w-7 h-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BottomBanner;
