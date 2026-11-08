'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { ProgramFormInput, ProgramFormValues, programSchema } from './schema';

interface ProgramFormProps {
  onSubmit: (values: ProgramFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const ProgramForm = ({ onSubmit, isSubmitting }: ProgramFormProps) => {
  const form = useForm<ProgramFormInput, any, ProgramFormValues>({
    resolver: zodResolver(programSchema),
    defaultValues: {
      program_name: '',
      duration_years: undefined,
    },
  });

  return (
    <form id="program-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="program_name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Program Name</FieldLabel>
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
            name="duration_years"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Duration (Years)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  placeholder="e.g. 4"
                  value={(field.value ?? '') as string | number}
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
              Creating...
            </>
          ) : (
            'Create Program'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ProgramForm;