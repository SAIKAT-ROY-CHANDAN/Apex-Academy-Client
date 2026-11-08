import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import FacilityDetailView from "../_components/FacilityDetailView";
import { getAcademicFacilityByType } from "@/services/academicFacilities";

const Page = async () => {
  let facility = null;
  try {
    const res = await getAcademicFacilityByType("STUDENT_CLUB");
    if (res?.success) facility = res.data;
  } catch (e) {
    console.error("Failed to load student club facility:", e);
  }

  const titleData = {
    subTitle: "Student Club",
    title: facility?.name ? facility.name : "View Our Student Club Details",
  };

  return (
    <div>
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Student Club"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Student Club" },
        ]}
      />
      <PageTitle titleData={titleData} />
      <FacilityDetailView
        facility={facility}
        fallbackName="Our Student Club Details"
      />
    </div>
  );
};

export default Page;
