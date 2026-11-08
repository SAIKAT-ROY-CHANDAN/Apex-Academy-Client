import { PageTitle, TTitle } from "@/components/shared/page-title";
import Image from "next/image";
import Link from "next/link";
import { FaAngleRight } from "react-icons/fa6";

type Head = {
  name: string;
  designation: string;
  departmentName: string;
  imageUrl: string;
};

type dataProps = {
  titleData: TTitle;
  teamData?: Head[];
  governingBodyData?: Head[];
};

const ManagementTeam = ({ titleData, teamData, governingBodyData }: dataProps) => {
  const list = teamData ?? governingBodyData ?? [];
  return (
    <section className="bg-white px-4 md:px-0 ">
      <div className="mx-auto xl:max-w-4xl 2xl:max-w-6xl">
        <PageTitle titleData={titleData} />
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-6">
          {list?.map((item, index) => (
            <div
              key={index}
              className="group relative aspect-4/4 overflow-hidden rounded-xl focus-within:ring-2 focus-within:ring-[#4a2545] focus-within:ring-offset-2"
            >
              <Image
                src={item?.imageUrl}
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
                  {item?.name}
                </h3>
                <p className="text-white/75 text-xs font-almarai">
                  {item?.designation}
                </p>
                <p className="text-white text-sm mt-0.5 font-bebas">
                  {item?.departmentName}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center mt-10">
          <Link
            href="/"
            className="mx-auto md:w-fit h-fit flex justify-center items-center gap-2.5 rounded-full bg-[#F59E0B] px-4 py-2.5 font-bold uppercase text-[#0F284E] text-sm md:mx-0 w-fit font-almarai"
          >
            View More
            <FaAngleRight className="h-5 w-5 rounded-full bg-[#0F284E] text-[#F59E0B]" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ManagementTeam;
