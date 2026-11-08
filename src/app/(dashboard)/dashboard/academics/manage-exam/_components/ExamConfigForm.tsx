"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { TClass } from "@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types";
import type { Department } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { Program } from "@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClassesByDepartmentId } from "@/services/academicClass";
import { getFilteredSections } from "@/services/academicSection";
import { getDepartmentByProgramId } from "@/services/department";
import {
  type ExamConfigFormInput,
  type ExamConfigFormValues,
  examConfigSchema,
} from "./schema/exam-config.schema";

export interface ExamConfigFormProps {
  programs: Program[];
  onSubmit: (values: ExamConfigFormValues) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<ExamConfigFormValues>;
  isEditMode?: boolean;
  // Server-side duplicate (409) message to show under the exam name field.
  serverError?: string | null;
  onServerErrorClear?: () => void;
}

const ExamConfigForm = ({
  programs,
  onSubmit,
  isSubmitting,
  defaultValues,
  isEditMode = false,
  serverError,
  onServerErrorClear,
}: ExamConfigFormProps) => {
  const form = useForm<ExamConfigFormInput, any, ExamConfigFormValues>({
    resolver: zodResolver(examConfigSchema),
    defaultValues: {
      academic_class_id: defaultValues?.academic_class_id || "",
      program_id: defaultValues?.program_id || "",
      department_id: defaultValues?.department_id || "",
      section_id: defaultValues?.section_id || "",
      exam_name: defaultValues?.exam_name || "",
      exam_date: defaultValues?.exam_date || "",
    },
  });

  const handleSubmit = async (values: ExamConfigFormValues) => {
    await onSubmit(values);
  };

  const [programDepartments, setProgramDepartments] = useState<Department[]>(
    [],
  );
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  // Class/Year options depend on the selected Department
  const [departmentClasses, setDepartmentClasses] = useState<TClass[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);

  // Section options depend on the selected Program, Department and Class/Year.
  // Same endpoint/shape as the Filters card (academic-section/filtered).
  type SectionOption = { id: string; name: string };
  const [classSections, setClassSections] = useState<SectionOption[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);

  const fetchDepartments = useCallback(async (programId: string) => {
    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      setProgramDepartments(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setProgramDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchClasses = useCallback(async (departmentId: string) => {
    setLoadingClasses(true);
    try {
      const response = await getClassesByDepartmentId(departmentId);
      setDepartmentClasses(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setDepartmentClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchSections = useCallback(
    async (programId: string, departmentId: string, classId: string) => {
      setLoadingSections(true);
      try {
        const response = await getFilteredSections([
          { label: "programId", value: programId },
          { label: "departmentId", value: departmentId },
          { label: "classId", value: classId },
        ]);
        const data = response?.data ?? [];
        setClassSections(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching sections:", error);
        setClassSections([]);
      } finally {
        setLoadingSections(false);
      }
    },
    [],
  );

  // Cascading triple watched from the form (covers create + edit prefill).
  const watchedProgramId = form.watch("program_id");
  const watchedDepartmentId = form.watch("department_id");
  const watchedClassId = form.watch("academic_class_id");

  // Load sections whenever Program + Department + Class/Year are all set;
  // clear them otherwise. Never auto-selects an option.
  useEffect(() => {
    if (watchedProgramId && watchedDepartmentId && watchedClassId) {
      fetchSections(watchedProgramId, watchedDepartmentId, watchedClassId);
    } else {
      setClassSections([]);
    }
  }, [watchedProgramId, watchedDepartmentId, watchedClassId, fetchSections]);

  const sectionItems = useMemo(
    () => classSections.map((s) => ({ value: s.id, label: s.name })),
    [classSections],
  );

  const handleProgramChange = (programId: string | null) => {
    const selectedProgramId = programId ?? "";
    form.setValue("program_id", selectedProgramId);
    form.setValue("department_id", "");
    form.setValue("academic_class_id", "");
    form.setValue("section_id", "");
    setProgramDepartments([]);
    setDepartmentClasses([]);
    setClassSections([]);
    if (selectedProgramId) fetchDepartments(selectedProgramId);
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const selectedDepartmentId = departmentId ?? "";
    form.setValue("department_id", selectedDepartmentId);
    form.setValue("academic_class_id", "");
    form.setValue("section_id", "");
    setDepartmentClasses([]);
    setClassSections([]);
    if (selectedDepartmentId) fetchClasses(selectedDepartmentId);
  };

  const handleClassChange = (classId: string | null) => {
    form.setValue("academic_class_id", classId ?? "");
    form.setValue("section_id", "");
    setClassSections([]);
  };

  useEffect(() => {
    if (defaultValues?.program_id) {
      fetchDepartments(defaultValues.program_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.program_id, fetchDepartments]);

  // Edit mode: load classes for the pre-selected department
  useEffect(() => {
    if (defaultValues?.department_id) {
      fetchClasses(defaultValues.department_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValues?.department_id, fetchClasses]);

  return (
    <form id="exam-config-form" onSubmit={form.handleSubmit(handleSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="program_id"
          control={form.control}
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Program *</FieldLabel>
                <Select
                  onValueChange={handleProgramChange}
                  value={field.value || undefined}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select a program">
                      {
                        programs.find((program) => program.id === field.value)
                          ?.program_name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((program) => (
                      <SelectItem key={program.id} value={program.id}>
                        {program.program_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        <Controller
          name="department_id"
          control={form.control}
          render={({ field, fieldState }) => {
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Department *</FieldLabel>
                <Select
                  onValueChange={handleDepartmentChange}
                  value={field.value || undefined}
                  disabled={!form.watch("program_id") || loadingDepartments}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select a department">
                      {
                        programDepartments.find(
                          (department) => department.id === field.value,
                        )?.department_name
                      }
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {programDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.department_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        {/* Class/Year — shown under Department, filtered by the selected department */}
        <Controller
          name="academic_class_id"
          control={form.control}
          render={({ field, fieldState }) => {
            const selectedClass = departmentClasses.find(
              (cls) => cls.id === field.value,
            );
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Class/Year *</FieldLabel>
                <Select
                  onValueChange={handleClassChange}
                  value={field.value || undefined}
                  disabled={!form.watch("department_id") || loadingClasses}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select a class">
                      {selectedClass?.class_name}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {departmentClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        {/* Section — optional, depends on Program + Department + Class/Year */}
        <Controller
          name="section_id"
          control={form.control}
          render={({ field, fieldState }) => {
            const selectedSectionId = field.value || "";
            const selectedSection = classSections.find(
              (section) => section.id === selectedSectionId,
            );
            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Section</FieldLabel>
                <Select
                  items={sectionItems}
                  onValueChange={(value) => field.onChange(value ?? "")}
                  value={field.value || undefined}
                  disabled={!watchedClassId || loadingSections}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={
                        !watchedClassId ? "Select class first" : "Select section"
                      }
                    >
                      {selectedSectionId
                        ? (selectedSection?.name ?? "Select section")
                        : undefined}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {!watchedClassId ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Select a class first
                      </div>
                    ) : loadingSections ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        Loading...
                      </div>
                    ) : classSections.length === 0 ? (
                      <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                        No sections found
                      </div>
                    ) : (
                      classSections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        <Controller
          name="exam_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid || !!serverError}>
              <FieldLabel htmlFor={field.name}>Exam Name *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. 1st In Course"
                aria-invalid={fieldState.invalid || !!serverError}
                onChange={(e) => {
                  onServerErrorClear?.();
                  field.onChange(e);
                }}
              />
              {serverError ? (
                <FieldError errors={[{ message: serverError }]} />
              ) : (
                fieldState.invalid && <FieldError errors={[fieldState.error]} />
              )}
            </Field>
          )}
        />

        <Controller
          name="exam_date"
          control={form.control}
          render={({ field, fieldState }) => {
            const formatDateForInput = (dateString: string | undefined) => {
              if (!dateString) return "";
              if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                return dateString;
              }
              const date = new Date(dateString);
              if (isNaN(date.getTime())) return "";
              const year = date.getFullYear();
              const month = String(date.getMonth() + 1).padStart(2, "0");
              const day = String(date.getDate()).padStart(2, "0");
              return `${year}-${month}-${day}`;
            };

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Exam Date *</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="date"
                  value={formatDateForInput(field.value)}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            );
          }}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEditMode ? "Updating..." : "Creating..."}
            </>
          ) : isEditMode ? (
            "Update Exam"
          ) : (
            "Add Exam"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ExamConfigForm;