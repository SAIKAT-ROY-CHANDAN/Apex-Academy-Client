"use client";

import { FormInput, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createResignationRequest } from "@/services/teacherResignation";
import { applyResignationSchema } from "@/validation/teacher/resignation.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, FileText, Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

type FormValues = z.infer<typeof applyResignationSchema>;

const ApplyResignationForm = ({ teacher_id }: { teacher_id: string }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(applyResignationSchema) as any,
    defaultValues: {
      resignation_date: "",
      reason: "",
    },
  });

  const submit = async (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        teacher_id,
        resignation_date: new Date(values.resignation_date).toISOString(),
        reason: values.reason,
      };
      const response = await createResignationRequest(payload);

      if (response.success) {
        toast.success(
          response.message || "Resignation request submitted successfully",
        );
        router.push("/teacher/resignation-request");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to submit resignation request");
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
            {/* Resignation Date */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Resignation Date</h3>
                  <p className="text-[11px] text-muted-foreground">
                    The date your resignation takes effect.
                  </p>
                </div>
              </div>

              <div className="max-w-md">
                <FormInput
                  label="Resignation Date"
                  type="date"
                  required
                  error={
                    form.formState.errors.resignation_date?.message as
                      | string
                      | undefined
                  }
                  {...form.register("resignation_date")}
                />
              </div>
            </div>

            <Separator />

            {/* Reason */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <FileText className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Reason</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Explain why you are resigning from your position.
                  </p>
                </div>
              </div>

              <FormTextarea
                label="Reason"
                required
                placeholder="Write your resignation reason here..."
                error={
                  form.formState.errors.reason?.message as
                    | string
                    | undefined
                }
                {...form.register("reason")}
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
                    Submit Resignation
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

export default ApplyResignationForm;
