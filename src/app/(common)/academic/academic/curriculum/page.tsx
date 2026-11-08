import banner from "@/assets/heroBanner.webp";
import AcademicNotice from "@/components/academicNotice/academicNotice";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAllWebsiteCurriculums } from "@/services/websiteCurriculum";

const titleData = {
  subTitle: "Academic Programs",
  title: "View our Latest Academic Programs",
};

type TNotice = {
  id: string;
  title: string;
  fileUrl: string;
  createdAt: string;
};

const page = async () => {
  const res = await getAllWebsiteCurriculums();
  const curriculumData: TNotice[] = res?.data || [];
  return (
    <div className="">
      <CoverPageBanner
        pageKey="academic"
        fallbackBanner={banner}
        title="Curriculum"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Curriculum" },
        ]}
      />
      <div className="text-center mb-12 mt-20">
        <PageTitle titleData={titleData} />
      </div>
      <div className="px-4 md:px-0 mb-20">
        <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto bg-[#0F284E] p-5 md:p-8 lg:p-10 rounded-2xl">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
            {curriculumData.map((item) => (
              <AcademicNotice
                key={item.id}
                title={item?.title}
                createdAt={item?.createdAt}
                syllabusUrl={item?.fileUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default page;
