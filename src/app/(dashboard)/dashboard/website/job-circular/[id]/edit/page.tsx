import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteJobCircularById } from "@/services/websiteJobCircular";
import JobCircularForm from "../../_components/JobCircularForm";

export default async function EditJobCircularPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteJobCircularById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load job circular:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Post A Job"
        backHref="/dashboard/website/job-circular"
      />
      <JobCircularForm initialData={initialData} />
    </div>
  );
}
