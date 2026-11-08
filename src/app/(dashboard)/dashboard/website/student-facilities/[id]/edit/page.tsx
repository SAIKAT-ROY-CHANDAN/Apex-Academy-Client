import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicFacilitiesById } from "@/services/academicFacilities";
import FacilitiesForm from "../../_components/FacilitiesForm";

export default async function EditFacilitiesPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getAcademicFacilitiesById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load facility:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Facility"
        backHref="/dashboard/website/student-facilities"
      />
      <FacilitiesForm initialData={initialData} />
    </div>
  );
}
