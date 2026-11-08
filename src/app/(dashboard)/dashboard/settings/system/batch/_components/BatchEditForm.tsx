"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateBatch } from "@/services/batch";
import { TBatch } from "./Types/batch";

const batchSchema = z.object({
  batch_name: z.string().min(1, "Batch name is required"),
});

export type TBatchFormValues = z.infer<typeof batchSchema>;

interface BatchEditFormProps {
  batch: TBatch;
  onSuccess: () => void;
  onCancel: () => void;
}

const BatchEditForm = ({ batch, onSuccess, onCancel }: BatchEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TBatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batch_name: batch.batch_name,
    },
  });

  const onSubmit = (values: TBatchFormValues) => {
    startTransition(async () => {
      const response = await updateBatch(batch.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update batch");
        return;
      }
      toast.success(response.message ?? "Batch updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="batch_name">Batch Name</Label>
        <Input id="batch_name" {...register("batch_name")} />
        {errors.batch_name && (
          <p className="text-xs text-destructive">
            {errors.batch_name.message}
          </p>
        )}
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
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default BatchEditForm;