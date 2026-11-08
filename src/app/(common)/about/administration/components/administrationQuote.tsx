import Image from "next/image";
import image1 from "@/assets/Administration/iamge1.jpg";
import image2 from "@/assets/Administration/image2.jpg";
import { FaAngleRight } from "react-icons/fa6";
import { getWebsitePrincipalMessage } from "@/services/websitePrincipalMessage";
import { getWebsiteChairmanMessage } from "@/services/websiteChairmanMessage";

const AdministrationQuote = async () => {
  let principalData = null;
  try {
    const response = await getWebsitePrincipalMessage();
    principalData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load principal message:", error);
  }

  let chairmanData = null;
  try {
    const response = await getWebsiteChairmanMessage();
    chairmanData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load chairman message:", error);
  }
  const chairmanImageUrl = chairmanData?.imageUrl;

  const principalImageUrl = principalData?.imageUrl;

  return (
    <div className="mx-auto xl:max-w-4xl 2xl:max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-2 mt-20 lg-32 px-4">
      <div className="relative h-full min-h-[400px] w-full order-2 md:order-1">
        <Image
          src={principalImageUrl}
          alt="Apex International Colleges"
          fill
          className="rounded-2xl object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
          unoptimized
        />
      </div>

      <div className="h-full rounded-2xl bg-[#0F284E] p-8 md:p-14 order-1 md:order-2">
        <h1 className="mb-4 text-sm text-[#E6A61E] font-almarai font-semibold">
          QUOTE
        </h1>
        <h2 className="mb-3 text-4xl uppercase text-white font-bebas">
          {principalData?.name}
        </h2>
        <div
          className="bg-romove-message"
          dangerouslySetInnerHTML={{ __html: principalData?.message || "" }}
        />
        <button className="flex w-fit items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold uppercase text-[#0F284E] md:mx-0 font-almarai mt-5">
          READ MORE
          <FaAngleRight className="h-7 w-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
        </button>
      </div>

      <div className="h-full rounded-2xl bg-[#0F284E] p-8 md:p-14 order-3">
        <h1 className="mb-4 text-sm font-semibold text-[#E6A61E] font-almarai">
          QUOTE
        </h1>
        <h2 className="mb-3 text-4xl uppercase text-white font-bebas">
          {chairmanData?.name}
        </h2>
        <div
          className="bg-romove-message"
          dangerouslySetInnerHTML={{ __html: chairmanData?.message || "" }}
        />
        <button className="flex w-fit items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold uppercase text-[#0F284E] md:mx-0 font-almarai mt-5">
          READ MORE
          <FaAngleRight className="h-7 w-7 rounded-full bg-[#0F284E] text-[#F59E0B]" />
        </button>
      </div>

      <div className="relative h-full min-h-[400px] w-full order-4">
        <Image
          src={chairmanImageUrl}
          alt="Apex International Colleges"
          fill
          className="rounded-2xl object-cover "
          sizes="(max-width: 688px) 100vw, 50vw"
          unoptimized
        />
      </div>
    </div>
  );
};

export default AdministrationQuote;
