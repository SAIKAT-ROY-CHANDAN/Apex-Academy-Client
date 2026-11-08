"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import HomeworkForm from "./HomeworkForm";
import { createHomework } from "@/services/homework";
import { HomeworkFormValues } from "@/validation/teacher/homework.validation";
import { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";

type CreateHomeworkFormProps = {
  teacherId: string;
  mode: string;
  programs?: TProgram[];
  classes?: TAcademicClass[];
};

const CreateHomeworkForm = ({
  teacherId,
  mode,
  programs = [],
  classes = [],
}: CreateHomeworkFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: HomeworkFormValues) => {
    startTransition(async () => {
      const payload = {
        ...values,
        teacher_id: teacherId,
        // API field is `section_id` — `academic_section_id` is stripped by
        // server validation, so the section was silently never saved.
        // `undefined` (not null) when empty: the schema is optional uuid.
        section_id: values.academic_section_id || undefined,
        academic_section_id: undefined,
        class_id: values.academic_class_id || null,
        due_date: values.due_date
          ? new Date(values.due_date).toISOString()
          : values.due_date,
      };
      const response = await createHomework(payload);

      if (response?.success) {
        toast.success(response.message || "Homework created successfully");
        router.push("/teacher/home-work");
      } else {
        toast.error(response?.message || "Failed to create homework");
      }
    });
  };

  return (
    <HomeworkForm
      mode={mode}
      teacherId={teacherId}
      programs={programs}
      classes={classes}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
    />
  );
};

export default CreateHomeworkForm;