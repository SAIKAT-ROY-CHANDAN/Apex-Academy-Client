'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  expenseTypeSchema,
  ExpenseTypeFormInput,
  ExpenseTypeFormValues,
} from './schema/expense-type.schema';
import { Field, FieldLabel, FieldError, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ExpenseTypeFormProps {
  onSubmit: (values: ExpenseTypeFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const ExpenseTypeForm = ({ onSubmit, isSubmitting }: ExpenseTypeFormProps) => {
  const form = useForm<ExpenseTypeFormInput, any, ExpenseTypeFormValues>({
    resolver: zodResolver(expenseTypeSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <form id="expense-type-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Expense Type Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Utilities"
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
            'Create Expense Type'
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default ExpenseTypeForm;