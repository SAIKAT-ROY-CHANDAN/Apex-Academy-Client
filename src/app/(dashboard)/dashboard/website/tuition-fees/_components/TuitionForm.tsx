"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createAcademicTuition,
  updateAcademicTuition,
} from "@/services/academicTuition";

export interface TuitionData {
  id: string;
  title: string;
  tuitionUrl?: string | null;
  tuitionAmount?: number | null;
}

interface TuitionFormProps {
  initialData?: TuitionData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

export default function TuitionForm({ initialData }: TuitionFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [tuitionAmount, setTuitionAmount] = useState(
    initialData?.tuitionAmount != null ? String(initialData.tuitionAmount) : "",
  );
  const [imageState, setImageState] =
    useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    setTitle(initialData?.title ?? "");
    setTuitionAmount(
      initialData?.tuitionAmount != null
        ? String(initialData.tuitionAmount)
        : "",
    );
    setImageState(emptyUploadState);
    setUploadKey((k) => k + 1);
  }, [initialData]);

  const handleReset = () => {
    setTitle(initialData?.title ?? "");
    setTuitionAmount(
      initialData?.tuitionAmount != null
        ? String(initialData.tuitionAmount)
        : "",
    );
    setImageState(emptyUploadState);
    setUploadKey((k) => k + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    const formData = new FormData();
    formData.append("title", title.trim());

    if (tuitionAmount.trim() !== "") {
      const num = Number(tuitionAmount);
      if (Number.isNaN(num)) {
        toast.error("Tuition amount must be a number");
        return;
      }
      formData.append("tuitionAmount", String(num));
    }

    if (imageState.file) {
      formData.append("tuition_image", imageState.file);
    } else if (imageState.removed) {
      formData.append("removeTuitionImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateAcademicTuition(initialData.id, formData)
          : await createAcademicTuition(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Tuition updated successfully"
            : "Tuition created successfully",
        );
        router.push("/dashboard/website/tuition-fees");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Title <span className="text-red-500">*</span>
          </Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Write here..."
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Tuition Amount
          </Label>
          <Input
            type="number"
            step="0.01"
            value={tuitionAmount}
            onChange={(e) => setTuitionAmount(e.target.value)}
            placeholder="e.g. 5000"
            className={fieldClassName}
          />
        </div>
      </div>

      <ImageUpload
        key={uploadKey}
        label="Tuition image"
        name="tuition_image"
        defaultUrl={initialData?.tuitionUrl ?? undefined}
        onFileChange={setImageState}
      />

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
