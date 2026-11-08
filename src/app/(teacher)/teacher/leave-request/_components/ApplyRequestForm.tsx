"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, FileText, Loader2, Send, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v3";
import { FormInput, FormSelect, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LEAVE_TYPE_OPTIONS as canonicalLeaveTypeOptions } from "@/constant/leave/leaveType";
import { createLeaveRequest } from "@/services/teacherLeave";
import { applyLeaveRequestSchema } from "@/validation/teacher/leave-request.validation";

type FormValues = z.infer<typeof applyLeaveRequestSchema>;

// Values MUST match the Prisma `LeaveType` enum — the backend validates
// against it, so sending the display label would fail with "Invalid leave type".
const LEAVE_TYPE_OPTIONS = canonicalLeaveTypeOptions;

const ApplyRequestForm = ({ teacher_id }: { teacher_id: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(applyLeaveRequestSchema) as any,
    defaultValues: {
      leave_start_date: "",
      leave_end_date: "",
      leave_type: "",
      leave_application: "",
    },
  });

  const submit = async (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        leave_start_date: new Date(values.leave_start_date).toISOString(),
        leave_end_date: new Date(values.leave_end_date).toISOString(),
        leave_type: values.leave_type,
        leave_application: values.leave_application,
        teacher_id,
      };
      const response = await createLeaveRequest(payload);

      if (response.success) {
        toast.success(
          response.message || "Leave request submitted successfully",
        );
        router.push("/teacher/leave-request");
      } else {
        toast.error(response.message || "Failed to submit leave request");
      }
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-5">
        <FormProvider {...form}>
          <form
            className="space-y-5"
            onSubmit={form.handleSubmit(submit)}
            noValidate
          >
            {/* Leave Period */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Leave Period</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select the start and end dates for your leave.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Start Date"
                  type="date"
                  required
                  error={
                    form.formState.errors.leave_start_date?.message as
                      | string
                      | undefined
                  }
                  {...form.register("leave_start_date")}
                  inputClassName="h-10"
                />

                <FormInput
                  label="End Date"
                  type="date"
                  required
                  error={
                    form.formState.errors.leave_end_date?.message as
                      | string
                      | undefined
                  }
                  {...form.register("leave_end_date")}
                  inputClassName="h-10"
                />
              </div>
            </div>

            <Separator />

            {/* Leave Type */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <Tag className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Leave Type</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Choose the category that best fits your leave.
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <FormSelect
                  label="Leave Type"
                  required
                  placeholder="Select leave type"
                  options={LEAVE_TYPE_OPTIONS}
                  value={form.watch("leave_type")}
                  onValueChange={(value) =>
                    form.setValue("leave_type", value, { shouldValidate: true })
                  }
                  error={
                    form.formState.errors.leave_type?.message as
                      | string
                      | undefined
                  }
                  triggerClassName="h-10"
                />
              </div>
            </div>

            <Separator />

            {/* Leave Application */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Leave Application</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Provide a detailed reason for your leave request.
                  </p>
                </div>
              </div>

              <FormTextarea
                label="Application"
                required
                placeholder="Write your leave application here..."
                error={
                  form.formState.errors.leave_application?.message as
                    | string
                    | undefined
                }
                {...form.register("leave_application")}
                textareaClassName="min-h-32 resize-y"
              />
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-3 border-t pt-4">
              <Button
                type="button"
                variant="outline"
                className="h-10 px-5"
                onClick={() => router.back()}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="h-10 px-5">
                {isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Request
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

export default ApplyRequestForm;
