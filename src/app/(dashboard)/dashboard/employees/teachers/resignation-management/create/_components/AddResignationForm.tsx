"use client";

import { FormInput, FormSelect, FormTextarea } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createAdminResignation } from "@/services/teacherResignation";
import { addResignationSchema } from "@/validation/teacher/resignation.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, FileText, Loader2, Send, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

type FormValues = z.infer<typeof addResignationSchema>;

type TeacherOption = {
  id: string;
  full_name: string;
  designation_id?: string;
  designation: string;
  shift: string;
};

type AddResignationFormProps = {
  teachers: TeacherOption[];
  designations: { id: string; name: string }[];
  shifts: { id: string; name: string }[];
};

const AddResignationForm = ({
  teachers,
  designations,
}: AddResignationFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [designationFilter, setDesignationFilter] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(addResignationSchema) as any,
    defaultValues: {
      teacher_id: "",
      resignation_date: "",
      reason: "",
    },
  });

  const filteredTeachers = useMemo(() => {
    if (!designationFilter) return teachers;
    return teachers.filter(
      (t) => t.designation_id === designationFilter,
    );
  }, [teachers, designationFilter]);

  const teacherOptions = filteredTeachers.map((t) => ({
    value: t.id,
    label: `${t.full_name} — ${t.designation}${
      t.shift !== "N/A" ? ` (${t.shift})` : ""
    }`,
  }));

  const submit = async (values: FormValues) => {
    startTransition(async () => {
      const payload = {
        teacher_id: values.teacher_id,
        resignation_date: new Date(values.resignation_date).toISOString(),
        reason: values.reason,
      };
      const response = await createAdminResignation(payload);

      if (response.success) {
        toast.success(
          response.message || "Resignation recorded successfully",
        );
        router.push("/dashboard/employees/teachers/resignation-management");
        router.refresh();
      } else {
        toast.error(response.message || "Failed to record resignation");
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
            {/* Teacher Selection */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <UserRound className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Resigning Teacher</h3>
                  <p className="text-[11px] text-muted-foreground">
                    Select the teacher who is resigning.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="grid gap-2">
                    <span className="text-sm font-medium">Filter by Designation</span>
                    <Select
                      value={designationFilter}
                      onValueChange={(value) => setDesignationFilter(value ?? "")}
                    >
                      <SelectTrigger className="w-full h-10 text-sm">
                        <SelectValue placeholder="All Designations" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Designations</SelectItem>
                        {designations.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <FormSelect
                  label="Teacher"
                  required
                  placeholder="Select a teacher"
                  options={teacherOptions}
                  value={form.watch("teacher_id")}
                  onValueChange={(value) =>
                    form.setValue("teacher_id", value, { shouldValidate: true })
                  }
                  error={
                    form.formState.errors.teacher_id?.message as
                      | string
                      | undefined
                  }
                  triggerClassName="h-10"
                />
              </div>
            </div>

            <Separator />

            {/* Resignation Date */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                  <CalendarDays className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold">Resignation Date</h3>
                  <p className="text-[11px] text-muted-foreground">
                    The date the resignation takes effect.
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
                    Record the reason for the resignation.
                  </p>
                </div>
              </div>

              <FormTextarea
                label="Reason"
                required
                placeholder="Write the resignation reason here..."
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
                    Saving...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Save Resignation
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

export default AddResignationForm;