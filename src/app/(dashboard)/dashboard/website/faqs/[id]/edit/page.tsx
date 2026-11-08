import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteFaqById } from "@/services/websiteFaq";
import FaqEditForm from "../../_components/FaqEditForm";

export default async function EditFaqPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = params.id;

  let initialData = null;

  try {
    const response = await getWebsiteFaqById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load FAQ:", error);
  }

  if (!initialData) {
    return (
      <div className="space-y-2">
        <PageHeader title="Edit FAQ" backHref="/dashboard/website/faqs" />
        <p className="py-10 text-center text-sm text-slate-500">
          FAQ not found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PageHeader title="Edit FAQ" backHref="/dashboard/website/faqs" />
      <FaqEditForm initialData={initialData} />
    </div>
  );
}
