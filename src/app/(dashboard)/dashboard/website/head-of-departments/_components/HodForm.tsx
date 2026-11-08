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
  createWebsiteHeadOfDepartment,
  updateWebsiteHeadOfDepartment,
} from "@/services/websiteHeadOfDepartment";

export interface HeadOfDepartmentData {
  id: string;
  imageUrl?: string | null;
  name?: string | null;
  designation?: string | null;
  departmentName?: string | null;
}

interface HodFormProps {
  initialData?: HeadOfDepartmentData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

export default function HodForm({ initialData }: HodFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name ?? "");
  const [designation, setDesignation] = useState(
    initialData?.designation ?? "",
  );
  const [departmentName, setDepartmentName] = useState(
    initialData?.departmentName ?? "",
  );
  const [imageState, setImageState] =
    useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  // Changing the key remounts ImageUpload so its internal picked-file
  // state (which the parent cannot reach) is discarded on reset.
  const [uploadKey, setUploadKey] = useState(0);

  // Re-sync fields when the server data changes (e.g. after save + revalidate).
  useEffect(() => {
    setName(initialData?.name ?? "");
    setDesignation(initialData?.designation ?? "");
    setDepartmentName(initialData?.departmentName ?? "");
    setImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setName(initialData?.name ?? "");
    setDesignation(initialData?.designation ?? "");
    setDepartmentName(initialData?.departmentName ?? "");
    setImageState(emptyUploadState);
    setUploadKey((key) => key + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("designation", designation);
    formData.append("departmentName", departmentName);

    if (imageState.file) {
      formData.append("hod_image", imageState.file);
    } else if (imageState.removed) {
      formData.append("removeImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteHeadOfDepartment(initialData.id, formData)
          : await createWebsiteHeadOfDepartment(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Head of department updated successfully"
            : "Head of department created successfully",
        );
        router.push("/dashboard/website/head-of-departments");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <ImageUpload
        key={uploadKey}
        label="Head of Department"
        name="hod_image"
        defaultUrl={initialData?.imageUrl ?? undefined}
        onFileChange={setImageState}
      />

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Full Name
        </Label>
        <Input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Designation
          </Label>
          <Input
            value={designation}
            onChange={(event) => setDesignation(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Department Name
          </Label>
          <Input
            value={departmentName}
            onChange={(event) => setDepartmentName(event.target.value)}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
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
