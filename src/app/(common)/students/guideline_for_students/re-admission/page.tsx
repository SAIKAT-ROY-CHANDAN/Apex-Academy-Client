import banner from "@/assets/heroBanner.webp";
import AcademicNotice from "@/components/academicNotice/academicNotice";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";

const titleData = {
  subTitle: "Guideline for Students",
  title: "Admission & Re-admission",
};

const page = () => {
  return (
    <div className="mb-20">
      <CoverPageBanner pageKey="students"
        fallbackBanner={banner}
        title="Admission & Re-admission"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guideline for Student" },
          { label: "Admission & Re-Admission" },
        ]}
      />

      <PageTitle titleData={titleData} />
      <div className="mx-4 md:mx-0">
        <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto flex flex-col gap-3 bg-[#0F284E] p-5 md:p-14 rounded-2xl">
          {Array.from({ length: 9 }).map((_, index) => (
            <AcademicNotice key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default page;
