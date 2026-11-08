// Thin wrapper — delegates to shared public gallery tabs so Admin and Public stay in sync
import PublicMediaTabs from "@/components/shared/public-media-tabs";

type MediaRow = {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  captureDate: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
};

interface Props {
  photos: MediaRow[];
  videos: MediaRow[];
  previewLimit?: number;
  showViewMore?: boolean;
  sectionLabel?: string;
}

export default function AcademicProgramsTabs({
  photos,
  videos,
  previewLimit,
  sectionLabel = "Academic Programs",
}: Props) {
  return (
    <PublicMediaTabs
      photos={photos}
      videos={videos}
      previewLimit={previewLimit}
      sectionLabel={sectionLabel}
    />
  );
}
