'use client';

import { useCallback, useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  academicSectionSchema,
  AcademicSectionFormInput,
  AcademicSectionFormValues,
} from './schema/academic-section.schema';
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
import { getPrograms } from '@/services/program';
import { getDepartmentByProgramId } from '@/services/department';
import { getAcademicClassDetails, getClassesByDepartmentId } from '@/services/academicClass';
import { AcademicClass, Department, Program } from '../../class-config/_components/types/types';

interface AcademicSectionFormProps {
  onSubmit: (values: AcademicSectionFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const AcademicSectionForm = ({
  onSubmit,
  isSubmitting,
}: AcademicSectionFormProps) => {
  const form = useForm<AcademicSectionFormInput, any, AcademicSectionFormValues>({
    resolver: zodResolver(academicSectionSchema),
    defaultValues: {
      section_name: '',
      class_id: undefined,
    },
  });

  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('');

  // Load all programs on initial mount
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const response = await getPrograms([]);
        setPrograms(response?.data ?? []);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  // Fetch departments when a program is selected
  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      setDepartments(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  // Fetch classes when a department is selected
  const fetchClasses = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setAcademicClasses([]);
      return;
    }

    setLoadingClasses(true);
    try {
      const response = await getClassesByDepartmentId(departmentId);
      setAcademicClasses(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching academic classes:', error);
      setAcademicClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const handleProgramChange = (programId: string | null) => {
    const id = programId ?? '';
    setSelectedProgramId(id);
    setSelectedDepartmentId('');
    setDepartments([]);
    setAcademicClasses([]);
    form.setValue('class_id', '');
    if (id) {
      fetchDepartments(id);
    }
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? '';
    setSelectedDepartmentId(id);
    setAcademicClasses([]);
    form.setValue('class_id', '');
    if (id) {
      fetchClasses(id);
    }
  };

  return (
    <form id="academic-section-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="section_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Section Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Section A"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Program */}
          <Field>
            <FieldLabel htmlFor="program_id">Program</FieldLabel>
            <Select
              onValueChange={handleProgramChange}
              value={selectedProgramId || undefined}
              disabled={loadingPrograms}
            >
              <SelectTrigger id="program_id">
                <SelectValue>
                  {programs.find((p) => p.id === selectedProgramId)?.program_name ??
                    (loadingPrograms ? 'Loading programs...' : 'Select a program')}
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
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Department */}
          <Field>
            <FieldLabel htmlFor="department_id">Department</FieldLabel>
            <Select
              onValueChange={handleDepartmentChange}
              value={selectedDepartmentId || undefined}
              disabled={!selectedProgramId || loadingDepartments}
            >
              <SelectTrigger id="department_id">
                <SelectValue>
                  {departments.find((d) => d.id === selectedDepartmentId)?.department_name ??
                    (!selectedProgramId
                      ? 'Select a program first'
                      : loadingDepartments
                        ? 'Loading departments...'
                        : 'Select a department')}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          {/* Class */}
          <Controller
            name="class_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Year /Class</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                  disabled={!selectedDepartmentId || loadingClasses}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {academicClasses.find((c) => c.id === field.value)?.class_name ??
                        (!selectedDepartmentId
                          ? 'Select a department first'
                          : loadingClasses
                            ? 'Loading classes...'
                            : 'Select a class')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicClasses.map((academicClass) => (
                      <SelectItem key={academicClass.id} value={academicClass.id}>
                        {academicClass.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Section'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default AcademicSectionForm;