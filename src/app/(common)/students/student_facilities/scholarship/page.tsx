import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import FacilityDetailView from "../_components/FacilityDetailView";
import { getAcademicFacilityByType } from "@/services/academicFacilities";

const Page = async () => {
  let facility = null;
  try {
    const res = await getAcademicFacilityByType("SCHOLARSHIP");
    if (res?.success) facility = res.data;
  } catch (e) {
    console.error("Failed to load scholarship facility:", e);
  }

  const titleData = {
    subTitle: "Scholarship",
    title: facility?.name ? facility.name : "View Our Scholarship",
  };

  return (
    <div>
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Scholarship"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Scholarship" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <FacilityDetailView
        facility={facility}
        fallbackName="Our Scholarship Details"
      />
    </div>
  );
};

export default Page;
