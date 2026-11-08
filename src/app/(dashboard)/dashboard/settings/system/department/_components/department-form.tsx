'use client';

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
import { Program } from '../../program-config/_components/types/type';
import { DepartmentFormInput, DepartmentFormValues, departmentSchema } from './schema/department.schema';

interface DepartmentFormProps {
    programs: Program[];
    onSubmit: (values: DepartmentFormValues) => Promise<void>;
    isSubmitting?: boolean;
}

const DepartmentForm = ({ programs, onSubmit, isSubmitting }: DepartmentFormProps) => {
    const form = useForm<DepartmentFormInput, any, DepartmentFormValues>({
        resolver: zodResolver(departmentSchema),
        defaultValues: {
            department_name: '',
            program_id: undefined,
        },
    });

    return (
        <form id="department-form" onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-5">
                <div className="grid grid-cols-2 gap-4">
                    <Controller
                        name="department_name"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid}>
                                <FieldLabel htmlFor={field.name}>Department Name</FieldLabel>
                                <Input
                                    {...field}
                                    id={field.name}
                                    placeholder="e.g. Computer Science"
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

                                <Select
                                    value={field.value}
                                    onValueChange={field.onChange}
                                >
                                    <SelectTrigger>
                                        <SelectValue>
                                            {programs.find((p) => p.id === field.value)?.program_name ?? "Select a program"}
                                        </SelectValue>
                                    </SelectTrigger>

                                    <SelectContent>
                                        {programs.map((program) => (
                                            <SelectItem
                                                key={program.id}
                                                value={program.id}
                                            >
                                                {program.program_name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <FieldError errors={[fieldState.error]} />
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
                        'Create Department'
                    )}
                </Button>
            </FieldGroup>
        </form>
    );
};

export default DepartmentForm;