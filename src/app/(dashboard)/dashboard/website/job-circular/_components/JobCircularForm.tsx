"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createWebsiteJobCircular,
  updateWebsiteJobCircular,
} from "@/services/websiteJobCircular";

export interface JobCircularData {
  id: string;
  positionName?: string | null;
  positionType?: string | null;
  educationalQualification?: string | null;
  applyFee?: string | null;
  applyStartDate?: string | null;
  applyEndDate?: string | null;
  imageUrl?: string | null;
  description?: string | null;
}

interface JobCircularFormProps {
  initialData?: JobCircularData | null;
}

const POSITION_TYPES = [
  "Full-Time",
  "Part-Time",
  "Contract",
  "Internship",
  "Remote",
] as const;

const emptyUploadState: ImageUploadState = { file: null, removed: false };

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

export default function JobCircularForm({ initialData }: JobCircularFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [positionName, setPositionName] = useState(
    initialData?.positionName ?? "",
  );
  const [positionType, setPositionType] = useState(
    initialData?.positionType ?? "Full-Time",
  );
  const [educationalQualification, setEducationalQualification] = useState(
    initialData?.educationalQualification ?? "",
  );
  const [applyFee, setApplyFee] = useState(
    initialData?.applyFee ? initialData.applyFee.replace(/\D/g, "") : "",
  );
  const [applyStartDate, setApplyStartDate] = useState(
    initialData?.applyStartDate ?? "",
  );
  const [applyEndDate, setApplyEndDate] = useState(
    initialData?.applyEndDate ?? "",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
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
    setPositionName(initialData?.positionName ?? "");
    setPositionType(initialData?.positionType ?? "Full-Time");
    setEducationalQualification(initialData?.educationalQualification ?? "");
    setApplyFee(
      initialData?.applyFee ? initialData.applyFee.replace(/\D/g, "") : "",
    );
    setApplyStartDate(initialData?.applyStartDate ?? "");
    setApplyEndDate(initialData?.applyEndDate ?? "");
    setDescription(initialData?.description ?? "");
    setImageState(emptyUploadState);
  }, [initialData]);

  const handleReset = () => {
    setPositionName(initialData?.positionName ?? "");
    setPositionType(initialData?.positionType ?? "Full-Time");
    setEducationalQualification(initialData?.educationalQualification ?? "");
    setApplyFee(
      initialData?.applyFee ? initialData.applyFee.replace(/\D/g, "") : "",
    );
    setApplyStartDate(initialData?.applyStartDate ?? "");
    setApplyEndDate(initialData?.applyEndDate ?? "");
    setDescription(initialData?.description ?? "");
    setImageState(emptyUploadState);
    setUploadKey((key) => key + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (applyStartDate && applyEndDate && applyStartDate > applyEndDate) {
      toast.error("Apply start date cannot be after the end date");
      return;
    }

    const formData = new FormData();
    formData.append("positionName", positionName);
    formData.append("positionType", positionType);
    formData.append("educationalQualification", educationalQualification);
    formData.append("applyFee", applyFee);
    formData.append("applyStartDate", applyStartDate);
    formData.append("applyEndDate", applyEndDate);
    formData.append("description", description);

    if (imageState.file) {
      formData.append("job_image", imageState.file);
    } else if (imageState.removed) {
      formData.append("removeImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteJobCircular(initialData.id, formData)
          : await createWebsiteJobCircular(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Job circular updated successfully"
            : "Job circular created successfully",
        );
        router.push("/dashboard/website/job-circular");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Position Name
          </Label>
          <Input
            value={positionName}
            onChange={(event) => setPositionName(event.target.value)}
            placeholder="Write here..."
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Position Type
          </Label>
          <Select
            value={positionType}
            onValueChange={(value) => setPositionType(value ?? "Full-Time")}
          >
            <SelectTrigger className={fieldClassName}>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {POSITION_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Educational Qualification
          </Label>
          <Input
            value={educationalQualification}
            onChange={(event) =>
              setEducationalQualification(event.target.value)
            }
            placeholder="Write here..."
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Apply fee (BDT)
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={applyFee}
            onChange={(event) => {
              const val = event.target.value.replace(/\D/g, "");
              setApplyFee(val);
            }}
            onKeyDown={(e) => {
              if (["e", "E", "+", "-", "."].includes(e.key)) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => {
              const pasteText = e.clipboardData.getData("text");
              if (!/^\d+$/.test(pasteText.trim())) {
                e.preventDefault();
                const digits = pasteText.replace(/\D/g, "");
                if (digits) {
                  setApplyFee(digits);
                }
              }
            }}
            onWheel={(e) => e.currentTarget.blur()}
            placeholder="e.g. 500"
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Apply Start Date
          </Label>
          <Input
            type="date"
            value={applyStartDate ?? ""}
            onChange={(event) => setApplyStartDate(event.target.value)}
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Apply End Date
          </Label>
          <Input
            type="date"
            value={applyEndDate ?? ""}
            onChange={(event) => setApplyEndDate(event.target.value)}
            min={applyStartDate || undefined}
            className={fieldClassName}
          />
        </div>
      </div>

      <ImageUpload
        key={uploadKey}
        label="Main image"
        name="job_image"
        defaultUrl={initialData?.imageUrl ?? undefined}
        onFileChange={setImageState}
      />

      <RichTextEditor
        label="Description"
        value={description}
        onChange={setDescription}
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
