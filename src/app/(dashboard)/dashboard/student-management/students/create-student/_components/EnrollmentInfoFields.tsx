'use client';

import { useCallback, useEffect, useState } from 'react';
import { Control, Controller, useWatch, UseFormSetValue, useFormState } from 'react-hook-form';
import { Field, FieldLabel, FieldError } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CreateStudentFormInput } from './schema/student.schema';
import { Batch, Shift } from './types/student';
import { AcademicSession } from '@/app/(dashboard)/dashboard/settings/system/session-config/_components/types/academic-session';
import { AcademicClass, Department, Program } from '@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types';
import { AcademicSection } from '@/app/(dashboard)/dashboard/settings/system/section-config/_components/types/academic-section';
import { getPrograms } from '@/services/program';
import { getDepartmentByProgramId } from '@/services/department';
import { getAcademicClassDetails, getClassesByDepartmentId } from '@/services/academicClass';
import { getAcademicSections } from '@/services/academicSection';

interface EnrollmentInfoFieldsProps {
  control: Control<CreateStudentFormInput>;
  setValue: UseFormSetValue<CreateStudentFormInput>;
  academicSessions: AcademicSession[];
  batches: Batch[];
  shifts: Shift[];
}

const RequiredMark = () => <span className="text-destructive">*</span>;
const digitsOnly = (value: string) => value.replace(/\D/g, "");

