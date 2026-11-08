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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createAcademicFacilities,
  updateAcademicFacilities,
} from "@/services/academicFacilities";

export interface FacilityData {
  id: string;
  name: string;
  facilities_type?: string | null;
  main_image_url?: string | null;
  sub_one_image_url?: string | null;
  sub_two_image_url?: string | null;
  description?: string | null;
}

const FACILITIES_TYPE_OPTIONS = [
  { value: "CAMPUS", label: "Campus" },
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "LIBRARY", label: "Library" },
  { value: "STUDENT_CLUB", label: "Student Club" },
] as const;

interface FacilitiesFormProps {
  initialData?: FacilityData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

export default function FacilitiesForm({ initialData }: FacilitiesFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [name, setName] = useState(initialData?.name ?? "");
  const [facilitiesType, setFacilitiesType] = useState(
    initialData?.facilities_type ?? "CAMPUS",
  );
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [mainState, setMainState] =
    useState<ImageUploadState>(emptyUploadState);
  const [subOneState, setSubOneState] =
    useState<ImageUploadState>(emptyUploadState);
  const [subTwoState, setSubTwoState] =
    useState<ImageUploadState>(emptyUploadState);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    setName(initialData?.name ?? "");
    setFacilitiesType(initialData?.facilities_type ?? "CAMPUS");
    setDescription(initialData?.description ?? "");
    setMainState(emptyUploadState);
    setSubOneState(emptyUploadState);
    setSubTwoState(emptyUploadState);
    setUploadKey((k) => k + 1);
  }, [initialData]);

  const handleReset = () => {
    setName(initialData?.name ?? "");
    setFacilitiesType(initialData?.facilities_type ?? "CAMPUS");
    setDescription(initialData?.description ?? "");
    setMainState(emptyUploadState);
    setSubOneState(emptyUploadState);
    setSubTwoState(emptyUploadState);
    setUploadKey((k) => k + 1);
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    const formData = new FormData();
    formData.append("name", name.trim());
    formData.append("facilities_type", facilitiesType);
    formData.append("description", description);

    if (mainState.file) {
      formData.append("main_image", mainState.file);
    } else if (mainState.removed) {
      formData.append("removeMainImage", "true");
    }

    if (subOneState.file) {
      formData.append("sub_one_image", subOneState.file);
    } else if (subOneState.removed) {
      formData.append("removeSubOneImage", "true");
    }

    if (subTwoState.file) {
      formData.append("sub_two_image", subTwoState.file);
    } else if (subTwoState.removed) {
      formData.append("removeSubTwoImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateAcademicFacilities(initialData.id, formData)
          : await createAcademicFacilities(formData);

            console.log(response, "response");
      if (response?.success) {
        toast.success(
          isEditMode
            ? "Facility updated successfully"
            : "Facility created successfully",
        );
        router.push("/dashboard/website/student-facilities");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Write here..."
          className={fieldClassName}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Facilities Type <span className="text-red-500">*</span>
        </Label>
        <Select value={facilitiesType} onValueChange={(value) => setFacilitiesType(value ?? "CAMPUS")}>
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select facilities type" />
          </SelectTrigger>
          <SelectContent>
            {FACILITIES_TYPE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <ImageUpload
          key={`main-${uploadKey}`}
          label="Main image"
          name="main_image"
          defaultUrl={initialData?.main_image_url ?? undefined}
          onFileChange={setMainState}
        />
        <ImageUpload
          key={`sub1-${uploadKey}`}
          label="Sub one image"
          name="sub_one_image"
          defaultUrl={initialData?.sub_one_image_url ?? undefined}
          onFileChange={setSubOneState}
        />
        <ImageUpload
          key={`sub2-${uploadKey}`}
          label="Sub two image"
          name="sub_two_image"
          defaultUrl={initialData?.sub_two_image_url ?? undefined}
          onFileChange={setSubTwoState}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write here..."
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          rows={5}
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
