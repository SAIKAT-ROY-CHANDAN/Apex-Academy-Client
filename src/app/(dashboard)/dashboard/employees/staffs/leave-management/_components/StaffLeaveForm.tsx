"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { FormInput, FormSelect, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createStaffLeave, updateStaffLeave } from "@/services/staffLeave";
import type { TStaffLeave } from "@/types/modules/staff/staff-leave.type";
import {
  LEAVE_STATUS_OPTIONS,
  LEAVE_TYPE_OPTIONS,
  toDateInputValue,
} from "../_constants";

const staffLeaveSchema = z
  .object({
    staff_id: z.string().min(1, "Staff is required"),
    leave_type: z.string().min(1, "Leave type is required"),
    leave_start_date: z.string().min(1, "Leave start date is required"),
    leave_end_date: z.string().min(1, "Leave end date is required"),
    leave_status: z.string().min(1, "Leave status is required"),
    leave_application: z
      .string()
      .min(1, "Leave application is required")
      .max(2000, "Leave application must be at most 2000 characters"),
  })
  .refine(
    (data) =>
      !data.leave_start_date ||
      !data.leave_end_date ||
      new Date(data.leave_end_date) >= new Date(data.leave_start_date),
    {
      message: "End date cannot be before start date",
      path: ["leave_end_date"],
    },
  );

type FormValues = z.infer<typeof staffLeaveSchema>;

type StaffLeaveFormProps = {
  staffs: { id: string; name: string; designation?: string | null }[];
  initialData?: TStaffLeave;
  isEdit?: boolean;
};

const StaffLeaveForm = ({
  staffs,
  initialData,
  isEdit = false,
}: StaffLeaveFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultStart = initialData
    ? toDateInputValue(initialData.leave_start_date)
    : "";
  const defaultEnd = initialData
    ? toDateInputValue(initialData.leave_end_date)
    : "";

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(staffLeaveSchema) as any,
    defaultValues: {
      staff_id: initialData?.staff_id ?? "",
      leave_type: initialData?.leave_type ?? "",
      leave_start_date: defaultStart,
      leave_end_date: defaultEnd,
      leave_status: initialData?.leave_status ?? "PENDING",
      leave_application: initialData?.leave_application ?? "",
    },
  });

  const submit = async (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        staff_id: values.staff_id,
        leave_start_date: new Date(values.leave_start_date).toISOString(),
        leave_end_date: new Date(values.leave_end_date).toISOString(),
        leave_type: values.leave_type,
        leave_application: values.leave_application.trim(),
        leave_status: values.leave_status,
      };

      const res = initialData
        ? await updateStaffLeave(initialData.id, payload)
        : await createStaffLeave(payload);

      if (!res.success) {
        toast.error(
          res.message ??
            (isEdit ? "Failed to update leave" : "Failed to add leave"),
        );
        return;
      }

      toast.success(
        res.message ??
          (isEdit ? "Leave updated successfully" : "Leave added successfully"),
      );
      router.refresh();
      router.push("/dashboard/employees/staffs/leave-management");
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-5">
        <FormProvider {...form}>
          <form
            className="space-y-6"
            onSubmit={form.handleSubmit(submit)}
            noValidate
          >
            <div className="grid gap-5 md:grid-cols-2">
              <FormSelect
                label="Staff Member"
                required
                placeholder="Select staff member"
                name="staff_id"
                value={form.watch("staff_id")}
                error={form.formState.errors.staff_id?.message}
                onValueChange={(value) =>
                  form.setValue("staff_id", value ?? "", {
                    shouldValidate: true,
                  })
                }
                options={staffs.map((s) => ({
                  label: s.designation
                    ? `${s.name} — ${s.designation}`
                    : s.name,
                  value: s.id,
                }))}
              />

              <FormSelect
                label="Leave Type"
                required
                placeholder="Select leave type"
                name="leave_type"
                value={form.watch("leave_type")}
                error={form.formState.errors.leave_type?.message}
                onValueChange={(value) =>
                  form.setValue("leave_type", value ?? "", {
                    shouldValidate: true,
                  })
                }
                options={LEAVE_TYPE_OPTIONS.map((t) => ({
                  label: t.name,
                  value: t.id,
                }))}
              />

              <FormInput
                type="date"
                label="Leave Start Date"
                required
                placeholder="Select start date"
                error={form.formState.errors.leave_start_date?.message}
                {...form.register("leave_start_date")}
              />

              <FormInput
                type="date"
                label="Leave End Date"
                required
                placeholder="Select end date"
                error={form.formState.errors.leave_end_date?.message}
                {...form.register("leave_end_date")}
              />

              <FormSelect
                label="Leave Status"
                required
                placeholder="Select status"
                name="leave_status"
                value={form.watch("leave_status")}
                error={form.formState.errors.leave_status?.message}
                onValueChange={(value) =>
                  form.setValue("leave_status", value ?? "PENDING", {
                    shouldValidate: true,
                  })
                }
                options={LEAVE_STATUS_OPTIONS.map((s) => ({
                  label: s.name,
                  value: s.id,
                }))}
              />
            </div>

            <FormTextarea
              label="Leave Application"
              required
              placeholder="Write the reason for leave..."
              rows={5}
              error={form.formState.errors.leave_application?.message}
              {...form.register("leave_application")}
            />

            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5"
                onClick={() => router.back()}
                disabled={isPending}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="h-10 px-5">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isEdit ? "Update Leave" : "Add Leave"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default StaffLeaveForm;
