"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { useTransition, useEffect } from "react";
import {
  createStaffOvertimeConfig,
  updateStaffOvertimeConfig,
} from "@/services/staffOvertimeConfig";
import { toast } from "sonner";
import { FormInput } from "@/components/form";

type StaffConfigDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staffName: string;
  staffId: string;
  overtime_hourly_amount?: number;
  id?: string;
};

const StaffConfigDialog = ({
  open,
  onOpenChange,
  staffName,
  staffId,
  id,
  overtime_hourly_amount,
}: StaffConfigDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const form = useForm({
    defaultValues: {
      overtime_hourly_amount: overtime_hourly_amount ?? 0,
    },
  });

  // Reset form when dialog opens or when props change
  useEffect(() => {
    if (open) {
      form.reset({
        overtime_hourly_amount: overtime_hourly_amount ?? 0,
      });
    }
  }, [open, overtime_hourly_amount, form]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    startTransition(async () => {
      let res;

      // If we have an id, we're updating; otherwise, we're creating
      if (id !== undefined) {
        res = await updateStaffOvertimeConfig(id, {
          overtime_hourly_amount: data.overtime_hourly_amount,
        });
      } else {
        res = await createStaffOvertimeConfig({
          staff_id: staffId,
          overtime_hourly_amount: data.overtime_hourly_amount,
        });
      }

      if (res?.success) {
        onOpenChange(false);
        toast.success(
          res.message || "Overtime configuration saved successfully.",
        );
      } else {
        toast.error(
          res?.message || "Failed to save overtime configuration.",
        );
      }
    });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Overtime Config</DialogTitle>
          <DialogDescription>
            Configure overtime settings for {staffName}.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="Overtime Hourly Amount"
              type="number"
              placeholder="Enter overtime hourly amount"
              required
              error={form.formState.errors.overtime_hourly_amount?.message}
              {...form.register("overtime_hourly_amount", {
                valueAsNumber: true,
              })}
              inputClassName="h-12 bg-white"
            />
            <div className="flex ">
              <Button type="submit" className={"w-full"} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StaffConfigDialog;
