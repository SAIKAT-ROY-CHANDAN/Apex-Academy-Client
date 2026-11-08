"use client";

import { File, SquarePlus, Upload, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteCurriculum,
  updateWebsiteCurriculum,
} from "@/services/websiteCurriculum";

export interface CurriculumData {
  id: string;
  title?: string | null;
  fileUrl?: string | null;
  created_at?: string | null;
}

interface CurriculumFormProps {
  initialData?: CurriculumData | null;
}

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export default function CurriculumForm({ initialData }: CurriculumFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(initialData?.title ?? "");
    setFile(null);
    setRemoved(false);
  }, [initialData]);

  const handleReset = () => {
    setTitle(initialData?.title ?? "");
    setFile(null);
    setRemoved(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null;
    if (!nextFile) return;
    setFile(nextFile);
    setRemoved(false);
  };

  const handleClearFile = () => {
    setFile(null);
    // Clearing a newly picked file falls back to the saved file if any.
    setRemoved(false);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleRemoveExisting = () => {
    setRemoved(true);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("title", title);

    if (file) {
      formData.append("curriculum_file", file);
    } else if (isEditMode && removed && initialData?.fileUrl) {
      formData.append("removeFile", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteCurriculum(initialData.id, formData)
          : await createWebsiteCurriculum(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Curriculum updated successfully"
            : "Curriculum created successfully",
        );
        router.push("/dashboard/website/curriculum");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  const showExisting = isEditMode && initialData?.fileUrl && !file && !removed;
  const showPicked = Boolean(file);

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Title</Label>
          <Input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Write here..."
            className={fieldClassName}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Curriculum File (PDF)
        </Label>

        <div className="relative">
          <input
            ref={inputRef}
            type="file"
            accept=".pdf"
            className="sr-only"
            onChange={handleFileChange}
          />

          {showPicked ? (
            <div className="flex min-h-20 w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <File className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-slate-800">
                  {file?.name}
                </p>
                {file && (
                  <p className="text-xs text-slate-500">
                    {formatFileSize(file.size)}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                disabled={isPending}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-200 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : showExisting ? (
            <div className="flex min-h-20 w-full items-center gap-3 rounded-lg border border-slate-200 bg-slate-50/60 px-4 py-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                <File className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 truncate">
                <p className="truncate text-sm font-medium text-slate-800">
                  {initialData?.fileUrl}
                </p>
                <a
                  href={initialData?.fileUrl ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-medium text-blue-600 hover:underline"
                >
                  View current file
                </a>
              </div>
              <button
                type="button"
                onClick={handleRemoveExisting}
                disabled={isPending}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isPending}
              className="relative flex min-h-20 w-full items-center justify-center gap-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 px-4 py-3 text-center transition hover:border-blue-400 hover:bg-blue-50/40 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload className="h-5 w-5 text-slate-400" />
              <div className="text-left">
                <div className="text-sm font-medium text-slate-700">
                  Upload file
                </div>
                <div className="text-xs text-slate-500">.pdf | up to 10MB</div>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          Reset
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset form?"
        description="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => {
          handleReset();
          setResetOpen(false);
        }}
      />
    </form>
  );
}
