"use client";

import { useTransition } from "react";
import { FieldValues, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createGradeSystem, updateGradeSystem } from "@/services/grade-system";
import { TGradeSystem } from "@/types/modules/grade-system/grade-system.type";
import { createGradeSystemSchema } from "@/validation/grade-system/grade-system.validation";

interface GradeSystemFormProps {
  gradeSystem?: TGradeSystem;
  onSuccess: () => void;
  onCancel: () => void;
}

type FormValues = z.infer<typeof createGradeSystemSchema> & FieldValues;

const GradeSystemForm = ({ gradeSystem, onSuccess, onCancel }: GradeSystemFormProps) => {
  const [isPending, startTransition] = useTransition();
  const isEditMode = !!gradeSystem;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createGradeSystemSchema) as any,
    defaultValues: {
      grade_name: gradeSystem?.grade_name || "",
      grade_point: gradeSystem?.grade_point || 0,
      mark_from: gradeSystem?.mark_from || 0,
      mark_to: gradeSystem?.mark_to || 0,
      remark: gradeSystem?.remark || "",
    },
  });

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      let response: any;
      
      if (isEditMode && gradeSystem) {
        response = await updateGradeSystem(gradeSystem.id, values);
      } else {
        response = await createGradeSystem(values);
      }

      if (!response.success) {
        toast.error(response.message ?? `Failed to ${isEditMode ? "update" : "create"} grade system`);
        return;
      }
      toast.success(response.message ?? `Grade system ${isEditMode ? "updated" : "created"} successfully`);
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 max-h-[65vh] overflow-y-auto pr-1">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="grade_name">Grade Name</Label>
            <Input id="grade_name" {...register("grade_name")} placeholder="e.g., A+, A, B+" />
            {errors.grade_name && (
              <p className="text-xs text-destructive">
                {String(errors.grade_name.message ?? "")}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="grade_point">Grade Point</Label>
            <Input id="grade_point" type="number" step="0.01" {...register("grade_point", { valueAsNumber: true })} placeholder="e.g., 4.00" />
            {errors.grade_point && (
              <p className="text-xs text-destructive">
                {String(errors.grade_point.message ?? "")}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mark_from">Mark From</Label>
            <Input id="mark_from" type="number" step="0.01" {...register("mark_from", { valueAsNumber: true })} placeholder="e.g., 80" />
            {errors.mark_from && (
              <p className="text-xs text-destructive">
                {String(errors.mark_from.message ?? "")}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mark_to">Mark To</Label>
            <Input id="mark_to" type="number" step="0.01" {...register("mark_to", { valueAsNumber: true })} placeholder="e.g., 100" />
            {errors.mark_to && (
              <p className="text-xs text-destructive">
                {String(errors.mark_to.message ?? "")}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="remark">Remarks</Label>
          <Input id="remark" {...register("remark")} placeholder="e.g., Excellent" />
          {errors.remark && (
            <p className="text-xs text-destructive">
              {String(errors.remark.message ?? "")}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : isEditMode ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );
};

export default GradeSystemForm;