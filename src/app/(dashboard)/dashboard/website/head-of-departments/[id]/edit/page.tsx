import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteHeadOfDepartmentById } from "@/services/websiteHeadOfDepartment";
import HodForm from "../../_components/HodForm";

export default async function EditHeadOfDepartmentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteHeadOfDepartmentById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load head of department:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Head of the Departments"
        backHref="/dashboard/website/head-of-departments"
      />
      <HodForm initialData={initialData} />
    </div>
  );
}
