"use client";

import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const ACCEPT_ATTR = "image/png,image/jpeg,image/jpg,image/webp,image/gif";

export interface SingleImageDropzoneProps {
  /** Human-friendly name used in aria-labels, preview alt text and validation messages. */
  label: string;
  /** Current image source — an existing backend URL or a pending upload preview. */
  previewSrc?: string | null;
  /** True when previewSrc is a freshly picked file that has not been saved yet. */
  hasPending?: boolean;
  /** Primary empty-state call to action. Defaults to "Upload Image". */
  uploadLabel?: string;
  maxSizeMb?: number;
  /**
   * When true (default) a small X button is shown on top of the preview so the
   * user can clear the current image. Page-level cards that never remove an
   * existing image can disable it to keep the "Replace image" hover overlay.
   */
  showRemoveButton?: boolean;
  /**
   * Reports a newly selected file (or `null` when the user removes the current
   * image via the X button). The parent owns the state and builds FormData.
   */
  onChange: (file: File | null) => void;
  /** Reports a validation failure (unsupported type, too large). */
  onError?: (message: string) => void;
  className?: string;
}

export default function SingleImageDropzone({
  label,
  previewSrc,
  hasPending = false,
  uploadLabel = "Upload Image",
  maxSizeMb = 10,
  showRemoveButton = true,
  onChange,
  onError,
  className,
}: SingleImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const validateAndSet = useCallback(
    (candidate: File | undefined | null) => {
      if (!candidate) return;

      if (!ACCEPTED_TYPES.includes(candidate.type)) {
        onError?.(
          `${label}: please choose an image file (PNG, JPG, WEBP, or GIF).`
        );
        return;
      }

      const maxBytes = maxSizeMb * 1024 * 1024;
      if (candidate.size > maxBytes) {
        onError?.(`${label}: file must be ${maxSizeMb} MB or smaller.`);
        return;
      }

      onChange(candidate);
    },
    [label, maxSizeMb, onChange, onError]
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
    <div
      role="button"
      tabIndex={0}
      aria-label={`Upload ${label}`}
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
      className={cn(
        "group relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 p-6 text-center transition-colors",
        isDragging ? "bg-blue-50" : "bg-white hover:bg-slate-50",
        className
      )}
    >
      {/* Dashed inner border to keep the spec visual */}
      <div
        className={cn(
          "pointer-events-none absolute inset-3 rounded-xl border-2 border-dashed transition-colors",
          isDragging
            ? "border-blue-500"
            : "border-slate-300 group-hover:border-blue-400"
        )}
      />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_ATTR}
        className="sr-only"
        onClick={(e) => e.stopPropagation()}
        onChange={(e) => {
          validateAndSet(e.target.files?.[0]);
          // Allow re-selecting the same file again
          if (e.target) e.target.value = "";
        }}
      />

      {previewSrc ? (
        <div className="relative z-10 h-[180px] w-full overflow-hidden rounded-xl">
          <Image
            src={previewSrc}
            alt={`${label}${hasPending ? " — new selection" : ""}`}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            unoptimized
          />
          {/* Always-visible bottom label so the image is identifiable */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 py-2.5">
            <p className="truncate text-left text-xs font-medium text-white">
              {label}
              <span className="ml-1.5 font-normal text-white/80">
                — {hasPending ? "new selection" : "current"}
              </span>
            </p>
          </div>
          {/* Replace overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
            <span className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-slate-800">
              Replace image
            </span>
          </div>
          {showRemoveButton && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2.5 top-2.5 z-10 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-red-500"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove {label}</span>
            </button>
          )}
        </div>
      ) : (
        <div className="relative z-10 flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border-2 border-blue-600 text-blue-600">
            <ImageIcon className="h-6 w-6" strokeWidth={2} />
          </span>
          <div className="space-y-1">
            <p className="text-[15px] font-medium text-blue-600">{uploadLabel}</p>
            <p className="text-sm text-slate-400">Drag &amp; Drop or Choose file</p>
            <p className="text-sm text-slate-400">To upload media MAX {maxSizeMb} MB.</p>
          </div>
        </div>
      )}
    </div>
  );
}