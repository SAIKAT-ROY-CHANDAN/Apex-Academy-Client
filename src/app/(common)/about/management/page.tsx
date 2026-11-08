import banner from "@/assets/heroBanner.webp";
import Image from "next/image";
import { FaArrowRight } from "react-icons/fa6";
import ManagementTeam from "./components/managementTeam";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAllWebsiteHeadOfDepartments } from "@/services/websiteHeadOfDepartment";

type Head = {
  name: string;
  designation: string;
  departmentName: string;
  imageUrl: string;
};

const titleData = {
  subTitle: "Management",
  title: "Meet Our Management Team",
};

const managementPageTitle = {
  subTitle: "Management",
  title: "Meet Our Head Of The Departments",
};

const page = async () => {
  const res = await getAllWebsiteHeadOfDepartments();
  const { data } = res;
  return (
    <div>
      <CoverPageBanner pageKey="managementTeam"
        fallbackBanner={banner}
        title="Management Team"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Management Team" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <div className="grid grid-cols-2 sm:grid-cols-2 xl:max-w-4xl 2xl:max-w-6xl mx-auto gap-6 px-4 md:px-0">
        {data?.slice(0, 2).map((item: Head, index: number) => (
          <div
            key={index}
            className="group relative aspect-4/3 overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-[#4a2545] focus-within:ring-offset-2"
          >
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            />

            {/* Bottom gradient for text legibility */}
            <div className="absolute inset-x-0 bottom-0 h-2/3 bg-linear-to-t from-black/85 via-black/40 to-transparent" />

            {/* Text overlay */}
            <div className="absolute inset-x-0 bottom-0 p-5 text-center">
              <h3 className="text-white text-lg uppercase tracking-wide font-bebas">
                {item.name}
              </h3>
              <p className="text-white/75 text-xs mt-1 font-almarai">
                {item.designation}
              </p>
              <p className="text-white text-sm font-semibold mt-0.5 font-almarai">
                {item.departmentName}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-20">
        <ManagementTeam titleData={managementPageTitle} teamData={data} />
      </div>
    </div>
  );
};

export default page;
