'use client';

import { useCallback, useMemo, useState } from 'react';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  subjectSchema,
  SubjectFormInput,
  SubjectFormValues,
} from './schema/subject.schema';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, X } from 'lucide-react';
import { AcademicClass, Department, Program } from '../../class-config/_components/types/types';
import { getDepartmentByProgramId } from '@/services/department';

interface SubjectFormProps {
  programs: Program[];
  academicClasses: AcademicClass[];
  onSubmit: (values: SubjectFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const SubjectForm = ({ programs, academicClasses, onSubmit, isSubmitting }: SubjectFormProps) => {
  const form = useForm<SubjectFormInput, any, SubjectFormValues>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      program_id: '',
      department_id: '',
      class_id: '',
      subjects: [{ value: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'subjects',
  });

  const [programDepartments, setProgramDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const selectedProgramId = form.watch('program_id');
  const selectedDepartmentId = form.watch('department_id');

  // Fetch departments when a program is selected
  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setProgramDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      setProgramDepartments(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setProgramDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const handleProgramChange = (programId: string | null) => {
    const id = programId ?? '';
    form.setValue('program_id', id);
    form.setValue('department_id', '');
    form.setValue('class_id', '');
    setProgramDepartments([]);
    if (id) {
      fetchDepartments(id);
    }
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? '';
    form.setValue('department_id', id);
    form.setValue('class_id', '');
  };

  // Filter classes by the selected department
  const departmentClasses = useMemo(() => {
    if (!selectedDepartmentId) return [];
    return academicClasses.filter((cls) => cls.department_id === selectedDepartmentId);
  }, [academicClasses, selectedDepartmentId]);

  return (
    <form id="subject-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        {/* Row 1: Program | Department */}
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="program_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Program</FieldLabel>
                <Select onValueChange={handleProgramChange} value={field.value || undefined}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {programs.find((p) => p.id === field.value)?.program_name ?? "Select a program"}
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
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="department_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                <Select
                  onValueChange={handleDepartmentChange}
                  value={field.value || undefined}
                  disabled={!selectedProgramId || loadingDepartments}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {programDepartments.find((d) => d.id === field.value)?.department_name ??
                        (!selectedProgramId
                          ? "Select a program first"
                          : loadingDepartments
                            ? "Loading departments..."
                            : "Select a department")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {programDepartments.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-muted-foreground">
                        {selectedProgramId ? "No departments for this program" : "Select a program first"}
                      </div>
                    ) : (
                      programDepartments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.department_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Row 2: Class */}
        <Controller
          name="class_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Year/ Class</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
                disabled={!selectedDepartmentId}
              >
                <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                  <SelectValue>
                    {departmentClasses.find((c) => c.id === field.value)?.class_name ??
                      (!selectedDepartmentId
                        ? "Select a department first"
                        : "Select a class")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {departmentClasses.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      {selectedDepartmentId ? "No classes for this department" : "Select a department first"}
                    </div>
                  ) : (
                    departmentClasses.map((academicClass) => (
                      <SelectItem key={academicClass.id} value={academicClass.id}>
                        {academicClass.class_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="space-y-3">
          <FieldLabel>Subjects</FieldLabel>

          {fields.map((item, index) => (
            <Controller
              key={item.id}
              name={`subjects.${index}.value`}
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <div className="flex items-center gap-2">
                    <Input
                      {...field}
                      placeholder={`e.g. ${index === 0 ? 'Bangla' : 'English'}`}
                      aria-invalid={fieldState.invalid}
                    />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label="Remove subject"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          ))}

          {form.formState.errors.subjects?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.subjects.root.message}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ value: '' })}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add more subject
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Subjects'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default SubjectForm;