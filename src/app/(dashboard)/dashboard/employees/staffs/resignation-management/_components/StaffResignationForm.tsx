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
import {
  createStaffResignation,
  updateStaffResignation,
} from "@/services/staffResignation";
import type { TStaffResignation } from "@/types/modules/staff/staff-resignation.type";
import { toDateInputValue } from "../_constants";

const staffResignationSchema = z.object({
  staff_id: z.string().min(1, "Staff is required"),
  resignation_date: z.string().min(1, "Resignation date is required"),
  reason: z
    .string()
    .min(1, "Reason is required")
    .max(2000, "Reason must be at most 2000 characters"),
});

type FormValues = z.infer<typeof staffResignationSchema>;

type StaffResignationFormProps = {
  staffs: { id: string; name: string; designation?: string | null }[];
  initialData?: TStaffResignation;
  isEdit?: boolean;
};

const StaffResignationForm = ({
  staffs,
  initialData,
  isEdit = false,
}: StaffResignationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultDate = initialData
    ? toDateInputValue(initialData.resignation_date)
    : "";

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(staffResignationSchema) as any,
    defaultValues: {
      staff_id: initialData?.staff_id ?? "",
      resignation_date: defaultDate,
      reason: initialData?.reason ?? "",
    },
  });

  const submit = async (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        staff_id: values.staff_id,
        resignation_date: new Date(values.resignation_date).toISOString(),
        reason: values.reason.trim(),
      };

      const res = initialData
        ? await updateStaffResignation(initialData.id, payload)
        : await createStaffResignation(payload);

      if (!res.success) {
        toast.error(
          res.message ??
            (isEdit
              ? "Failed to update resignation"
              : "Failed to add resignation"),
        );
        return;
      }

      toast.success(
        res.message ??
          (isEdit
            ? "Resignation updated successfully"
            : "Resignation added successfully"),
      );
      router.refresh();
      router.push("/dashboard/employees/staffs/resignation-management");
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

              <FormInput
                type="date"
                label="Resignation Date"
                required
                placeholder="Select resignation date"
                error={form.formState.errors.resignation_date?.message}
                {...form.register("resignation_date")}
              />
            </div>

            <FormTextarea
              label="Reason"
              required
              placeholder="Write the reason for resignation..."
              rows={5}
              error={form.formState.errors.reason?.message}
              {...form.register("reason")}
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
                    {isEdit ? "Update Resignation" : "Add Resignation"}
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

export default StaffResignationForm;
