// Thin compat wrapper — reuses the generic gallery component with Academic Programs config.
// This keeps the inline logic deduplicated while preserving the existing import path.

import GallerySectionSettings, {
  type GalleryMediaRow,
} from "@/app/(dashboard)/website-settings/_components/GallerySectionSettings";

export type AcademicProgramMediaRow = GalleryMediaRow;

interface AcademicProgramsSettingsProps {
  initialPhotos?: AcademicProgramMediaRow[];
  initialVideos?: AcademicProgramMediaRow[];
  maxSizeMb?: number;
}

const ACADEMIC_PROGRAMS_CONFIG = {
  section: "academic-programs",
  label: "Academic Programs",
} as const;

export default function AcademicProgramsSettings({
  initialPhotos = [],
  initialVideos = [],
  maxSizeMb = 10,
}: AcademicProgramsSettingsProps) {
  return (
    <GallerySectionSettings
      config={ACADEMIC_PROGRAMS_CONFIG}
      initialPhotos={initialPhotos}
      initialVideos={initialVideos}
      maxSizeMb={maxSizeMb}
    />
  );
}
