import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getWebsiteGalleryImageById } from "@/services/websiteGalleryImage";
import GalleryImageForm from "../../_components/GalleryImageForm";

export default async function EditGalleryPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;

  let initialData = null;

  try {
    const response = await getWebsiteGalleryImageById(id);
    initialData = response?.data ?? null;
  } catch (error) {
    console.error("Failed to load gallery item:", error);
  }

  if (!initialData) {
    notFound();
  }

  return (
    <div className="space-y-2">
      <PageHeader
        title="Edit Gallery Item"
        backHref="/dashboard/website/gallery"
      />
      <GalleryImageForm initialData={initialData} />
    </div>
  );
}
