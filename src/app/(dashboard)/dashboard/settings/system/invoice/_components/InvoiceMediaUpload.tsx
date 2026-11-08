"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MAX_SIZE_MB = 10;
const MAX_BYTES = MAX_SIZE_MB * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";

// Reported to the parent on every change so it can build the right FormData:
// - file set, removed=false  -> user picked a new file, upload & replace
// - file null, removed=false -> no change, keep whatever exists on the backend
// - file null, removed=true  -> user explicitly cleared the existing image
export interface InvoiceMediaUploadState {
  file: File | null;
  removed: boolean;
}

interface InvoiceMediaUploadProps {
  label: string;
  name: string;
  defaultUrl?: string;
  onFileChange?: (state: InvoiceMediaUploadState) => void;
}

// Fetches an existing backend image URL and reconstructs it as a File.
// Needed because a plain <img src={url}> can show the picture, but any
// logic downstream that expects a real File (re-validation, showing a
// filename, re-including it in a future submit) can't be built from a
// URL string alone — browsers won't let you assign a remote URL into a
// file input's FileList either.
async function urlToFile(url: string, fallbackName: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch existing file: ${response.status}`);
  }
  const blob = await response.blob();
  const filename = url.split("/").pop()?.split("?")[0] || fallbackName;
  return new File([blob], filename, { type: blob.type });
}

export default function InvoiceMediaUpload({
  label,
  name,
  defaultUrl,
  onFileChange,
}: InvoiceMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<File | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // On mount (or if defaultUrl changes, e.g. after a save), fetch the
  // existing image and convert it to a File so it behaves the same as a
  // freshly picked one everywhere else in this component.
  useEffect(() => {
    if (!defaultUrl) {
      setExistingFile(null);
      return;
    }

    let cancelled = false;
    setIsLoadingExisting(true);
    setError(null);

    urlToFile(defaultUrl, name)
      .then((converted) => {
        if (!cancelled) setExistingFile(converted);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Couldn't load the existing file.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoadingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [defaultUrl, name]);

  // Once the user explicitly removes the existing image, never fall back
  // to it again for this render lifecycle — only a newly picked file (or
  // the defaultUrl prop actually changing) brings a preview back.
  const activeFile = file ?? (removed ? null : existingFile);

  const previewUrl = useMemo(
    () => (activeFile ? URL.createObjectURL(activeFile) : null),
    [activeFile],
  );

  useEffect(() => {
    if (!activeFile || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [activeFile, previewUrl]);

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    if (nextFile.size > MAX_BYTES) {
      setError(`File must be ${MAX_SIZE_MB}MB or smaller.`);
      return;
    }

    setError(null);
    setFile(nextFile);
    setRemoved(false);
    onFileChange?.({ file: nextFile, removed: false });
  };

  const handleRemove = (event: React.MouseEvent) => {
    event.stopPropagation();
    setFile(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    // Only counts as an explicit "delete the existing image" when there
    // was something to delete (a defaultUrl from the backend). If the user
    // is just clearing a not-yet-saved local pick, that's simply "no change".
    const isExplicitRemoval = Boolean(defaultUrl);
    setRemoved(isExplicitRemoval);
    onFileChange?.({ file: null, removed: isExplicitRemoval });
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-700">{label}</p>

      <input
        ref={inputRef}
        id={name}
        name={name}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex min-h-45 w-full cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white px-6 py-10 transition-colors",
          isDragging && "border-blue-400 bg-blue-50/40",
        )}
      >
        {isLoadingExisting ? (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p className="text-sm">Loading existing file...</p>
          </div>
        ) : previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={`${label} preview`}
              className="max-h-36 w-full rounded-md object-contain"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-slate-500 shadow-sm ring-1 ring-slate-200 transition hover:text-slate-800"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove {label}</span>
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
              <ImageIcon className="h-6 w-6" />
            </div>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                inputRef.current?.click();
              }}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Upload Media
            </button>
            <div className="space-y-1">
              <p className="text-sm text-slate-400">Drag &amp; Drop or Choose file</p>
              <p className="text-xs text-slate-400">
                To upload media MAX {MAX_SIZE_MB} MB.
              </p>
            </div>
          </div>
        )}
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}