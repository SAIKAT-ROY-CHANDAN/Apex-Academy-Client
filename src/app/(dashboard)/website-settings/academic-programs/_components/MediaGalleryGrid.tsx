// Re-export shared gallery grid — keep legacy import path working after refactor.
// New code should import from @/app/(dashboard)/website-settings/_components/MediaGalleryGrid
export { default } from "@/app/(dashboard)/website-settings/_components/MediaGalleryGrid";
export type { MediaGalleryItem } from "@/app/(dashboard)/website-settings/_components/MediaGalleryGrid";
