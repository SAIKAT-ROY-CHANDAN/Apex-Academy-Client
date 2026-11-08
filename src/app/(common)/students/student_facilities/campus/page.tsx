import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import FacilityDetailView from "../_components/FacilityDetailView";
import { getAcademicFacilityByType } from "@/services/academicFacilities";

const Page = async () => {
  let facility = null;
  try {
    const res = await getAcademicFacilityByType("CAMPUS");
    if (res?.success) facility = res.data;
  } catch (e) {
    console.error("Failed to load campus facility:", e);
  }

  const titleData = {
    subTitle: "Campus",
    title: facility?.name ? facility.name : "View Our Campus",
  };

  return (
    <div>
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Campus"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Campus" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <FacilityDetailView facility={facility} fallbackName="Our Campus" />
    </div>
  );
};

export default Page;
