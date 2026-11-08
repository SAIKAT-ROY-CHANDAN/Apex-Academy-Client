"use client";

import {
  FormSelect,
  type FormSelectOption,
} from "@/components/form/form-select";
import { get } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { TEACHER_TYPES } from "@/constant/teacher/teacherType";

type Program = {
  id: string;
  program_name: string;
  departments: { id: string; department_name: string }[];
};

type AcademicInfoSectionProps = {
  form: UseFormReturn<any>;
  programs: Program[];
  mode: string;
};

const qualificationOptions: FormSelectOption[] = [
  { label: "Degree Pass", value: "DEGREE_PASS" },
  { label: "Honours", value: "HONORS" },
  { label: "Masters", value: "MASTERS" },
  { label: "PhD", value: "PHD" },
];

const teacherTypeOptions: FormSelectOption[] = TEACHER_TYPES.map((type) => ({
  label: type.name,
  value: type.id,
}));

const AcademicInfoSection = ({
  form,
  programs,
  mode,
}: AcademicInfoSectionProps) => {
  const error = (field: string) =>
    get(form.formState.errors, field)?.message as string | undefined;

  const selectedProgramId = form.watch("program_id");
  const selectedProgram = programs.find((p) => p.id === selectedProgramId);
  const departmentOptions: FormSelectOption[] =
    selectedProgram?.departments?.map((d) => ({
      label: d.department_name,
      value: d.id,
    })) ?? [];

  // Reset department_id when program changes
  const handleProgramChange = (value: string) => {
    form.setValue("program_id", value, { shouldValidate: true });
    form.setValue("department_id", "", { shouldValidate: true });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <svg
            className="h-3.5 w-3.5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Academic Information</h3>
          <p className="text-[11px] text-muted-foreground">
            Academic qualification, teacher type & department details.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormSelect
          label="Last Qualification"
          required
          placeholder="Select qualification"
          options={qualificationOptions}
          value={form.watch("last_qualification")}
          onValueChange={(value) =>
            form.setValue("last_qualification", value, { shouldValidate: true })
          }
          error={error("last_qualification")}
          triggerClassName="h-10"
        />

        <FormSelect
          label="Teacher Type"
          required
          placeholder="Select teacher type"
          options={teacherTypeOptions}
          value={form.watch("teacher_type")}
          onValueChange={(value) =>
            form.setValue("teacher_type", value, { shouldValidate: true })
          }
          error={error("teacher_type")}
          triggerClassName="h-10"
        />

        {/* College/University: Program → Department cascade */}
        {mode === "COLLEGE_UNIVERSITY" ? (
          <>
            <FormSelect
              label="Program"
              placeholder="Select program"
              options={programs.map((p) => ({
                label: p.program_name,
                value: p.id,
              }))}
              value={form.watch("program_id")}
              onValueChange={handleProgramChange}
              error={error("program_id")}
              triggerClassName="h-10"
            />

            <FormSelect
              label="Department"
              placeholder={
                selectedProgramId
                  ? "Select department"
                  : "Select a program first"
              }
              options={departmentOptions}
              value={form.watch("department_id")}
              onValueChange={(value) =>
                form.setValue("department_id", value, { shouldValidate: true })
              }
              error={error("department_id")}
              disabled={!selectedProgramId}
              triggerClassName="h-10"
            />
          </>
        ) : null}
      </div>
    </div>
  );
};

export default AcademicInfoSection;