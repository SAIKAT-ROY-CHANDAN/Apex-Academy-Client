'use client';

import { useForm, Controller } from 'react-hook-form';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    examScheduleSchema,
    ExamScheduleFormInput,
    ExamScheduleFormValues,
} from './schema/exam-schedule.schema';
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
import { TExamConfig } from '@/app/(dashboard)/dashboard/academics/manage-exam/_components/types/exam-config';
import { TSubject } from '@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types';
import { TClass } from '@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types';
import { Program } from '@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type';
import { Department } from '@/app/(dashboard)/dashboard/settings/system/department/_components/types';

interface ExamScheduleFormProps {
    exams: TExamConfig[];
    subjects: TSubject[];
    classes: TClass[];
    programs: Program[];
    onSubmit: (values: ExamScheduleFormValues) => Promise<void>;
    isSubmitting?: boolean;
    isEditMode?: boolean;
    defaultValues?: Partial<ExamScheduleFormValues>;
}

const ExamScheduleForm = ({
    exams,
    subjects,
    classes,
    programs,
    onSubmit,
    isSubmitting,
    isEditMode = false,
    defaultValues,
}: ExamScheduleFormProps) => {
    const form = useForm<ExamScheduleFormInput, any, ExamScheduleFormValues>({
        resolver: zodResolver(examScheduleSchema),
        defaultValues: {
            examConfigId: defaultValues?.examConfigId || '',
            program_id: defaultValues?.program_id || '',
            department_id: defaultValues?.department_id || '',
            year: defaultValues?.year || undefined,
            subjectId: defaultValues?.subjectId || '',
            examTakenYear: defaultValues?.examTakenYear || new Date().getFullYear(),
            examDate: defaultValues?.examDate || '',
            startTime: defaultValues?.startTime || '',
            endTime: defaultValues?.endTime || '',
            durationMinutes: defaultValues?.durationMinutes || 0,
            fullMarks: defaultValues?.fullMarks || 0,
            passMarks: defaultValues?.passMarks || 0,
        },
    });

    const [departments, setDepartments] = useState<Department[]>([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);

    const fetchDepartments = useCallback(async (programId: string) => {
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

    // Reset form when defaultValues change (editing a different schedule)
    useEffect(() => {
        if (defaultValues) {
            form.reset({
                examConfigId: defaultValues.examConfigId || '',
                program_id: defaultValues.program_id || '',
                department_id: defaultValues.department_id || '',
                year: defaultValues.year || undefined,
                subjectId: defaultValues.subjectId || '',
                examTakenYear: defaultValues.examTakenYear || new Date().getFullYear(),
                examDate: defaultValues.examDate || '',
                startTime: defaultValues.startTime || '',
                endTime: defaultValues.endTime || '',
                durationMinutes: defaultValues.durationMinutes || 0,
                fullMarks: defaultValues.fullMarks || 0,
                passMarks: defaultValues.passMarks || 0,
            });

            if (defaultValues.program_id) {
                fetchDepartments(defaultValues.program_id);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [defaultValues, fetchDepartments]);

    const programId = form.watch('program_id');
    const departmentId = form.watch('department_id');
    const year = form.watch('year');
    const subjectId = form.watch('subjectId');
    const examConfigId = form.watch('examConfigId');

    // Years available under the selected department — derived from classes
    const availableYears = useMemo(() => {
        if (!departmentId) return [];
        const years = classes
            .filter((cls) => cls.department_id === departmentId)
            .map((cls) => cls.year_level)
            .filter((y): y is number => y !== null && y !== undefined);
        return Array.from(new Set(years)).sort((a, b) => a - b);
    }, [classes, departmentId]);

    // The single AcademicClass resolved from program + department + year
    const resolvedClass = useMemo(() => {
        if (!programId || !departmentId || !year) return null;
        return (
            classes.find(
                (cls) =>
                    cls.program_id === programId &&
                    cls.department_id === departmentId &&
                    cls.year_level === year
            ) ?? null
        );
    }, [classes, programId, departmentId, year]);

    // Subjects filtered to the resolved class
    const filteredSubjects = useMemo(() => {
        if (!resolvedClass) return [];
        return subjects.filter((subject) => subject.class_id === resolvedClass.id);
    }, [subjects, resolvedClass]);

    // Exams filtered by the hierarchy: program -> department -> year (resolved class)
    // Primary match is the resolved academic class (a class implies its program +
    // department + year). Falls back to program+department, then to all exams, so
    // the dropdown is never empty when exam configs exist.
    const filteredExams = useMemo(() => {
        if (!programId || !departmentId || !year || !resolvedClass) return [];
        const byClass = exams.filter((exam) => exam.academic_class_id === resolvedClass.id);
        if (byClass.length > 0) return byClass;
        const byProgramDept = exams.filter(
            (exam) => exam.program_id === programId && exam.department_id === departmentId
        );
        return byProgramDept.length > 0 ? byProgramDept : exams;
    }, [exams, programId, departmentId, year, resolvedClass]);

    // Keep the currently selected exam visible even if it falls outside the filter (edit mode)
    const examOptions = useMemo(() => {
        if (!examConfigId) return filteredExams;
        if (filteredExams.some((exam) => exam.id === examConfigId)) return filteredExams;
        const currentExam = exams.find((exam) => exam.id === examConfigId);
        return currentExam ? [currentExam, ...filteredExams] : filteredExams;
    }, [filteredExams, exams, examConfigId]);

    const handleProgramChange = (newProgramId: string | null) => {
        if (!newProgramId) return;
        form.setValue('program_id', newProgramId);
        form.setValue('department_id', '');
        form.setValue('year', undefined as unknown as number);
        form.setValue('subjectId', '');
        form.setValue('examConfigId', '');
        setDepartments([]);
        fetchDepartments(newProgramId);
    };

    const handleDepartmentChange = (newDepartmentId: string | null) => {
        if (!newDepartmentId) return;
        form.setValue('department_id', newDepartmentId);
        form.setValue('year', undefined as unknown as number);
        form.setValue('subjectId', '');
        form.setValue('examConfigId', '');
    };

    const handleYearChange = (newYear: string | null) => {
        if (!newYear) return;
        form.setValue('year', Number(newYear));
        form.setValue('subjectId', '');
        form.setValue('examConfigId', '');
    };

    const handleSubmit = async (values: ExamScheduleFormValues) => {
        await onSubmit(values);
    };

    const calculateDuration = () => {
        const startTime = form.watch('startTime');
        const endTime = form.watch('endTime');

        if (startTime && endTime) {
            const start = new Date(`2000-01-01T${startTime}`);
            const end = new Date(`2000-01-01T${endTime}`);
            const diffMs = end.getTime() - start.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins > 0) {
                form.setValue('durationMinutes', diffMins);
            }
        }
    };

    return (
        <form id="exam-schedule-form" onSubmit={form.handleSubmit(handleSubmit)}>
            <FieldGroup className="gap-5">
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="program_id"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Program *</FieldLabel>
                                <Select onValueChange={handleProgramChange} value={field.value || undefined}>
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select a program">
                                            {programs.find((p) => p.id === field.value)?.program_name}
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
                                <FieldLabel htmlFor={field.name}>Department *</FieldLabel>
                                <Select
                                    onValueChange={handleDepartmentChange}
                                    value={field.value || undefined}
                                    disabled={!programId || loadingDepartments}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select a department">
                                            {departments.find((d) => d.id === field.value)?.department_name}
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
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="year"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Year *</FieldLabel>
                                <Select
                                    onValueChange={handleYearChange}
                                    value={field.value ? String(field.value) : undefined}
                                    disabled={!departmentId || availableYears.length === 0}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select a year" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {availableYears.map((y) => (
                                            <SelectItem key={y} value={String(y)}>
                                                {y}
                                                {getOrdinalSuffix(y)} Year
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="subjectId"
                        control={form.control}
                        render={({ field, fieldState }) => {
                            const selectedSubject =
                                subjects.find((s) => s.id === field.value) ??
                                filteredSubjects.find((s) => s.id === field.value);
                            return (
                                <Field data-invalid={fieldState.invalid}>
                                    <FieldLabel htmlFor={field.name}>Course Code *</FieldLabel>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value || undefined}
                                        disabled={!resolvedClass}
                                    >
                                        <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                            <SelectValue placeholder="Select a subject">
                                                {selectedSubject?.name}
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredSubjects.map((subject) => (
                                                <SelectItem key={subject.id} value={subject.id}>
                                                    {subject.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            );
                        }}
                    />
                </div>

                {/* Exam Name — last step of the hierarchy: program -> department -> year -> subject -> exam */}
                <Controller
                    name="examConfigId"
                    control={form.control}
                    render={({ field, fieldState }) => {
                        const selectedExam = exams.find((exam) => exam.id === field.value);
                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Exam Type *</FieldLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || undefined}
                                    disabled={!subjectId || examOptions.length === 0}
                                >
                                    <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                                        <SelectValue placeholder="Select an exam">
                                            {selectedExam?.exam_name}
                                        </SelectValue>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {examOptions.map((exam) => (
                                            <SelectItem key={exam.id} value={exam.id}>
                                                {exam.exam_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        );
                    }}
                />

                {/* NEW: Exam Taken Year */}
                <Controller
                    name="examTakenYear"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Exam Year *</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                type="number"
                                placeholder="e.g. 2026"
                                value={field.value ?? ''}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <Controller
                    name="examDate"
                    control={form.control}
                    render={({ field, fieldState }) => {
                        const formatDateForInput = (dateString: string | undefined) => {
                            if (!dateString) return '';
                            if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
                                return dateString;
                            }
                            const date = new Date(dateString);
                            if (isNaN(date.getTime())) return '';
                            const y = date.getFullYear();
                            const m = String(date.getMonth() + 1).padStart(2, '0');
                            const d = String(date.getDate()).padStart(2, '0');
                            return `${y}-${m}-${d}`;
                        };

                        return (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Date *</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="date"
                                    value={formatDateForInput(field.value)}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        );
                    }}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="startTime"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Start Time *</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="time"
                                    onChange={(e) => {
                                        field.onChange(e);
                                        calculateDuration();
                                    }}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="endTime"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>End Time *</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="time"
                                    onChange={(e) => {
                                        field.onChange(e);
                                        calculateDuration();
                                    }}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>

                <Controller
                    name="durationMinutes"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>Duration (minutes) *</FieldLabel>
                            <Input
                                {...field}
                                id={field.name}
                                type="number"
                                placeholder="e.g. 45"
                                value={field.value}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                aria-invalid={fieldState.invalid}
                            />
                            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </Field>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="fullMarks"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Full Marks *</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 100"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />

                    <Controller
                        name="passMarks"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Pass Marks *</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    type="number"
                                    step="0.01"
                                    placeholder="e.g. 40"
                                    value={field.value}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                </div>

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {isEditMode ? 'Updating...' : 'Creating...'}
                        </>
                    ) : isEditMode ? (
                        'Update Exam Schedule'
                    ) : (
                        'Add Exam Schedule'
                    )}
                </Button>
            </FieldGroup>
        </form>
    );
};

const getOrdinalSuffix = (num: number): string => {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const v = num % 100;
    return suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0];
};

export default ExamScheduleForm;