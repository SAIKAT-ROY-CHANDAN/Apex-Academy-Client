"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import SingleImageDropzone from "@/components/shared/single-image-dropzone";
import {
  deleteAllWebsitePageCovers,
  upsertWebsitePageCovers,
} from "@/services/websitePageCover";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PageCoverKey =
  | "aboutCollege"
  | "managementTeam"
  | "academic"
  | "students"
  | "gallery"
  | "career"
  | "noticeBoard"
  | "contactUs";

export interface PageCoverConfig {
  key: PageCoverKey;
  label: string;
}

export interface PageCoverFile {
  file: File;
  previewUrl: string;
}

export type PageCoverState = Partial<Record<PageCoverKey, PageCoverFile>>;

interface PageCoverSettingsProps {
  /** Existing cover image URLs, keyed by page (e.g. loaded from the server). */
  initialCovers?: Partial<Record<PageCoverKey, string>>;
  maxSizeMb?: number;
}

const DEFAULT_PAGES: PageCoverConfig[] = [
  { key: "aboutCollege", label: "About College" },
  { key: "managementTeam", label: "Management Team & Administration" },
  { key: "academic", label: "Academic" },
  { key: "students", label: "Students" },
  { key: "gallery", label: "Gallery" },
  { key: "career", label: "Career" },
  { key: "noticeBoard", label: "Notice Board" },
  { key: "contactUs", label: "Contact Us" },
];

// ---------------------------------------------------------------------------
// Single upload slot
// ---------------------------------------------------------------------------

