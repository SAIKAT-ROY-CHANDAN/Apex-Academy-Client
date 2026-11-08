"use client";

import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import RichTextEditor from "@/components/shared/rich-text-editor";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteCareerDevelopmentProgramme,
  updateWebsiteCareerDevelopmentProgramme,
} from "@/services/websiteCareerDevelopmentProgramme";

export interface CareerDevelopmentProgrammeData {
  id: string;
  programName?: string | null;
  entryFee?: string | null;
  description?: string | null;
}

interface CareerDevelopmentProgrammeFormProps {
  initialData?: CareerDevelopmentProgrammeData | null;
}

const fieldClassName =
  "h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30";

export default function CareerDevelopmentProgrammeForm({
  initialData,
}: CareerDevelopmentProgrammeFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);

  const [programName, setProgramName] = useState(
    initialData?.programName ?? "",
  );
  const [entryFee, setEntryFee] = useState(initialData?.entryFee ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);

  // Re-sync fields when the server data changes (e.g. after save + revalidate).
  useEffect(() => {
    setProgramName(initialData?.programName ?? "");
    setEntryFee(initialData?.entryFee ?? "");
    setDescription(initialData?.description ?? "");
  }, [initialData]);

  const handleReset = () => {
    setProgramName(initialData?.programName ?? "");
    setEntryFee(initialData?.entryFee ?? "");
    setDescription(initialData?.description ?? "");
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("programName", programName);
    formData.append("entryFee", entryFee);
    formData.append("description", description);

    startTransition(async () => {
      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteCareerDevelopmentProgramme(
              initialData.id,
              formData,
            )
          : await createWebsiteCareerDevelopmentProgramme(formData);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Career development programme updated successfully"
            : "Career development programme created successfully",
        );
        router.push("/dashboard/website/career-development-programmes");
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
            Programme Name
          </Label>
          <Input
            value={programName}
            onChange={(event) => setProgramName(event.target.value)}
            placeholder="Write here..."
            className={fieldClassName}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Entry Fee
          </Label>
          <Input
            value={entryFee}
            onChange={(event) => setEntryFee(event.target.value)}
            placeholder="Write here..."
            className={fieldClassName}
          />
        </div>
      </div>

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
