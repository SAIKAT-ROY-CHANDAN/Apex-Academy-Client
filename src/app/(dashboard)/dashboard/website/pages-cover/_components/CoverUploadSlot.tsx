"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Plus } from "lucide-react";
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
  /** Called when the user clicks Save, with only the pages that changed. */
  onSave?: (covers: PageCoverState) => void | Promise<void>;
  /** Called when the user clicks Reset. */
  onReset?: () => void;
  /** Max upload size in MB, shown in the helper text and enforced client-side. */
  maxSizeMb?: number;
}

const DEFAULT_PAGES: PageCoverConfig[] = [
  { key: "aboutCollege", label: "About College Page" },
  { key: "managementTeam", label: "Management Team & Administration Page" },
  { key: "academic", label: "Academic Page" },
  { key: "students", label: "Students Page" },
  { key: "gallery", label: "Gallery Page" },
  { key: "career", label: "Career Page" },
  { key: "noticeBoard", label: "Notice Board Page" },
  { key: "contactUs", label: "Contact Us Page" },
];

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

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
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const previewSrc = file?.previewUrl ?? existingUrl ?? null;
  const hasExisting = Boolean(existingUrl);
  const hasPending = Boolean(file);
  const isCoverSet = hasExisting || hasPending;

  const validateAndSet = useCallback(
    (candidate: File | undefined | null) => {
      if (!candidate) return;

      if (!ACCEPTED_TYPES.includes(candidate.type)) {
        onError(`${config.label}: please choose an image file (PNG, JPG, WEBP, or GIF).`);
        return;
      }

      const maxBytes = maxSizeMb * 1024 * 1024;
      if (candidate.size > maxBytes) {
        onError(`${config.label}: file must be ${maxSizeMb} MB or smaller.`);
        return;
      }

      onChange(config.key, candidate);
    },
    [config.key, config.label, maxSizeMb, onChange, onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);
      validateAndSet(e.dataTransfer.files?.[0]);
    },
    [validateAndSet]
  );

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Persistent level header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-[13px] font-semibold leading-none text-slate-900">
              {config.label.replace(" Page", "")}
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
          {hasPending ? "Unsaved • pending" : isCoverSet ? "Cover set" : "No cover"}
        </span>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload cover for ${config.label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={[
          "group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center transition-colors",
          isDragging ? "bg-blue-50" : "bg-white hover:bg-slate-50",
        ].join(" ")}
      >
        <div
          className={[
            "pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed transition-colors",
            isDragging ? "border-blue-500" : "border-slate-300 group-hover:border-blue-400",
          ].join(" ")}
        />
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            validateAndSet(e.target.files?.[0]);
            if (e.target) e.target.value = "";
          }}
        />

        {previewSrc ? (
          <div className="relative z-10 h-[180px] w-full overflow-hidden rounded-xl">
            <Image
              src={previewSrc}
              alt={`${config.label} cover preview — ${hasPending ? "pending upload" : "current cover"}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 py-2.5">
              <p className="truncate text-left text-xs font-medium text-white">
                {config.label.replace(" Page", "")}
                <span className="ml-1.5 font-normal text-white/80">
                  — {hasPending ? "new selection" : "current cover"}
                </span>
              </p>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
              <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-800">
                Replace image
              </span>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-blue-600 text-blue-600">
              <ImageIcon className="h-6 w-6" strokeWidth={2} />
            </span>
            <div className="space-y-1">
              <p className="text-[15px] font-medium text-blue-600">
                Upload Cover for {config.label}
              </p>
              <p className="text-sm text-slate-400">Drag &amp; Drop or Choose file</p>
              <p className="text-sm text-slate-400">To upload media MAX {maxSizeMb} MB.</p>
            </div>
          </div>
        )}
      </div>

      {isCoverSet && (
        <div className="border-t border-slate-100 bg-white px-4 py-2.5">
          <p className="truncate text-xs text-slate-500">
            <span className="font-medium text-slate-700">{config.label.replace(" Page", "")}</span>
            <span className="mx-1.5 text-slate-300">•</span>
            {hasPending ? (
              <span className="text-amber-600">New image selected — click Save to apply</span>
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
  onSave,
  onReset,
  maxSizeMb = 10,
}: PageCoverSettingsProps) {
  const [covers, setCovers] = useState<PageCoverState>({});
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);

  const handleChange = useCallback((key: PageCoverKey, file: File | null) => {
    setError(null);
    setCovers((prev) => {
      const next = { ...prev };
      if (!file) {
        delete next[key];
        return next;
      }
      // Revoke the previous object URL for this slot, if any, to avoid leaks.
      const existing = prev[key];
      if (existing) URL.revokeObjectURL(existing.previewUrl);

      next[key] = { file, previewUrl: URL.createObjectURL(file) };
      return next;
    });
  }, []);

  const handleResetClick = useCallback(() => {
    setResetDialogOpen(true);
  }, []);

  const handleConfirmReset = useCallback(() => {
    Object.values(covers).forEach((c) => URL.revokeObjectURL(c.previewUrl));
    setCovers({});
    setError(null);
    onReset?.();
    setResetDialogOpen(false);
  }, [covers, onReset]);

  const handleReset = handleResetClick;

  const handleSave = useCallback(async () => {
    if (Object.keys(covers).length === 0) return;
    setIsSaving(true);
    setError(null);
    try {
      await onSave?.(covers);
    } catch {
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [covers, onSave]);

  const totalPages = DEFAULT_PAGES.length;
  const coverSetCount = DEFAULT_PAGES.filter(
    (p) => Boolean(initialCovers?.[p.key]) || Boolean(covers[p.key])
  ).length;
  const pendingCount = Object.keys(covers).length;
  const emptyCount = totalPages - coverSetCount;
  const hasAnythingToReset = coverSetCount > 0 || pendingCount > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Page&rsquo;s Cover</h1>
          <nav aria-label="Breadcrumb" className="mt-1 text-[15px] text-slate-400">
            <ol className="flex items-center gap-2">
              <li>Overview</li>
              <li aria-hidden="true">&rsaquo;</li>
              <li>Website Settings</li>
              <li aria-hidden="true">&rsaquo;</li>
              <li className="text-blue-600">Page&rsquo;s Cover</li>
            </ol>
          </nav>
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="flex items-center gap-2 rounded-full bg-blue-50 px-5 py-2.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-100"
        >
          <span aria-hidden="true">&larr;</span> Back
        </button>
      </div>

      {/* Summary level */}
      <div className="mb-6 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">Cover overview</p>
            <p className="mt-0.5 text-sm text-slate-500">
              <span className="font-medium text-emerald-600">{coverSetCount} of {totalPages} pages</span> have a cover image
              {emptyCount > 0 && <span> • <span className="text-slate-600">{emptyCount} without cover</span></span>}
              {pendingCount > 0 && <span> • <span className="font-medium text-amber-600">{pendingCount} pending — not yet saved</span></span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> {coverSetCount} set
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-slate-200">
              <span className="h-2 w-2 rounded-full bg-slate-400" /> {emptyCount} empty
            </span>
            {pendingCount > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200">
                <span className="h-2 w-2 rounded-full bg-amber-500" /> {pendingCount} unsaved
              </span>
            )}
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Cover set — image is live</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Unsaved — select Save to apply</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-slate-300" /> No cover — upload to set</span>
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

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {DEFAULT_PAGES.map((page, idx) => (
          <CoverUploadSlot
            key={page.key}
            index={idx}
            config={page}
            existingUrl={initialCovers?.[page.key]}
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
          onClick={handleReset}
          disabled={!hasAnythingToReset}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-2 border-red-200 bg-white px-6 py-3.5 text-[15px] font-medium text-red-500 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-red-500 text-white">
            <Plus className="h-3.5 w-3.5 rotate-45" strokeWidth={3} />
          </span>
          Reset
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || Object.keys(covers).length === 0}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/20">
            <Plus className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Remove all cover images?"
        description="All cover images will be removed and the previews cleared. Pending unsaved selections will also be cleared. This action cannot be undone."
        confirmLabel="Confirm remove"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={handleConfirmReset}
      />
    </div>
  );
}