import Image from "next/image";
import banner from "@/assets/heroBanner.webp";
import { FaAngleRight } from "react-icons/fa6";
import image1 from "@/assets/Academic/image2.jpg";
import { PageTitle } from "@/components/shared/page-title";
import Link from "next/link";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAllWebsiteDepartments } from "@/services/websiteDepartment";

const titleData = {
  subTitle: "Departments",
  title: "Study With Our Exceptional Departments",
};

export interface IDepartment {
  id: string;
  name: string;
  imageUrl: string;
  details: string;
  courseList: [];
}

const page = async () => {
  const res = await getAllWebsiteDepartments();
  const departmentData: IDepartment[] = res?.data || [];

  return (
    <div className="mb-20">
      <CoverPageBanner
        pageKey="academic"
        fallbackBanner={banner}
        title="Departments"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Academic Bodies" },
          { label: "Departments" },
        ]}
      />

      <div className="text-center mb-12 mt-20 max-w-6xl mx-auto">
        <PageTitle titleData={titleData} />
      </div>

      <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
        {departmentData.map((item) => (
          <div className="bg-[#0F284E] p-6 rounded-2xl grid grid-cols-2 gap-8 justify-between">
            <div className="flex flex-col justify-around">
              <h2 className="text-2xl md:text-xl text-white font-bebas">
                {item?.name}
              </h2>
              <Link
                key={item.id}
                href={`/academic/academic_bodies/departments/${item.id}`}
                className="text-xs flex w-fit items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold uppercase text-[#0F284E] md:mx-0 font-almarai"
              >
                READ MORE
                <FaAngleRight className="h-4 w-4 rounded-full bg-[#0F284E] text-[#F59E0B]" />
              </Link>
            </div>
            <Image
              src={item?.imageUrl}
              alt=""
              width={250}
              height={150}
              className="rounded-2xl h-full"
              unoptimized
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default page;
