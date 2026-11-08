"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateDepositType } from "@/services/depositType";
import { TDepositType } from "./Types/deposit-type";

const depositTypeEditSchema = z.object({
  name: z.string().min(1, "Deposit type name is required"),
});

export type TDepositTypeFormValues = z.infer<typeof depositTypeEditSchema>;

interface DepositTypeEditFormProps {
  depositType: TDepositType;
  onSuccess: () => void;
  onCancel: () => void;
}

const DepositTypeEditForm = ({ depositType, onSuccess, onCancel }: DepositTypeEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TDepositTypeFormValues>({
    resolver: zodResolver(depositTypeEditSchema),
    defaultValues: {
      name: depositType.name,
    },
  });

  const onSubmit = (values: TDepositTypeFormValues) => {
    startTransition(async () => {
      const response = await updateDepositType(depositType.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update deposit type");
        return;
      }
      toast.success(response.message ?? "Deposit type updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Deposit Type Name</Label>
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

export default DepositTypeEditForm;