const EnrollmentInfoFields = ({
  control,
  setValue,
  academicSessions,
  batches,
  shifts,
}: EnrollmentInfoFieldsProps) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [academicSections, setAcademicSections] = useState<AcademicSection[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  // Watch form values for persistence
  const watchedProgramId = useWatch({ control, name: 'enrollment.program_id' });
  const watchedDepartmentId = useWatch({ control, name: 'enrollment.department_id' });
  const watchedClassId = useWatch({ control, name: 'enrollment.academic_class_id' });

  const isSubmitted = useFormState({ control }).isSubmitted;

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

  // Fetch sections when a class is selected
  const fetchSections = useCallback(async (classId: string) => {
    if (!classId) {
      setAcademicSections([]);
      return;
    }

    setLoadingSections(true);
    try {
      const response = await getAcademicSections([
        {
          label: "filter",
          value: JSON.stringify({
            class_id: classId,
          }),
        },
      ]);
      setAcademicSections(response?.data ?? []);
    } catch (error) {
      console.error('Error fetching academic sections:', error);
      setAcademicSections([]);
    } finally {
      setLoadingSections(false);
    }
  }, []);

  // Initialize departments when program changes
  useEffect(() => {
    if (watchedProgramId) {
      fetchDepartments(watchedProgramId);
    } else {
      setDepartments([]);
      setAcademicClasses([]);
      setAcademicSections([]);
    }
  }, [watchedProgramId, fetchDepartments]);

  // Initialize classes when department changes
  useEffect(() => {
    if (watchedDepartmentId) {
      fetchClasses(watchedDepartmentId);
    } else {
      setAcademicClasses([]);
      setAcademicSections([]);
    }
  }, [watchedDepartmentId, fetchClasses]);

  // Initialize sections when class changes
  useEffect(() => {
    if (watchedClassId) {
      fetchSections(watchedClassId);
    } else {
      setAcademicSections([]);
    }
  }, [watchedClassId, fetchSections]);

  const handleProgramChange = (programId: string | null) => {
    const id = programId ?? undefined;
    setValue('enrollment.program_id', id, { shouldDirty: true });
    setValue('enrollment.department_id', undefined, { shouldDirty: true });
    setValue('enrollment.academic_class_id', '', { shouldDirty: true });
    setValue('enrollment.academic_section_id', undefined, { shouldDirty: true });
    if (id) {
      fetchDepartments(id);
    }
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? undefined;
    setValue('enrollment.department_id', id, { shouldDirty: true });
    setValue('enrollment.academic_class_id', '', { shouldDirty: true });
    setValue('enrollment.academic_section_id', undefined, { shouldDirty: true });
    if (id) {
      fetchClasses(id);
    }
  };

  const handleClassChange = (classId: string | null) => {
    const id = classId ?? undefined;
    setValue('enrollment.academic_class_id', id ?? '', { shouldDirty: true });
    setValue('enrollment.academic_section_id', undefined, { shouldDirty: true });
    if (id) {
      fetchSections(id);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enrollment Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="enrollment.academic_session_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Academic Session <RequiredMark />
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value ?? null}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {academicSessions.find((p) => p.id === field.value)?.session_name ?? "Select a session"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicSessions.map((session) => (
                      <SelectItem key={session.id} value={session.id}>
                        {session.session_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Program */}
          <Field>
            <FieldLabel htmlFor="program_id">Program <RequiredMark /></FieldLabel>
            <Select
              onValueChange={handleProgramChange}
              value={watchedProgramId ?? null}
              disabled={loadingPrograms}
            >
              <SelectTrigger id="program_id">
                <SelectValue>
                  {programs.find((p) => p.id === watchedProgramId)?.program_name ??
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
            <FieldLabel htmlFor="department_id">Department <RequiredMark /></FieldLabel>
            <Select
              onValueChange={handleDepartmentChange}
              value={watchedDepartmentId ?? null}
              disabled={!watchedProgramId || loadingDepartments}
            >
              <SelectTrigger id="department_id">
                <SelectValue>
                  {departments.find((d) => d.id === watchedDepartmentId)?.department_name ??
                    (!watchedProgramId
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

          <Controller
            name="enrollment.academic_class_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Academic year / Class <RequiredMark />
                </FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    handleClassChange(value);
                  }}
                  value={field.value ?? null}
                  disabled={!watchedDepartmentId || loadingClasses}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {academicClasses.find((p) => p.id === field.value)?.class_name ??
                        (!watchedDepartmentId
                          ? 'Select a department first'
                          : loadingClasses
                            ? 'Loading classes...'
                            : 'Select a class')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicClasses.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="enrollment.academic_section_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Academic Section</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? null}
                  disabled={!watchedClassId || loadingSections}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {academicSections.find((p) => p.id === field.value)?.section_name ??
                        (!watchedClassId
                          ? 'Select a class first'
                          : loadingSections
                            ? 'Loading sections...'
                            : 'Select a section')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {academicSections.map((section) => (
                      <SelectItem key={section.id} value={section.id}>
                        {section.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="enrollment.batch_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>
                  Batch <RequiredMark />
                </FieldLabel>
                <Select onValueChange={field.onChange} value={field.value ?? null}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {batches.find((p) => p.id === field.value)?.batch_name ?? "Select a batch"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {batches.map((batch) => (
                      <SelectItem key={batch.id} value={batch.id}>
                        {batch.batch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="enrollment.shift_id"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Shift</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value ?? null}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue>
                      {shifts.find((p) => p.id === field.value)?.name ?? "Select a shift"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {shifts.map((shift) => (
                      <SelectItem key={shift.id} value={shift.id}>
                        {shift.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <Controller
            name="enrollment.roll_number"
            control={control}
            render={({ field, fieldState }) => {
              const showError = isSubmitted || fieldState.isTouched || fieldState.isDirty;
              return (
                <Field data-invalid={showError && fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Roll Number <RequiredMark />
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(event) => field.onChange(digitsOnly(event.target.value))}
                    aria-invalid={showError && fieldState.invalid}
                  />
                  {showError && fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="enrollment.registration_number"
            control={control}
            render={({ field, fieldState }) => {
              const showError = isSubmitted || fieldState.isTouched || fieldState.isDirty;
              return (
                <Field data-invalid={showError && fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Registration Number
                  </FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    value={field.value ?? ''}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    onChange={(event) => field.onChange(digitsOnly(event.target.value))}
                    aria-invalid={showError && fieldState.invalid}
                  />
                  {showError && fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />

          <Controller
            name="enrollment.merit_position"
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Merit Position</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  value={(field.value ?? '') as string | number}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(event) => {
                    const value = digitsOnly(event.target.value);
                    field.onChange(value === '' ? '' : Number(value));
                  }}
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

      </CardContent>
    </Card>
  );
};

export default EnrollmentInfoFields;