"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateExpenseType } from "@/services/expenseType";
import { TExpenseType } from "./Types/expense-type";

const expenseTypeSchema = z.object({
  name: z.string().min(1, "Expense type name is required"),
});

export type TExpenseTypeFormValues = z.infer<typeof expenseTypeSchema>;

interface ExpenseTypeEditFormProps {
  expenseType: TExpenseType;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExpenseTypeEditForm = ({ expenseType, onSuccess, onCancel }: ExpenseTypeEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TExpenseTypeFormValues>({
    resolver: zodResolver(expenseTypeSchema),
    defaultValues: {
      name: expenseType.name,
    },
  });

  const onSubmit = (values: TExpenseTypeFormValues) => {
    startTransition(async () => {
      const response = await updateExpenseType(expenseType.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update expense type");
        return;
      }
      toast.success(response.message ?? "Expense type updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Expense Type Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">
            {errors.name.message}
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

export default ExpenseTypeEditForm;