function CoverUploadSlot({
  config,
  index,
  existingUrl,
  file,
  maxSizeMb,
  onChange,
  onError,
}: {
  config: PageCoverConfig;
  index: number;
  existingUrl?: string;
  file?: PageCoverFile;
  maxSizeMb: number;
  onChange: (key: PageCoverKey, file: File | null) => void;
  onError: (message: string) => void;
}) {
  const previewSrc = file?.previewUrl ?? existingUrl ?? null;
  const hasExisting = Boolean(existingUrl);
  const hasPending = Boolean(file);
  const isCoverSet = hasExisting || hasPending;

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Level header — always visible so user knows which page this card belongs to */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-none text-slate-900">
              {config.label}
            </p>
            <p className="truncate text-xs text-slate-400">{config.key}</p>
          </div>
        </div>
        <span
          className={[
            "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
            hasPending
              ? "bg-amber-100 text-amber-700 ring-1 ring-amber-200"
              : isCoverSet
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                : "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
          ].join(" ")}
        >
          {hasPending
            ? "Unsaved • pending"
            : isCoverSet
              ? "Cover set"
              : "No cover"}
        </span>
      </div>

      {/* Drop zone — shared upload dropzone (same one reused by the principals form) */}
      <SingleImageDropzone
        label={config.label}
        previewSrc={previewSrc}
        hasPending={hasPending}
        uploadLabel={`Upload Cover for ${config.label}`}
        maxSizeMb={maxSizeMb}
        showRemoveButton={false}
        onChange={(nextFile) => onChange(config.key, nextFile)}
        onError={onError}
      />

      {/* Helper footer when a cover is already set — reinforces the mapping */}
      {isCoverSet && (
        <div className="border-t border-slate-100 bg-white px-4 py-2.5">
          <p className="truncate text-xs text-slate-500">
            <span className="font-medium text-slate-700">{config.label}</span>
            <span className="mx-1.5 text-slate-300">•</span>
            {hasPending ? (
              <span className="text-amber-600">
                New image selected — click Save to apply
              </span>
            ) : (
              <span>Image is live on the public site</span>
            )}
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PageCoverSettings({
  initialCovers,
  maxSizeMb = 10,
}: PageCoverSettingsProps) {
  const router = useRouter();
  const [covers, setCovers] = useState<PageCoverState>({});
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [optimisticallyCleared, setOptimisticallyCleared] = useState(false);

  const handleChange = useCallback((key: PageCoverKey, file: File | null) => {
    setError(null);
    setCovers((prev) => {
      const next = { ...prev };
      if (!file) {
        delete next[key];
        return next;
      }
      const existing = prev[key];
      if (existing) URL.revokeObjectURL(existing.previewUrl);

      next[key] = { file, previewUrl: URL.createObjectURL(file) };
      return next;
    });
  }, []);

  const handleResetClick = useCallback(() => {
    setResetDialogOpen(true);
  }, []);

  const handleConfirmReset = useCallback(async () => {
    setIsResetting(true);
    setError(null);
    try {
      // Clear any pending local previews immediately
      Object.values(covers).forEach((c) => URL.revokeObjectURL(c.previewUrl));
      setCovers({});
      setOptimisticallyCleared(true);

      const hasPersistedCovers = Boolean(
        initialCovers && Object.values(initialCovers).some(Boolean),
      );

      if (hasPersistedCovers) {
        const response = await deleteAllWebsitePageCovers();
        if (response?.success) {
          toast.success("All cover images removed");
        } else {
          toast.error(response?.message ?? "Failed to remove cover images");
          setOptimisticallyCleared(false);
          setIsResetting(false);
          setResetDialogOpen(false);
          return;
        }
      } else {
        toast.success("Pending changes cleared");
      }

      router.refresh();
    } catch {
      const msg =
        "Something went wrong while removing covers. Please try again.";
      setError(msg);
      toast.error(msg);
      setOptimisticallyCleared(false);
    } finally {
      setIsResetting(false);
      setResetDialogOpen(false);
    }
  }, [covers, initialCovers, router]);

  const handleSave = useCallback(() => {
    if (Object.keys(covers).length === 0) return;
    setError(null);

    startTransition(async () => {
      try {
        const formData = new FormData();
        // Only append files that were actually changed
        for (const [key, value] of Object.entries(covers)) {
          if (value?.file) {
            formData.append(key, value.file);
          }
        }

        const response = await upsertWebsitePageCovers(formData);
        console.log("Page Cover Response: ", response);
        if (response?.success) {
          toast.success("Page covers saved successfully");
          // Clear pending state
          Object.values(covers).forEach((c) =>
            URL.revokeObjectURL(c.previewUrl),
          );
          setCovers({});
          setOptimisticallyCleared(false);
          router.refresh();
        } else {
          const msg = response?.message ?? "Failed to save page covers";
          setError(msg);
          toast.error(msg);
        }
      } catch {
        const msg = "Something went wrong while saving. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    });
  }, [covers, router]);

  const hasChanges = Object.keys(covers).length > 0;

  // Effective covers after optimistic delete — hides persisted images until server refresh confirms
  const effectiveInitialCovers = optimisticallyCleared ? {} : initialCovers;

  // Keep optimistic flag in sync when server data changes (e.g. after refresh)
  // If initialCovers becomes empty, we can clear the flag; if it repopulates, also clear.
  // Using effect-like derived: if optimisticallyCleared and initialCovers is empty, keep cleared; otherwise reset when covers are set.
  // We handle via callback above.

  // Summary level — helps user understand at a glance which pages already have a cover
  const totalPages = DEFAULT_PAGES.length;
  const coverSetCount = DEFAULT_PAGES.filter(
    (p) => Boolean(effectiveInitialCovers?.[p.key]) || Boolean(covers[p.key]),
  ).length;
  const pendingCount = Object.keys(covers).length;
  const emptyCount = totalPages - coverSetCount;
  const hasAnythingToReset = coverSetCount > 0 || pendingCount > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">
            Page&apos;s Cover
          </h1>
          <nav
            aria-label="Breadcrumb"
            className="mt-1 text-[15px] text-slate-400"
          >
            <ol className="flex items-center gap-2">
              <li>Overview</li>
              <li aria-hidden="true">&rsaquo;</li>
              <li>Website Settings</li>
              <li aria-hidden="true">&rsaquo;</li>
              <li className="text-blue-600">Page&apos;s Cover</li>
            </ol>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>
      </div>

      {/* Summary level */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Cover overview
            </p>
            <p className="mt-0.5 text-sm text-slate-500">
              <span className="font-medium text-emerald-600">
                {coverSetCount} of {totalPages} pages
              </span>{" "}
              have a cover image
              {emptyCount > 0 && (
                <span>
                  {" "}
                  •{" "}
                  <span className="text-slate-600">
                    {emptyCount} without cover
                  </span>
                </span>
              )}
              {pendingCount > 0 && (
                <span>
                  {" "}
                  •{" "}
                  <span className="font-medium text-amber-600">
                    {pendingCount} pending — not yet saved
                  </span>
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />{" "}
              {coverSetCount} set
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-slate-400" />{" "}
              {emptyCount} empty
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" />{" "}
                {pendingCount} unsaved
              </span>
            )}
          </div>
        </div>
        {/* Legend for the card labels */}
        <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Cover
            set — image is live
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Unsaved —
            select Save to apply
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> No cover
            — upload to set
          </span>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </div>
      )}

      {/* Grid - 1 col mobile, 2 cols desktop */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {DEFAULT_PAGES.map((page, idx) => (
          <CoverUploadSlot
            key={page.key}
            index={idx}
            config={page}
            existingUrl={effectiveInitialCovers?.[page.key] ?? undefined}
            file={covers[page.key]}
            maxSizeMb={maxSizeMb}
            onChange={handleChange}
            onError={setError}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="mt-8 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={handleResetClick}
          disabled={isPending || isResetting || !hasAnythingToReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white px-6 py-3.5 text-[15px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white">
            <Plus className="h-3.5 w-3.5 rotate-45" strokeWidth={3} />
          </span>
          {isResetting ? "Removing..." : "Reset"}
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isPending || isResetting || !hasChanges}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Remove all cover images?"
        description="All 8 page covers will be permanently removed and the public website will show the default banner. Pending unsaved selections will also be cleared. This action cannot be undone."
        confirmLabel="Confirm remove"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isResetting}
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}
