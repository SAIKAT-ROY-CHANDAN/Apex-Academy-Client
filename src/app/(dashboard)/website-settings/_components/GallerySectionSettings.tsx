"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { format, parse } from "date-fns";
import SingleImageDropzone from "@/components/shared/single-image-dropzone";
import DateField from "@/components/shared/date-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  createWebsiteSectionMedia,
  deleteWebsiteSectionMedia,
} from "@/services/websiteSectionMedia";
import MediaGalleryGrid, { MediaGalleryItem } from "./MediaGalleryGrid";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "photos" | "videos";

export interface GalleryMediaRow {
  id: string;
  type: "PHOTO" | "VIDEO";
  title: string;
  captureDate: string;
  fileUrl?: string | null;
  videoUrl?: string | null;
  createdAt: string;
  section?: string;
}

export interface GallerySectionConfig {
  /** kebab-case section key used for API: e.g. "academic-programs" or "co-curriculum-activities" */
  section: string;
  /** Human label used in header + breadcrumb: e.g. "Academic Programs" */
  label: string;
  /** Optional extra CSS class for header? */
  maxSizeMb?: number;
}

interface GallerySectionSettingsProps {
  config: GallerySectionConfig;
  initialPhotos?: GalleryMediaRow[];
  initialVideos?: GalleryMediaRow[];
  maxSizeMb?: number;
}

// Helpers: DD-MM-YYYY <-> ISO (yyyy-MM-dd)
function isoToDisplay(_iso: string | undefined | null): string {
  // keep for potential future use; currently unused but preserved for parity
  return "";
}

function displayToIso(display: string): string {
  if (!display) return "";
  try {
    const parsed = parse(display, "dd-MM-yyyy", new Date());
    if (!isNaN(parsed.getTime())) return format(parsed, "yyyy-MM-dd");
  } catch {}
  const d = new Date(display);
  if (!isNaN(d.getTime())) return format(d, "yyyy-MM-dd");
  return display;
}

function formatDateLabel(iso: string): string {
  try {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return format(d, "MMM dd, yyyy");
  } catch {
    return iso;
  }
}

function toUpperCaps(title: string): string {
  return title.toUpperCase();
}

