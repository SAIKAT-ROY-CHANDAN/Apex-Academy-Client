import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import Image from "next/image";
import { getActiveCareerDevelopments } from "@/services/careerDevelopments";

type TCareerDevelopments = {
  id: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
};

const titleData = {
  subTitle: "Career Developments ",
  title: "View Our Career Developments Programs",
};

const Page = async () => {
  const response = await getActiveCareerDevelopments();
  const careerDevelopments: TCareerDevelopments[] = response?.data ?? [];
  return (
    <div className="mb-20">
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Career Developments "
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Career Developments" },
        ]}
      />

      <PageTitle titleData={titleData} />

      <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-0">
        {careerDevelopments.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              No career developments available.
            </p>
          </div>
        ) : (
          careerDevelopments?.map((item) => (
            <div key={item.id} className="relative rounded-2xl overflow-hidden">
              <Image
                src={item.imageUrl ?? "https://picsum.photos/seed/career/800/600"}
                alt={item.title}
                width={800}
                height={600}
                className="w-full object-cover"
              />
              <div className="absolute bottom-0 bg-gray-300/90 text-[#0F284E] p-6 w-full">
                <h3 className="font-bebas text-lg mb-1">{item.title}</h3>
                <p className="text-sm font-almarai">
                  {item.description ?? "No description available."}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Page;