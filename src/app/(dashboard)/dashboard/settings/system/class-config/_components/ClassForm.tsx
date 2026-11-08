'use client';

import { useCallback, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Loader2 } from 'lucide-react';
import { getDepartmentByProgramId } from '@/services/department';
import { type AcademicClassFormInput, type AcademicClassFormValues, getAcademicClassSchema, type InstitutionType } from './schema/academic-class.schema';
import type { Department, Program } from './types/types';

interface ClassFormProps {
  institutionType?: InstitutionType | null;
  programs: Program[];
  departments: Department[];
  onSubmit: (values: AcademicClassFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const ClassForm = ({
  institutionType,
  programs,
  onSubmit,
  isSubmitting,
}: ClassFormProps) => {
  const isSchool = institutionType?.toUpperCase() === 'SCHOOL';
  const schema = useMemo(() => getAcademicClassSchema(institutionType), [institutionType]);

  const form = useForm<AcademicClassFormInput, any, AcademicClassFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      class_name: '',
      class_level: undefined,
      year_level: undefined,
      program_id: undefined,
      department_id: undefined,
      group: undefined,
    },
  });

  const [programDepartments, setProgramDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

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
    form.setValue('program_id', id || undefined);
    form.setValue('department_id', undefined);
    setProgramDepartments([]);
    if (id) {
      fetchDepartments(id);
    }
  };

  return (
    <form id="class-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        {/* Row 1: Class Name — full width */}
        <Controller
          name="class_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Year Or Class Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. First Year, Second Year, etc."
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {isSchool ? (
          /* Row 2: Class Level | Group */
          <div className="grid grid-cols-2 gap-4">
            <Controller
              name="class_level"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Class Level</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    placeholder="e.g. 9"
                    value={(field.value ?? '') as string | number}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="group"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Group</FieldLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select a group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SCIENCE">Science</SelectItem>
                      <SelectItem value="COMMERCE">Commerce</SelectItem>
                      <SelectItem value="ARTS">Arts</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </div>
        ) : (
          <>
            {/* Row 2: Year Level | Department */}
            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="year_level"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Year or Class Level</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      placeholder="e.g. 1"
                      value={(field.value ?? '') as string | number}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name="program_id"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Program</FieldLabel>
                    <Select onValueChange={handleProgramChange} value={field.value ?? undefined}>
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
            </div>

            {/* Row 3: Department — full width */}
            <Controller
              name="department_id"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Department</FieldLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value ?? undefined}
                    disabled={!form.watch('program_id') || loadingDepartments}
                  >
                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                      <SelectValue>
                        {programDepartments.find((d) => d.id === field.value)?.department_name ??
                          (!form.watch('program_id')
                            ? "Select a program first"
                            : loadingDepartments
                              ? "Loading departments..."
                              : "Select a department")}
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
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

          </>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Class'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ClassForm;