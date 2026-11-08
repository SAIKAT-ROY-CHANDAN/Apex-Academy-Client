import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteCurriculumById } from "@/services/websiteCurriculum";
import CurriculumForm from "../../_components/CurriculumForm";

export default async function EditCurriculumPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteCurriculumById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load curriculum:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Curriculum"
        backHref="/dashboard/website/curriculum"
      />
      <CurriculumForm initialData={initialData} />
    </div>
  );
}
