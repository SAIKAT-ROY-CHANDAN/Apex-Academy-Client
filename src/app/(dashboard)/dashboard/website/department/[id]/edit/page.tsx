import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteDepartmentById } from "@/services/websiteDepartment";
import DepartmentForm from "../../_components/DepartmentForm";

export default async function EditDepartmentPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteDepartmentById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load department:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader title="Department" backHref="/dashboard/website/department" />
      <DepartmentForm initialData={initialData} />
    </div>
  );
}
