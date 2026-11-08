'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { AcademicSessionFormInput, AcademicSessionFormValues, academicSessionSchema } from './validations/academic-session.schema';

interface AcademicSessionFormProps {
  onSubmit: (values: AcademicSessionFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const AcademicSessionForm = ({ onSubmit, isSubmitting }: AcademicSessionFormProps) => {
  const form = useForm<AcademicSessionFormInput, any, AcademicSessionFormValues>({
    resolver: zodResolver(academicSessionSchema),
    defaultValues: {
      session_name: '',
    },
  });

  return (
    <form id="academic-session-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="session_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Session Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. 2026-2027"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            'Create Session'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default AcademicSessionForm;