"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  homeworkSchema,
  HomeworkFormInput,
  HomeworkFormValues,
} from "@/validation/teacher/homework.validation";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldGroup,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { TProgram, TDepartment } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";

interface HomeworkFormProps {
  mode?: string;
  teacherId: string;
  programs?: TProgram[];
  classes?: TAcademicClass[];
  onSubmit: (values: HomeworkFormValues) => Promise<void>;
  isSubmitting?: boolean;
  defaultValues?: Partial<HomeworkFormValues>;
  submitLabel?: string;
  isLoading?: boolean;
}

const HomeworkForm = ({
  mode,
  teacherId,
  programs = [],
  classes = [],
  onSubmit,
  isSubmitting,
  defaultValues,
  submitLabel = "Add Homework",
  isLoading,
}: HomeworkFormProps) => {
  const router = useRouter();
  const isUniversity = mode === "COLLEGE_UNIVERSITY";

  const form = useForm<HomeworkFormInput, any, HomeworkFormValues>({
    resolver: zodResolver(homeworkSchema),
    defaultValues: {
      title: defaultValues?.title || "",
      description: defaultValues?.description || "",
      academic_class_id: defaultValues?.academic_class_id || "",
      academic_section_id: defaultValues?.academic_section_id || "",
      subject_id: defaultValues?.subject_id || "",
      teacher_id: teacherId,
      program_id: defaultValues?.program_id || "",
      department_id: defaultValues?.department_id || "",
      due_date: defaultValues?.due_date || "",
    },
  });

  const selectedProgramId = form.watch("program_id");
  const selectedDepartmentId = form.watch("department_id");
  const selectedClassId = form.watch("academic_class_id");
  const selectedSectionId = form.watch("academic_section_id");
  const selectedSubjectId = form.watch("subject_id");

  // University Mode: Program → Departments → Classes → Sections/Subjects (nested)
  const selectedProgram = useMemo(() => {
    if (!isUniversity || !selectedProgramId) return null;
    return programs.find((p) => p.id === selectedProgramId) || null;
  }, [isUniversity, programs, selectedProgramId]);

  const departments = useMemo<TDepartment[]>(() => {
    if (!isUniversity) return [];
    return selectedProgram?.departments || [];
  }, [isUniversity, selectedProgram]);

  const selectedDepartment = useMemo(() => {
    if (!selectedDepartmentId) return null;
    return departments.find((d) => d.id === selectedDepartmentId) || null;
  }, [departments, selectedDepartmentId]);

  // Classes for university come from selected department's academicClasses
  const universityClasses = useMemo<TAcademicClass[]>(() => {
    return selectedDepartment?.academicClasses || [];
  }, [selectedDepartment]);

  // Classes for school come from the classes array (flat list)
  const schoolClasses = useMemo<TAcademicClass[]>(() => {
    return classes;
  }, [classes]);

  const availableClasses = isUniversity ? universityClasses : schoolClasses;

  const selectedClass = useMemo(() => {
    if (!selectedClassId) return null;
    return availableClasses.find((c) => c.id === selectedClassId) || null;
  }, [availableClasses, selectedClassId]);

  // Sections & Subjects are nested inside the selected class
  const sections = useMemo(() => selectedClass?.academicSections || [], [selectedClass]);
  const subjects = useMemo(() => selectedClass?.subjects || [], [selectedClass]);

  // Reset dependent fields when a parent select changes
  const resetDependents = (fields: ("program_id" | "department_id" | "academic_class_id" | "academic_section_id" | "subject_id")[]) => {
    fields.forEach((field) => form.setValue(field, "", { shouldValidate: false }));
  };

  // Display labels for selected values
  const selectedProgramName = useMemo(() => {
    if (!selectedProgramId) return "";
    return programs.find((p) => p.id === selectedProgramId)?.program_name || "";
  }, [programs, selectedProgramId]);

  const selectedDepartmentName = useMemo(() => {
    if (!selectedDepartmentId) return "";
    return departments.find((d) => d.id === selectedDepartmentId)?.department_name || "";
  }, [departments, selectedDepartmentId]);

  const selectedClassName = useMemo(() => {
    if (!selectedClassId) return "";
    return availableClasses.find((c) => c.id === selectedClassId)?.class_name || "";
  }, [availableClasses, selectedClassId]);

  const selectedSectionName = useMemo(() => {
    if (!selectedSectionId) return "";
    return sections.find((s) => s.id === selectedSectionId)?.section_name || "";
  }, [sections, selectedSectionId]);

  const selectedSubjectName = useMemo(() => {
    if (!selectedSubjectId) return "";
    return subjects.find((s) => s.id === selectedSubjectId)?.name || "";
  }, [subjects, selectedSubjectId]);

  return (
    <form id="homework-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <div className="grid grid-cols-2 gap-4">
          {/* Program - University only */}
          {isUniversity && (
            <Controller
              name="program_id"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Program</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      resetDependents(["department_id", "academic_class_id", "academic_section_id", "subject_id"]);
                    }}
                    value={field.value}
                    items={programs.map((p) => ({ value: p.id, label: p.program_name }))}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder="Select a program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.program_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          )}

          {/* Department - University only */}
          {isUniversity && (
            <Controller
              name="department_id"
              control={form.control}
              render={({ field }) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      resetDependents(["academic_class_id", "academic_section_id", "subject_id"]);
                    }}
                    value={field.value}
                    disabled={!selectedProgramId}
                    items={departments.map((d) => ({ value: d.id, label: d.department_name }))}
                  >
                    <SelectTrigger id={field.name}>
                      <SelectValue placeholder={selectedProgramId ? "Select a department" : "Select a program first"} />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.length === 0 ? (
                        <div className="px-3 py-2 text-xs text-muted-foreground">
                          {selectedProgramId ? "No departments for this program" : "Select a program first"}
                        </div>
                      ) : (
                        departments.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.department_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </Field>
              )}
            />
          )}

          {/* Class */}
          <Controller
            name="academic_class_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Class/Year *</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    resetDependents(["academic_section_id", "subject_id"]);
                  }}
                  value={field.value}
                  disabled={isUniversity && !selectedDepartmentId}
                  items={availableClasses.map((cls) => ({ value: cls.id, label: cls.class_name }))}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder={isUniversity && !selectedDepartmentId ? "Select a department first" : "Select a class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        {isUniversity && !selectedDepartmentId ? "Select a department first" : "No classes available"}
                      </div>
                    ) : (
                      availableClasses.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.class_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          {/* Section - nested in class */}
          <Controller
            name="academic_section_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Section</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedClassId}
                  items={sections.map((s) => ({ value: s.id, label: s.section_name }))}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder={selectedClassId ? "Select a section" : "Select a class first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        {selectedClassId ? "No sections for this class" : "Select a class first"}
                      </div>
                    ) : (
                      sections.map((section) => (
                        <SelectItem key={section.id} value={section.id}>
                          {section.section_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Subject - nested in class */}
        <Controller
          name="subject_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Course Code *</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedClassId}
                items={subjects.map((s) => ({ value: s.id, label: s.name }))}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder={selectedClassId ? "Select a course code" : "Select a class first"} />
                </SelectTrigger>
                <SelectContent>
                  {subjects.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      {selectedClassId ? "No subjects for this class" : "Select a class first"}
                    </div>
                  ) : (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="due_date"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Due Date *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="datetime-local"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        
        <Controller
          name="title"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Title *</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Chapter 5 Exercise"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Description *</FieldLabel>
              <Textarea
                {...field}
                id={field.name}
                placeholder="Write the homework details..."
                className="min-h-28 resize-y"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        

        <div className="flex items-center justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-5"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="h-10 px-5">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default HomeworkForm;