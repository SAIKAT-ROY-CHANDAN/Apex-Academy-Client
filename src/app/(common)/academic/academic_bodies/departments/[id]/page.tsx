import Image from "next/image";
import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { getWebsiteDepartmentById } from "@/services/websiteDepartment";
import { IDepartment } from "../page";

interface PageProps {
  params: Promise<{ deptId: string }>;
}

const Page = async ({ params }: PageProps) => {
  const { deptId } = await params;
  const res = await getWebsiteDepartmentById(deptId);
  const departmentdata: IDepartment | null = res?.data ?? null;

  // guard clause — data না পেলে fallback UI দেখাও
  if (!departmentdata) {
    return (
      <div className="mb-28 text-center py-20">
        <p className="text-xl font-almarai">
          Department information not found.
        </p>
      </div>
    );
  }

  const titleData = {
    subTitle: "Departments Details",
    title: departmentdata.name,
  };

  return (
    <div className="mb-28">
      <CoverPageBanner
        pageKey="academic"
        fallbackBanner={banner}
        title={departmentdata.name}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Academic Bodies" },
          { label: "Departments" },
          { label: departmentdata.name },
        ]}
      />
      <PageTitle titleData={titleData} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:max-w-4xl 2xl:max-w-6xl mx-auto px-4 md:px-0">
        <div>
          <Image
            src={departmentdata.imageUrl}
            alt={departmentdata.name}
            width={550}
            height={400}
            className="rounded-2xl mb-6 w-full"
            unoptimized
          />
          <div>
            <h4 className="text-xl font-bebas mb-2">Course List:</h4>
            <ul className="flex flex-col gap-2 list-disc list-inside marker:text-[#5C1A3B] font-almarai">
              {departmentdata.courseList?.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <h1 className="text-[#0F284E] text-3xl uppercase mb-2 font-semibold text-center md:text-start font-bebas">
            About The Course
          </h1>
          <div
            className="font-almarai prose max-w-none"
            dangerouslySetInnerHTML={{ __html: departmentdata.details }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
