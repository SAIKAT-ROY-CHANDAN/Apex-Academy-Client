'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  depositTypeSchema,
  DepositTypeFormInput,
  DepositTypeFormValues,
} from './schema/deposit-type.schema';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface DepositTypeFormProps {
  onSubmit: (values: DepositTypeFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const DepositTypeForm = ({ onSubmit, isSubmitting }: DepositTypeFormProps) => {
  const form = useForm<DepositTypeFormInput, any, DepositTypeFormValues>({
    resolver: zodResolver(depositTypeSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <form id="deposit-type-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Deposit Type Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Tuition Fee"
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
            'Create Deposit Type'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default DepositTypeForm;