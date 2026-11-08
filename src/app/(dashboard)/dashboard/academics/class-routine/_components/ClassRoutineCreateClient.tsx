"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { createClassRoutine } from "@/services/classRoutine";
import ClassRoutineForm, {
  type ClassRoutineFormValues,
} from "./ClassRoutineForm";
import { PeriodSettingProvider } from "./PeriodSettingProvider";

type OptionItem = {
  id: string;
  name?: string;
  class_name?: string;
  section_name?: string;
  batch_name?: string;
  shift_name?: string;
  subject_name?: string;
  teacher_name?: string;
  full_name?: string;
  title?: string;
  department_name?: string;
  program_name?: string;
  program_id?: string;
};

type RoutineItem = {
  day: string;
  period_no: number;
  teacher_id: string;
  subject_id: string;
  roomNo?: string | null;
};

type RoutineSource = {
  id: string;
  shift_id?: string | null;
  classRoutineItems?: RoutineItem[];
};

type ClassRoutineCreateClientProps = {
  routines?: RoutineSource[];
  academicClasses: OptionItem[];
  academicSections: OptionItem[];
  batches: OptionItem[];
  shifts: OptionItem[];
  subjects: OptionItem[];
  teachers: OptionItem[];
  departments: OptionItem[];
  programs: OptionItem[];
};

export default function ClassRoutineCreateClient(
  props: ClassRoutineCreateClientProps,
) {
  return (
    <PeriodSettingProvider>
      <ClassRoutineCreateClientContent {...props} />
    </PeriodSettingProvider>
  );
}

function ClassRoutineCreateClientContent({
  routines,
  academicClasses,
  academicSections,
  batches,
  shifts,
  subjects,
  teachers,
  departments,
  programs,
}: ClassRoutineCreateClientProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (values: ClassRoutineFormValues) => {
    setIsSaving(true);
    try {
      const response = await createClassRoutine(values);
      console.log("createClassRoutine response:", response);

      if (!response?.success) {
        // Teacher double-booking is shown inline on the specific field — suppress global toast
        const msg = response?.message ?? "";
        if (
          typeof msg === "string" &&
          msg.toLowerCase().includes("already assigned")
        ) {
          return response;
        }
        toast.error(msg || "Failed to create class routine");
        return response;
      }

      toast.success(response?.message ?? "Class routine created successfully");
      router.push("/dashboard/academics/class-routine");
      router.refresh();
      return response;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Class Routine"
        backHref="/dashboard/academics/class-routine"
      />

      <ClassRoutineForm
        academicClasses={academicClasses}
        academicSections={academicSections}
        batches={batches}
        shifts={shifts}
        subjects={subjects}
        teachers={teachers}
        departments={departments}
        programs={programs}
        allRoutines={routines}
        submitLabel="Create Routine"
        isSubmitting={isSaving}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
