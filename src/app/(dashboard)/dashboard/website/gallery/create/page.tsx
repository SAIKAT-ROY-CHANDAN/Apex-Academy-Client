import { PageHeader } from "@/components/shared/page-header";
import GalleryImageForm from "../_components/GalleryImageForm";

export default function CreateGalleryPage() {
  return (
    <div className="space-y-2">
      <PageHeader
        title="Add Gallery Item"
        backHref="/dashboard/website/gallery"
      />
      <GalleryImageForm />
    </div>
  );
}