function getVideoThumbnailFallback(videoUrl?: string | null): string {
  if (!videoUrl) return "/placeholder.svg";
  try {
    const url = new URL(videoUrl);
    const host = url.hostname.replace("www.", "");
    if (host.includes("youtube.com") || host === "youtu.be") {
      let videoId: string | null = null;
      if (host === "youtu.be") videoId = url.pathname.slice(1).split("/")[0] ?? null;
      else videoId = url.searchParams.get("v");
      if (videoId) return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return "/placeholder.svg";
  } catch {
    return "/placeholder.svg";
  }
}

// ---------------------------------------------------------------------------
// Generic Gallery Component
// ---------------------------------------------------------------------------

export default function GallerySectionSettings({
  config,
  initialPhotos = [],
  initialVideos = [],
  maxSizeMb = 10,
}: GallerySectionSettingsProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("photos");
  const [isPending, startTransition] = useTransition();

  // Photos form state
  const [photoTitle, setPhotoTitle] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoResetKey, setPhotoResetKey] = useState(0);

  // Videos form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDate, setVideoDate] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoResetKey, setVideoResetKey] = useState(0);

  // Grid data — seeded from server, kept in local state for optimistic delete
  const [photos, setPhotos] = useState<GalleryMediaRow[]>(initialPhotos);
  const [videos, setVideos] = useState<GalleryMediaRow[]>(initialVideos);

  const [deleteTarget, setDeleteTarget] = useState<GalleryMediaRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Keep photo preview as object URL
  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(null);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  // Sync when server data changes (after router.refresh)
  useEffect(() => {
    setPhotos(initialPhotos);
  }, [initialPhotos]);
  useEffect(() => {
    setVideos(initialVideos);
  }, [initialVideos]);

  const isPhotosTab = activeTab === "photos";

  const headerTitle = isPhotosTab
    ? `${config.label} (Images)`
    : `${config.label} (Videos)`;

  // Validation
  const photoValidationError = useMemo(() => {
    if (!photoTitle.trim()) return "Image Title is required";
    if (!photoDate.trim()) return "Capture Date is required";
    const iso = displayToIso(photoDate);
    if (isNaN(new Date(iso).getTime())) return "Capture Date is invalid (use DD-MM-YYYY)";
    if (!photoFile) return "Please upload an image";
    return null;
  }, [photoTitle, photoDate, photoFile]);

  const videoValidationError = useMemo(() => {
    if (!videoTitle.trim()) return "Video Title is required";
    if (!videoDate.trim()) return "Capture Date is required";
    const iso = displayToIso(videoDate);
    if (isNaN(new Date(iso).getTime())) return "Capture Date is invalid (use DD-MM-YYYY)";
    if (!videoUrl.trim()) return "Feature Video URL is required";
    try {
      new URL(videoUrl);
    } catch {
      return "Feature Video URL must be a valid URL";
    }
    return null;
  }, [videoTitle, videoDate, videoUrl]);

  const isPhotoSaveDisabled = Boolean(photoValidationError) || isPending;
  const isVideoSaveDisabled = Boolean(videoValidationError) || isPending;

  const clearPhotoForm = useCallback(() => {
    setPhotoTitle("");
    setPhotoDate("");
    setPhotoFile(null);
    setPhotoPreview(null);
    setPhotoError(null);
    setPhotoResetKey((k) => k + 1);
  }, []);

  const clearVideoForm = useCallback(() => {
    setVideoTitle("");
    setVideoDate("");
    setVideoUrl("");
    setVideoError(null);
    setVideoResetKey((k) => k + 1);
  }, []);

  // Reset clears only the entered form data, does NOT delete saved gallery items
  const handleBulkResetConfirm = useCallback(() => {
    if (isPhotosTab) clearPhotoForm();
    else clearVideoForm();
    toast.success("Form cleared");
    setShowResetConfirm(false);
  }, [isPhotosTab, clearPhotoForm, clearVideoForm]);

  const handlePhotoSave = useCallback(() => {
    const err = photoValidationError;
    if (err) {
      setPhotoError(err);
      toast.error(err);
      return;
    }
    setPhotoError(null);
    const formData = new FormData();
    formData.append("section", config.section);
    formData.append("type", "PHOTO");
    formData.append("title", photoTitle.trim());
    formData.append("captureDate", displayToIso(photoDate));
    if (photoFile) formData.append("academic_program_image", photoFile);

    startTransition(async () => {
      const res = await createWebsiteSectionMedia(formData);
      if (res?.success) {
        toast.success("Photo added successfully");
        clearPhotoForm();
        router.refresh();
      } else {
        const msg = res?.message ?? "Failed to save photo";
        setPhotoError(msg);
        toast.error(msg);
      }
    });
  }, [photoValidationError, config.section, photoTitle, photoDate, photoFile, clearPhotoForm, router]);

  const handleVideoSave = useCallback(() => {
    const err = videoValidationError;
    if (err) {
      setVideoError(err);
      toast.error(err);
      return;
    }
    setVideoError(null);
    const formData = new FormData();
    formData.append("section", config.section);
    formData.append("type", "VIDEO");
    formData.append("title", videoTitle.trim());
    formData.append("captureDate", displayToIso(videoDate));
    formData.append("videoUrl", videoUrl.trim());

    startTransition(async () => {
      const res = await createWebsiteSectionMedia(formData);
      if (res?.success) {
        toast.success("Video added successfully");
        clearVideoForm();
        router.refresh();
      } else {
        const msg = res?.message ?? "Failed to save video";
        setVideoError(msg);
        toast.error(msg);
      }
    });
  }, [videoValidationError, config.section, videoTitle, videoDate, videoUrl, clearVideoForm, router]);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await deleteWebsiteSectionMedia(deleteTarget.id);
      if (res?.success) {
        toast.success("Media deleted successfully");
        if (deleteTarget.type === "PHOTO") {
          setPhotos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        } else {
          setVideos((prev) => prev.filter((p) => p.id !== deleteTarget.id));
        }
        setDeleteTarget(null);
        router.refresh();
      } else {
        toast.error(res?.message ?? "Failed to delete");
      }
    } catch {
      toast.error("Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  }, [deleteTarget, router]);

  const photoItems: MediaGalleryItem[] = useMemo(
    () =>
      photos.map((r) => ({
        id: r.id,
        thumbnailUrl: r.fileUrl ?? "",
        title: toUpperCaps(r.title),
        dateLabel: formatDateLabel(r.captureDate),
      })),
    [photos]
  );

  const videoItems: MediaGalleryItem[] = useMemo(
    () =>
      videos.map((r) => ({
        id: r.id,
        thumbnailUrl: r.fileUrl ?? getVideoThumbnailFallback(r.videoUrl),
        title: toUpperCaps(r.title),
        dateLabel: formatDateLabel(r.captureDate),
      })),
    [videos]
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Header — title changes with tab, breadcrumb static, Back outlined blue pill */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">{headerTitle}</h1>
          <nav aria-label="Breadcrumb" className="mt-1 text-[15px] text-slate-400">
            <ol className="flex items-center gap-2">
              <li>Overview</li>
              <li aria-hidden="true">&rsaquo;</li>
              <li>Website Settings</li>
              <li aria-hidden="true">&rsaquo;</li>
              <li className="text-blue-600">{config.label}</li>
            </ol>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white px-5 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>
      </div>

      {/* Segmented control — centered, pill-shaped */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-full bg-slate-100 p-1.5">
          <button
            type="button"
            onClick={() => setActiveTab("photos")}
            className={[
              "rounded-full px-8 py-2.5 text-sm font-semibold transition-colors",
              isPhotosTab
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Photos
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={[
              "rounded-full px-8 py-2.5 text-sm font-semibold transition-colors",
              !isPhotosTab
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-transparent text-slate-600 hover:text-slate-900",
            ].join(" ")}
          >
            Videos
          </button>
        </div>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {isPhotosTab ? (
          <div className="space-y-5">
            {photoError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {photoError}
              </div>
            )}

            {/* Image Title + Capture Date — 2-col row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Image Title
                </Label>
                <Input
                  value={photoTitle}
                  onChange={(e) => setPhotoTitle(e.target.value)}
                  placeholder="Write here..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
              <DateField key={`photo-date-${photoResetKey}`} label="Capture Date" value={photoDate} onChange={setPhotoDate} />
            </div>

            <SingleImageDropzone
              key={`photo-dropzone-${photoResetKey}`}
              label="Gallery image"
              previewSrc={photoPreview}
              hasPending={Boolean(photoFile)}
              uploadLabel="Upload Image for Gallery"
              maxSizeMb={maxSizeMb}
              showRemoveButton={true}
              onChange={(nextFile) => {
                setPhotoError(null);
                setPhotoFile(nextFile);
                if (!nextFile) setPhotoPreview(null);
              }}
              onError={setPhotoError}
            />

            {/* Reset/Save — full width side by side */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={isPending || isResetting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white px-6 py-3.5 text-[15px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white">
                  <Plus className="h-3.5 w-3.5 rotate-45" strokeWidth={3} />
                </span>
                {isResetting ? "Resetting..." : "Reset"}
              </button>
              <button
                type="button"
                onClick={handlePhotoSave}
                disabled={isPhotoSaveDisabled}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
                  <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {videoError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
              >
                {videoError}
              </div>
            )}

            {/* Video Title + Capture Date — 2-col row */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-sm font-semibold text-slate-700">
                  Video Title
                </Label>
                <Input
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                  placeholder="Write here..."
                  className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
              <DateField key={`video-date-${videoResetKey}`} label="Capture Date" value={videoDate} onChange={setVideoDate} />
            </div>

            {/* Feature Video URL — below */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold text-slate-700">
                Feature Video URL
              </Label>
              <Input
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="URL"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
              />
            </div>

            {/* Reset/Save */}
            <div className="flex flex-col gap-4 sm:flex-row">
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                disabled={isPending || isResetting}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white px-6 py-3.5 text-[15px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white">
                  <Plus className="h-3.5 w-3.5 rotate-45" strokeWidth={3} />
                </span>
                {isResetting ? "Resetting..." : "Reset"}
              </button>
              <button
                type="button"
                onClick={handleVideoSave}
                disabled={isVideoSaveDisabled}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
                  <Plus className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
                {isPending ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Grid of existing media — below the form */}
      <div className="mt-8">
        <MediaGalleryGrid
          items={isPhotosTab ? photoItems : videoItems}
          onRemove={(id) => {
            const target = isPhotosTab
              ? photos.find((p) => p.id === id) ?? null
              : videos.find((v) => v.id === id) ?? null;
            if (target) setDeleteTarget(target);
          }}
        />
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete media?"
        description={
          deleteTarget
            ? `This will permanently remove "${deleteTarget.title}" from the ${deleteTarget.type === "PHOTO" ? "Photos" : "Videos"} gallery. This cannot be undone.`
            : "This will permanently remove this item. This cannot be undone."
        }
        confirmLabel={isDeleting ? "Deleting..." : "Delete"}
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isDeleting}
        onConfirm={handleDeleteConfirm}
      />

      <ConfirmDialog
        open={showResetConfirm}
        onOpenChange={setShowResetConfirm}
        title="Clear form?"
        description="This will clear all entered data in the form. Your saved gallery items will not be deleted."
        confirmLabel="Clear"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isResetting}
        onConfirm={handleBulkResetConfirm}
      />
    </div>
  );
}

// Silence unused warning for isoToDisplay helper (kept for parity with Academic Programs spec)
void isoToDisplay;
