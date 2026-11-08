"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import HomeworkForm from "./HomeworkForm";
import { updateHomework } from "@/services/homework";
import { getPrograms } from "@/services/program";
import { getAcademicClassDetails } from "@/services/academicClass";
import { HomeworkFormValues } from "@/validation/teacher/homework.validation";
import { THomework } from "@/types/modules/teacher/homework.type";
import { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";

interface EditHomeworkFormProps {
  homework: THomework;
  teacherId: string;
  mode: string;
}

const EditHomeworkForm = ({
  homework,
  teacherId,
  mode,
}: EditHomeworkFormProps) => {
  const router = useRouter();
  const [programs, setPrograms] = useState<TProgram[]>([]);
  const [classes, setClasses] = useState<TAcademicClass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // High limit so the homework's own class/program is present —
        // the API defaults to 10 items, which hides edit defaults.
        const [programsRes, classesRes] = await Promise.all([
          getPrograms([{ label: "limit", value: "500" }]),
          getAcademicClassDetails([{ label: "limit", value: "500" }]),
        ]);

        setPrograms(programsRes?.data ?? []);
        setClasses(classesRes?.data ?? []);
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Failed to load form data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // The API returns raw Prisma names (class_id / section_id); accept both.
  const homeworkClassId =
    homework.academic_class_id || homework.class_id || "";
  const homeworkSectionId =
    homework.academic_section_id || homework.section_id || "";

  // Guarantee the homework's class is selectable even if the list above
  // somehow missed it — otherwise class/section/subject defaults can't show.
  const classesWithCurrent =
    homeworkClassId &&
    !classes.some((c) => c.id === homeworkClassId) &&
    homework.academicClass
      ? [
          ...classes,
          homework.academicClass as unknown as TAcademicClass,
        ]
      : classes;

  // Convert due_date ISO string to datetime-local input format
  const formatDueDateForInput = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const offset = d.getTimezoneOffset();
    const local = new Date(d.getTime() - offset * 60000);
    return local.toISOString().slice(0, 16);
  };

  // Find the selected class across all nested data to derive program_id and department_id
  const selectedClass = (() => {
    if (!homeworkClassId) return null;
    // Search in classes array (school mode)
    const schoolMatch = classesWithCurrent.find(
      (c) => c.id === homeworkClassId,
    );
    if (schoolMatch) return schoolMatch;

    // Search in programs → departments → academicClasses (university mode)
    for (const program of programs) {
      for (const dept of program.departments || []) {
        const deptClass = dept.academicClasses?.find(
          (c) => c.id === homeworkClassId,
        );
        if (deptClass) return deptClass;
      }
    }
    return null;
  })();

  // Derive program_id and department_id from the selected class
  const defaultProgramId =
    selectedClass?.program_id && selectedClass.program_id !== ""
      ? selectedClass.program_id
      : "";
  const defaultDepartmentId =
    selectedClass?.department_id && selectedClass.department_id !== ""
      ? selectedClass.department_id
      : "";

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
      const response = await updateHomework(homework.id, payload);

      if (response?.success) {
        toast.success(response.message || "Homework updated successfully");
        router.push("/teacher/home-work");
      } else {
        toast.error(response?.message || "Failed to update homework");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading form data...
        </div>
      </div>
    );
  }

  return (
    <HomeworkForm
      mode={mode}
      teacherId={teacherId}
      programs={programs}
      classes={classesWithCurrent}
      onSubmit={handleSubmit}
      isSubmitting={isPending}
      submitLabel="Update Homework"
      defaultValues={{
        title: homework.title,
        description: homework.description,
        academic_class_id: homeworkClassId,
        academic_section_id: homeworkSectionId,
        subject_id: homework.subject_id,
        program_id: defaultProgramId,
        department_id: defaultDepartmentId,
        due_date: formatDueDateForInput(homework.due_date),
      }}
    />
  );
};

export default EditHomeworkForm;