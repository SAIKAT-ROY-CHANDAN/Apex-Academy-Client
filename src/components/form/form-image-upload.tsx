"use client";

import * as React from "react";
import { ImagePlus, X } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/png,image/jpeg,image/webp";

const formatHelperText = (
  accept?: string,
  maxSizeMB?: number,
  maxFiles?: number,
) => {
  const types = (accept ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace("image/", "").toUpperCase());

  const typeLabel = types.length ? types.join(", ") : "Images";
  const sizeLabel = maxSizeMB ? `up to ${maxSizeMB}MB` : "";
  const countLabel = maxFiles ? `max ${maxFiles}` : "";

  return [typeLabel, sizeLabel, countLabel].filter(Boolean).join(" ");
};

const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

type FormImageUploadBaseProps = {
  label?: string;
  description?: string;
  helperText?: string;
  error?: string;
  name?: string;
  id?: string;
  required?: boolean;
  accept?: string;
  maxSizeMB?: number;
  disabled?: boolean;
  containerClassName?: string;
  dropzoneClassName?: string;
};

type FormImageUploadSingleProps = FormImageUploadBaseProps & {
  defaultUrl?: string;
  value?: File | null;
  onFileChange?: (file: File | null) => void;
};

const FormImageUploadSingle = ({
  label,
  description,
  helperText,
  error,
  name,
  id,
  required,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 5,
  disabled,
  containerClassName,
  dropzoneClassName,
  defaultUrl,
  value,
  onFileChange,
}: FormImageUploadSingleProps) => {
  const generatedId = React.useId();
  const inputId = id ?? name ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const isControlled = typeof value !== "undefined";
  const [file, setFile] = React.useState<File | null>(value ?? null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  // URL dismissed via Remove — keyed by the URL so a newly loaded default restores the preview.
  const [dismissedUrl, setDismissedUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isControlled) return;
    setFile(value ?? null);
  }, [isControlled, value]);

  const previewUrl = React.useMemo(
    () =>
      file
        ? URL.createObjectURL(file)
        : defaultUrl && dismissedUrl !== defaultUrl
          ? defaultUrl
          : null,
    [file, defaultUrl, dismissedUrl],
  );

  React.useEffect(() => {
    if (!file || !previewUrl) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [file, previewUrl]);

  const helper = helperText ?? formatHelperText(accept, maxSizeMB);
  const maxBytes = maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined;
  const errorMessage = error ?? localError;

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    if (maxBytes && nextFile.size > maxBytes) {
      setLocalError(`Image must be ${maxSizeMB}MB or smaller.`);
      return;
    }

    setLocalError(null);
    setFile(nextFile);
    onFileChange?.(nextFile);
  };

  const handleRemove = () => {
    if (file) {
      setFile(null);
    } else {
      // No new file — dismiss the server-provided default preview.
      setDismissedUrl(defaultUrl ?? "__dismissed__");
    }
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileChange?.(null);
  };

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? (
        <Label htmlFor={inputId}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        disabled={disabled}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <div className="relative">
        <button
          type="button"
          className={cn(
            "relative flex min-h-47.5 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
            isDragging && "border-primary/60 bg-primary/5",
            disabled && "cursor-not-allowed opacity-70",
            dropzoneClassName,
          )}
          aria-describedby={ariaDescribedBy || undefined}
          aria-invalid={!!errorMessage}
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => {
            if (disabled) return;
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => {
            if (disabled) return;
            event.preventDefault();
            setIsDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Uploaded preview"
                className="h-full max-h-60 w-full rounded-md object-cover"
              />
              <span className="sr-only">Replace image</span>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ImagePlus className="h-5 w-5" />
              </span>
              <div className="text-sm font-medium text-foreground">
                Drag and drop or <span className="underline">browse</span>
              </div>
              <div className="text-xs text-muted-foreground">{helper}</div>
            </div>
          )}
        </button>
        {previewUrl ? (
          <button
            type="button"
            className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border transition hover:text-foreground"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove image</span>
          </button>
        ) : null}
      </div>
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className="text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

type FormImageUploadMultipleProps = FormImageUploadBaseProps & {
  maxFiles?: number;
  onFilesChange?: (files: File[]) => void;
};

type ImageItem = {
  id: string;
  file: File;
  url: string;
};

const FormImageUploadMultiple = ({
  label,
  description,
  helperText,
  error,
  name,
  id,
  required,
  accept = DEFAULT_ACCEPT,
  maxSizeMB = 5,
  maxFiles = 5,
  disabled,
  containerClassName,
  dropzoneClassName,
  onFilesChange,
}: FormImageUploadMultipleProps) => {
  const generatedId = React.useId();
  const inputId = id ?? name ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const [items, setItems] = React.useState<ImageItem[]>([]);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const itemsRef = React.useRef<ImageItem[]>([]);
  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  React.useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.url));
    };
  }, []);

  const helper = helperText ?? formatHelperText(accept, maxSizeMB, maxFiles);
  const maxBytes = maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined;
  const errorMessage = error ?? localError;

  const handleFiles = (files: FileList | null) => {
    if (!files?.length) return;

    if (items.length >= maxFiles) {
      setLocalError(`You can upload up to ${maxFiles} images.`);
      return;
    }

    const incoming = Array.from(files);
    const availableSlots = Math.max(maxFiles - items.length, 0);
    const nextFiles = incoming.slice(0, availableSlots);
    const validFiles: File[] = [];

    nextFiles.forEach((file) => {
      if (maxBytes && file.size > maxBytes) {
        return;
      }
      validFiles.push(file);
    });

    if (!validFiles.length) {
      setLocalError(`Each image must be ${maxSizeMB}MB or smaller.`);
      return;
    }

    const nextItems = validFiles.map((file) => ({
      id: createId(),
      file,
      url: URL.createObjectURL(file),
    }));

    setLocalError(null);
    setItems((prev) => {
      const updated = [...prev, ...nextItems];
      onFilesChange?.(updated.map((item) => item.file));
      return updated;
    });
  };

  const handleRemove = (idToRemove: string) => {
    setItems((prev) => {
      const target = prev.find((item) => item.id === idToRemove);
      if (target) {
        URL.revokeObjectURL(target.url);
      }
      const updated = prev.filter((item) => item.id !== idToRemove);
      onFilesChange?.(updated.map((item) => item.file));
      return updated;
    });
  };

  return (
    <div className={cn("grid gap-2", containerClassName)}>
      {label ? (
        <Label htmlFor={inputId}>
          {label}
          {required ? <span className="text-destructive"> *</span> : null}
        </Label>
      ) : null}
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        multiple
        disabled={disabled}
        className="sr-only"
        onChange={(event) => handleFiles(event.target.files)}
      />
      <button
        type="button"
        className={cn(
          "relative flex min-h-42.5 w-full items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 p-4 text-center transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
          isDragging && "border-primary/60 bg-primary/5",
          disabled && "cursor-not-allowed opacity-70",
          dropzoneClassName,
        )}
        aria-describedby={ariaDescribedBy || undefined}
        aria-invalid={!!errorMessage}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
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
      >
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <ImagePlus className="h-5 w-5" />
          </span>
          <div className="text-sm font-medium text-foreground">
            Drag and drop or <span className="underline">browse</span>
          </div>
          <div className="text-xs text-muted-foreground">{helper}</div>
        </div>
      </button>
      {items.length ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative overflow-hidden rounded-md border border-border bg-muted"
            >
              <img
                src={item.url}
                alt={item.file.name}
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                className="absolute right-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-background/90 text-muted-foreground shadow-sm ring-1 ring-border transition hover:text-foreground"
                onClick={() => handleRemove(item.id)}
              >
                <X className="h-3.5 w-3.5" />
                <span className="sr-only">Remove image</span>
              </button>
            </div>
          ))}
        </div>
      ) : null}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {errorMessage ? (
        <p id={errorId} className="text-xs text-destructive">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
};

export { FormImageUploadMultiple, FormImageUploadSingle };
