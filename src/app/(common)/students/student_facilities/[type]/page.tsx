import banner from "@/assets/heroBanner.webp";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import FacilityDetailView from "../_components/FacilityDetailView";
import { getAcademicFacilityByType } from "@/services/academicFacilities";
import { notFound } from "next/navigation";

const TYPE_MAP: Record<string, { enumValue: string; label: string; fallbackName: string }> = {
  campus: { enumValue: "CAMPUS", label: "Campus", fallbackName: "Our Campus" },
  scholarship: { enumValue: "SCHOLARSHIP", label: "Scholarship", fallbackName: "Our Scholarship Details" },
  library: { enumValue: "LIBRARY", label: "Library", fallbackName: "Library Details" },
  student_club: { enumValue: "STUDENT_CLUB", label: "Student Club", fallbackName: "Our Student Club Details" },
  "student-club": { enumValue: "STUDENT_CLUB", label: "Student Club", fallbackName: "Our Student Club Details" },
};

export async function generateStaticParams() {
  return Object.keys(TYPE_MAP).map((type) => ({ type }));
}

type Props = {
  params: Promise<{ type: string }>;
};

const Page = async ({ params }: Props) => {
  const { type } = await params;
  const key = type.toLowerCase();
  const config = TYPE_MAP[key];

  if (!config) notFound();

  let facility = null;
  try {
    const res = await getAcademicFacilityByType(config.enumValue);
    if (res?.success) facility = res.data;
  } catch (e) {
    console.error(`Failed to load facility for ${config.enumValue}:`, e);
  }

  const titleData = {
    subTitle: config.label,
    title: facility?.name ? facility.name : `View Our ${config.label}`,
  };

  return (
    <div>
      <CoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title={config.label}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: config.label },
        ]}
      />
      <PageTitle titleData={titleData} />
      <FacilityDetailView facility={facility} fallbackName={config.fallbackName} />
    </div>
  );
};

export default Page;
