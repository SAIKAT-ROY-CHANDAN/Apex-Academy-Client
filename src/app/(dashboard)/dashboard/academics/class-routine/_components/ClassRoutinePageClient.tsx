"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { usePermissions } from "@/components/providers/permission-provider";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import ClassRoutineTable, {
  type ClassRoutineRecord,
} from "./ClassRoutineTable";
import { PeriodSettingProvider } from "./PeriodSettingProvider";
import PeriodSettingsDialog from "./PeriodSettingsDialog";

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

type ClassRoutinePageClientProps = {
  routines: ClassRoutineRecord[];
  academicClasses: OptionItem[];
  academicSections: OptionItem[];
  batches: OptionItem[];
  shifts: OptionItem[];
  subjects: OptionItem[];
  teachers: OptionItem[];
  departments: OptionItem[];
  programs: OptionItem[];
};

function ClassRoutinePageClientContent({
  routines,
  academicClasses,
  academicSections,
  batches,
  shifts,
  subjects,
  teachers,
  departments,
  programs,
}: ClassRoutinePageClientProps) {
  const [periodSettingsOpen, setPeriodSettingsOpen] = useState(false);
  const { can } = usePermissions();

  // Period settings change the routine grid for everyone, so gate on the same
  // permission the backend enforces when saving (classRoutine.edit).
  const canManagePeriodSettings = can("classRoutine.edit");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Class Routine"
        backHref="/dashboard/academics"
        actions={{
          label: "Create Class Routine",
          href: "/dashboard/academics/class-routine/create",
        }}
      />

      {canManagePeriodSettings ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setPeriodSettingsOpen(true)}
            className="h-11 gap-2 rounded-2xl border-white/20 bg-white/70 font-semibold shadow-lg backdrop-blur-xl"
          >
            <Settings className="h-4 w-4" />
            Period Settings
          </Button>
        </div>
      ) : null}

      <ClassRoutineTable
        routines={routines}
        academicClasses={academicClasses}
        academicSections={academicSections}
        batches={batches}
        shifts={shifts}
        subjects={subjects}
        teachers={teachers}
        departments={departments}
        programs={programs}
      />

      {canManagePeriodSettings ? (
        <PeriodSettingsDialog
          open={periodSettingsOpen}
          onOpenChange={setPeriodSettingsOpen}
        />
      ) : null}
    </div>
  );
}

export default function ClassRoutinePageClient(
  props: ClassRoutinePageClientProps,
) {
  return (
    <PeriodSettingProvider>
      <ClassRoutinePageClientContent {...props} />
    </PeriodSettingProvider>
  );
}
