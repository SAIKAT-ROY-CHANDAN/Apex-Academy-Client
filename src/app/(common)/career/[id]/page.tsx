// "use client";
import Image from "next/image";
import Link from "next/link";
import { CiCalendar } from "react-icons/ci";
import { FaRegMoneyBillAlt } from "react-icons/fa";
import { FaArrowRight } from "react-icons/fa6";
import { IoMdTimer } from "react-icons/io";
import { IoBagRemoveSharp } from "react-icons/io5";
import { TbCurrencyTaka } from "react-icons/tb";
import banner from "@/assets/heroBanner.webp";
import image1 from "@/assets/job-details/image.svg";
import ClientCoverPageBanner from "@/components/shared/client-cover-page-banner";
import { getWebsiteJobCircularById } from "@/services/websiteJobCircular";

const page = async ({ params }: { params: { id: string } }) => {
  const { id } = await params;
  const res = await getWebsiteJobCircularById(id);
  const { data } = res;
  console.log("data", res);
  return (
    <div className="">
      <ClientCoverPageBanner
        pageKey="career"
        fallbackBanner={banner}
        title="Job Details"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Career" },
          { label: "Job Details" },
        ]}
      />
      <div className="mb-12 mt-20 lg:max-w-4xl 2xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 items-center px-4 md:px-0">
        <div className="flex items-center gap-5 lg:col-span-3">
          <Image
            src={image1}
            alt="Apex International College"
            width={80}
            height={80}
          />
          <div>
            <h1 className="text-2xl font-bebas mb-2.5">{data?.positionName}</h1>
            <p className="bg-[#0F284E] px-3 py-2 text-white w-fit rounded-[4px] font-almarai">
              {data?.positionType}
            </p>
          </div>
        </div>

        <div className="lg:col-span-6">
          <h4 className="text-sm text-start mb-4 font-bebas">Job Overview</h4>
          <div className="flex flex-wrap items-start gap-6 sm:gap-8 font-almarai">
            <div className="flex flex-col gap-3 w-fit">
              <CiCalendar />
              <p className="text-[#767F8C] mt-2">Job posted:</p>
              <p className="text-sm">{data?.applyStartDate?.split("T")[0]}</p>
            </div>
            <div className="flex flex-col gap-3 w-fit">
              <IoMdTimer />
              <p className="text-[#767F8C] mt-2">Job expire in:</p>
              <p className="text-sm">{data?.applyEndDate?.split("T")[0]}</p>
            </div>
            <div className="flex flex-col gap-3 w-fit">
              <IoBagRemoveSharp />
              <p className="text-[#767F8C] mt-2">Education:</p>
              <p className="text-sm">{data?.educationalQualification}</p>
            </div>
            <div className="flex flex-col gap-3 w-fit">
              <FaRegMoneyBillAlt />
              <p className="text-[#767F8C] mt-2">Apply fee:</p>
              <p className="text-sm flex items-center text-[#18191C]">
                <TbCurrencyTaka className="text-xl" />
                {data?.applyFee}
              </p>
            </div>
          </div>
        </div>

        <Link
          href={`/career/apply?id=${id}`}
          className="flex gap-4 items-center justify-center bg-[#0F284E] py-4 px-8 w-full lg:w-fit lg:justify-start h-fit text-white rounded-lg md:col-span-2 lg:col-span-3 lg:justify-self-end font-almarai"
        >
          Apply Now <FaArrowRight />
        </Link>
      </div>

      <div className="mb-20 lg:max-w-4xl 2xl:max-w-6xl mx-auto px-4 md:px-0">
        <h5 className="text-xl mb-1 font-bebas">Description</h5>
        <div
          className="job-description"
          dangerouslySetInnerHTML={{ __html: data?.description || "" }}
        />
      </div>
    </div>
  );
};

export default page;
