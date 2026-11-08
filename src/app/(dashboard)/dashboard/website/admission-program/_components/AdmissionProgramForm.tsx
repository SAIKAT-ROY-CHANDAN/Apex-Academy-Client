"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import ImageUpload, {
  type ImageUploadState,
} from "@/components/shared/image-upload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  createAdmissionProgram,
  updateAdmissionProgram,
} from "@/services/admissionProgram";

export interface AdmissionProgramData {
  id: string;
  title: string;
  type: string;
  imageUrl?: string | null;
  description?: string | null;
  requirements?: string | null;
  courseList?: string | null;
  course_list?: string | null;
  isActive: boolean;
  order: number;
}

interface AdmissionProgramFormProps {
  initialData?: AdmissionProgramData | null;
}

const emptyUploadState: ImageUploadState = { file: null, removed: false };

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

const programTypes = [
  { value: "UNDERGRADUATE", label: "Undergraduate" },
  { value: "GRADUATE", label: "Graduate" },
  { value: "HSC", label: "HSC" },
  { value: "POST_GRADUATE", label: "Post Graduate" },
];

export default function AdmissionProgramForm({ initialData }: AdmissionProgramFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  console.log('AdmissionProgramForm initialData:', initialData);
  console.log('AdmissionProgramForm initialData keys:', initialData ? Object.keys(initialData) : 'null');

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [type, setType] = useState(initialData?.type ?? "UNDERGRADUATE");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [requirements, setRequirements] = useState(
    initialData?.requirements ?? "",
  );
  const [courseList, setCourseList] = useState(
    initialData?.courseList ?? initialData?.course_list ?? "",
  );
  const [imageState, setImageState] = useState<ImageUploadState>(emptyUploadState);
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [order, setOrder] = useState(initialData?.order ?? 0);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);
  const [uploadKey, setUploadKey] = useState(0);

  useEffect(() => {
    console.log('useEffect initialData:', initialData);
    if (!initialData) return;
    
    setTitle(initialData?.title ?? "");
    setType(initialData?.type ?? "UNDERGRADUATE");
    setDescription(initialData?.description ?? "");
    setRequirements(initialData?.requirements ?? "");
    // Handle both camelCase and snake_case field names
    setCourseList(initialData?.courseList ?? initialData?.course_list ?? "");
    setImageState(emptyUploadState);
    setIsActive(initialData?.isActive ?? true);
    setOrder(initialData?.order ?? 0);
    setUploadKey((k) => k + 1);
  }, [initialData]);

  const handleReset = () => {
    if (!initialData) return;
    setTitle(initialData?.title ?? "");
    setType(initialData?.type ?? "UNDERGRADUATE");
    setDescription(initialData?.description ?? "");
    setRequirements(initialData?.requirements ?? "");
    setCourseList(initialData?.courseList ?? initialData?.course_list ?? "");
    setImageState(emptyUploadState);
    setIsActive(initialData?.isActive ?? true);
    setOrder(initialData?.order ?? 0);
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
    formData.append("type", type);
    formData.append("description", description);
    formData.append("requirements", requirements);
    formData.append("courseList", courseList);
    formData.append("isActive", String(isActive));
    formData.append("order", String(order));

    if (imageState.file) {
      formData.append("admission_image", imageState.file);
    } else if (imageState.removed) {
      formData.append("removeImage", "true");
    }

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateAdmissionProgram(initialData.id, formData)
          : await createAdmissionProgram(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Admission program updated successfully"
            : "Admission program created successfully",
        );
        router.push("/dashboard/website/admission-program");
      } else {
        toast.error(response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5 pt-4">
      {!initialData && (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4 text-yellow-700">
          No initial data provided - creating new program
        </div>
      )}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Title <span className="text-red-500">*</span>
        </Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
          className={fieldClassName}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Program Type <span className="text-red-500">*</span>
        </Label>
        <Select value={type} onValueChange={(value) => setType(value ?? "UNDERGRADUATE")}>
          <SelectTrigger className={fieldClassName}>
            <SelectValue placeholder="Select program type" />
          </SelectTrigger>
          <SelectContent>
            {programTypes.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Image
        </Label>
        <ImageUpload
          key={`admission-${uploadKey}`}
          label="Admission program image"
          name="admission_image"
          defaultUrl={initialData?.imageUrl ?? undefined}
          onFileChange={setImageState}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Description
        </Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write description..."
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Requirements
        </Label>
        <Textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="Write requirements (bullet points)..."
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Course List
        </Label>
        <Textarea
          value={courseList}
          onChange={(e) => setCourseList(e.target.value)}
          placeholder="Write course list (bullet points)..."
          className="min-h-28 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            Active
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </Label>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Order
          </Label>
          <Input
            type="number"
            value={order}
            onChange={(e) => setOrder(Number(e.target.value) || 0)}
            placeholder="0"
            className={fieldClassName}
            min={0}
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