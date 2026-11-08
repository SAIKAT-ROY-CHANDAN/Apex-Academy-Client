import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicTuitionById } from "@/services/academicTuition";
import TuitionForm from "../../_components/TuitionForm";

export default async function EditTuitionPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getAcademicTuitionById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load tuition:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Tuition"
        backHref="/dashboard/website/tuition-fees"
      />
      <TuitionForm initialData={initialData} />
    </div>
  );
}
