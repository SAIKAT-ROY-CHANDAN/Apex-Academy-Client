"use client";

import * as React from "react";
import { File, Upload, X } from "lucide-react";
import { useFormContext } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

type FormFileUploadProps = {
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
  value?: File | null;
  onFileChange?: (file: File | null) => void;
  /** Optional: pass an existing file name (e.g. from server) */
  existingFileName?: string;
  /** Optional: link to the existing server file so it can be viewed */
  existingFileUrl?: string;
};

const FormFileUpload = ({
  label,
  description,
  helperText,
  error,
  name,
  id,
  required,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  maxSizeMB = 10,
  disabled,
  containerClassName,
  dropzoneClassName,
  value,
  onFileChange,
  existingFileName,
  existingFileUrl,
}: FormFileUploadProps) => {
  const formContext = useFormContext();
  const fieldError =
    formContext && name
      ? (formContext.formState.errors[name]?.message as string | undefined)
      : undefined;

  const generatedId = React.useId();
  const inputId = id ?? name ?? generatedId;
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error || fieldError ? `${inputId}-error` : undefined;
  const ariaDescribedBy = [descriptionId, errorId].filter(Boolean).join(" ");

  const inputRef = React.useRef<HTMLInputElement>(null);
  const isControlled = typeof value !== "undefined";
  const [file, setFile] = React.useState<File | null>(value ?? null);
  const [localError, setLocalError] = React.useState<string | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  // Key of the server-provided file dismissed via Remove — so a newly loaded
  // default restores the row.
  const [dismissedKey, setDismissedKey] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!isControlled) return;
    setFile(value ?? null);
  }, [isControlled, value]);

  const helper = helperText ?? `${(accept ?? "").replace(/,/g, ", ")} | up to ${maxSizeMB}MB`;
  const maxBytes = maxSizeMB ? maxSizeMB * 1024 * 1024 : undefined;
  const errorMessage = error ?? localError ?? fieldError;
  const currentKey = `${existingFileUrl ?? ""}|${existingFileName ?? ""}`;
  const existingVisible =
    (existingFileName || existingFileUrl) && dismissedKey !== currentKey;
  const effectiveExistingName = existingVisible ? existingFileName : undefined;
  const effectiveExistingUrl = existingVisible ? existingFileUrl : undefined;
  const hasFile = !!file || !!effectiveExistingName;
  const fileName = file?.name || effectiveExistingName || "";

  const handleFiles = (files: FileList | null) => {
    const nextFile = files?.[0];
    if (!nextFile) return;

    if (maxBytes && nextFile.size > maxBytes) {
      setLocalError(`File must be ${maxSizeMB}MB or smaller.`);
      return;
    }

    setLocalError(null);
    setFile(nextFile);
    onFileChange?.(nextFile);

    // Keep react-hook-form in sync so required-file validation can pass/clear.
    if (formContext && name) {
      formContext.setValue(name, nextFile, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const handleRemove = () => {
    if (file) {
      setFile(null);
    } else {
      // No new file — dismiss the server-provided existing file row.
      setDismissedKey(currentKey);
    }
    setLocalError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    onFileChange?.(null);

    // Reflect the removal in react-hook-form so required-file validation fails.
    if (formContext && name) {
      formContext.setValue(name, null, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
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
        {hasFile ? (
          <div className="flex min-h-20 w-full items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <File className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 truncate">
              {file || !effectiveExistingUrl ? (
                <p className="text-sm font-medium truncate">{fileName}</p>
              ) : (
                <a
                  href={effectiveExistingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium truncate text-primary underline underline-offset-2"
                >
                  {fileName}
                </a>
              )}
              {file ? (
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              ) : effectiveExistingUrl ? (
                <p className="text-xs text-muted-foreground">
                  Current file — click to view
                </p>
              ) : null}
            </div>
            <button
              type="button"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition hover:bg-muted hover:text-foreground"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={cn(
              "relative flex min-h-20 w-full items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-3 text-center transition focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
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
            <Upload className="h-5 w-5 text-muted-foreground" />
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">
                Upload file
              </div>
              <div className="text-xs text-muted-foreground">{helper}</div>
            </div>
          </button>
        )}
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

export { FormFileUpload };