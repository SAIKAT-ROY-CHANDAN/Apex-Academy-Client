import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsitePrincipalById } from "@/services/websitePrincipal";
import PrincipalForm from "../_components/PrincipalForm";

export default async function PrincipalDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  // Support /new as id -> show create form (spec says [id]/page.tsx handles add/edit)
  if (id === "new" || id === "create") {
    return (
      <div className="space-y-2">
        <PageHeader
          title="List of Our Principals"
          backHref="/dashboard/website/principals"
        />
        <PrincipalForm />
      </div>
    );
  }

  let initialData = null;

  try {
    const response = await getWebsitePrincipalById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load principal:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="List of Our Principals"
        backHref="/dashboard/website/principals"
      />
      <PrincipalForm initialData={initialData} />
    </div>
  );
}
