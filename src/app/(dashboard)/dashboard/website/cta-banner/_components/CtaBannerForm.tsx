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
  createWebsiteCtaBanner,
  updateWebsiteCtaBanner,
} from "@/services/websiteCtaBanner";

export interface WebsiteCtaBannerData {
  id: string;
  heading?: string | null;
  subHeading?: string | null;
  imageUrl?: string | null;
}

interface CtaBannerFormProps {
  initialData?: WebsiteCtaBannerData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

export default function CtaBannerForm({ initialData }: CtaBannerFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [heading, setHeading] = useState(initialData?.heading ?? "");
  const [subHeading, setSubHeading] = useState(initialData?.subHeading ?? "");
  const [imageState, setImageState] =
    useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    setHeading(initialData?.heading ?? "");
    setSubHeading(initialData?.subHeading ?? "");
    setImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setHeading(initialData?.heading ?? "");
    setSubHeading(initialData?.subHeading ?? "");
    setImageState(emptyUploadState);
    setUploadKey((key) => key + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("heading", heading);
    formData.append("subHeading", subHeading);

    if (imageState.file) {
      formData.append("cta_image", imageState.file);
    } else if (imageState.removed) {
      formData.append("removeImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteCtaBanner(initialData.id, formData)
          : await createWebsiteCtaBanner(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "CTA banner updated successfully"
            : "CTA banner created successfully",
        );
        router.refresh();
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <ImageUpload
        key={uploadKey}
        label="CTA Banner"
        name="cta_image"
        defaultUrl={initialData?.imageUrl ?? undefined}
        onFileChange={setImageState}
      />

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Heading</Label>
        <Input
          value={heading}
          onChange={(event) => setHeading(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Sub- Heading
        </Label>
        <Input
          value={subHeading}
          onChange={(event) => setSubHeading(event.target.value)}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
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
