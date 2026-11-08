import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import FacilityDetailView from "../_components/FacilityDetailView";
import { getAcademicFacilityByType } from "@/services/academicFacilities";

const Page = async () => {
  let facility = null;
  try {
    const res = await getAcademicFacilityByType("LIBRARY");
    if (res?.success) facility = res.data;
  } catch (e) {
    console.error("Failed to load library facility:", e);
  }

  const titleData = {
    subTitle: "Library",
    title: facility?.name ? facility.name : "View Our Library",
  };

  return (
    <div>
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Library"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Library" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <FacilityDetailView facility={facility} fallbackName="Library Details" />
    </div>
  );
};

export default Page;
