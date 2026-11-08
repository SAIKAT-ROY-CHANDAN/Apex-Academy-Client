import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getAcademicSyllabusById } from "@/services/academicSyllabus";
import SyllabusForm from "../../_components/SyllabusForm";

export default async function EditSyllabusPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getAcademicSyllabusById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load syllabus:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Syllabus"
        backHref="/dashboard/website/syllabus"
      />
      <SyllabusForm initialData={initialData} />
    </div>
  );
}
