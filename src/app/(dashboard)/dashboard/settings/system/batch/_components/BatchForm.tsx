'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  batchSchema,
  BatchFormInput,
  BatchFormValues,
} from './schema/batch.schema';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BatchFormProps {
  onSubmit: (values: BatchFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const BatchForm = ({ onSubmit, isSubmitting }: BatchFormProps) => {
  const form = useForm<BatchFormInput, any, BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batch_name: '',
    },
  });

  return (
    <form id="batch-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="batch_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Batch Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. 6th,7th,8th"
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
            'Create Batch'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default BatchForm;