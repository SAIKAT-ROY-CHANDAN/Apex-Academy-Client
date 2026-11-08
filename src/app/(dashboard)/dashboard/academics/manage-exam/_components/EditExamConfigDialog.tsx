"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { updateExamConfig } from "@/services/examConfig";
import { isConflictResponse } from "@/types/shared/api-response.type";
import ExamConfigForm, { type ExamConfigFormProps } from "./ExamConfigForm";
import { toExamConfigPayload, type ExamConfigFormValues } from "./schema/exam-config.schema";
import type { TExamConfig } from "./types/exam-config";

interface EditExamConfigDialogProps
  extends Omit<ExamConfigFormProps, "onSubmit"> {
  exam: TExamConfig | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Optional: pass your own handler; otherwise the dialog updates via updateExamConfig()
  onSubmit?: (values: ExamConfigFormValues) => Promise<void>;
  onUpdated?: () => void;
}

const EditExamConfigDialog = ({
  exam,
  open,
  onOpenChange,
  programs,
  onSubmit,
  onUpdated,
  isSubmitting: isSubmittingProp,
  defaultValues: defaultValuesProp,
  isEditMode = true,
}: EditExamConfigDialogProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);
  // Remounts the form when the dialog closes so a reopened dialog starts
  // from the saved values (resetting Section and any unsaved edits).
  const [formKey, setFormKey] = useState(0);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setDuplicateError(null);
      setFormKey((k) => k + 1);
    }
    onOpenChange(next);
  };

  const handleUpdate = async (values: ExamConfigFormValues) => {
    if (!exam) return;

    setDuplicateError(null);
    try {
      setIsSubmitting(true);
      const response = await updateExamConfig(exam.id, toExamConfigPayload(values));

      if (response?.success) {
        toast.success("Exam updated successfully");
        onOpenChange(false);
        router.refresh();
        onUpdated?.();
      } else {
        // Keep the dialog open with the entered values so the user can
        // change something and retry. 409 = duplicate exam.
        const message = response?.message || "Failed to update exam";
        toast.error(message);
        if (isConflictResponse(response)) {
          setDuplicateError(message);
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update exam",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = onSubmit ?? handleUpdate;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Exam</DialogTitle>
        </DialogHeader>
        {exam && (
          <ExamConfigForm
            key={`${exam.id}-${formKey}`}
            programs={programs}
            onSubmit={handleSubmit}
            isSubmitting={isSubmittingProp ?? isSubmitting}
            isEditMode={isEditMode}
            serverError={duplicateError}
            onServerErrorClear={() => setDuplicateError(null)}
            defaultValues={{
              academic_class_id: exam.academic_class_id,
              // program & department are TOP-LEVEL fields on exam,
              // NOT nested inside academicClass — matches backend
              // `include: { academicClass, program, department, batch }`
              program_id: exam.program?.id || exam.program_id || "",
              department_id: exam.department?.id || exam.department_id || "",
              section_id: exam.section_id || "",
              exam_name: exam.exam_name,
              exam_date: exam.exam_date,
              ...defaultValuesProp,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EditExamConfigDialog;
