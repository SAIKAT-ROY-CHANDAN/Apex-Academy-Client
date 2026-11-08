'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  depositSchema,
  DepositFormInput,
  DepositFormValues,
} from './schema/deposit.schema';
import { displayToIso, parseDisplayDate } from '../../_utils/date';
import { calculateTotal } from '../../_utils/total';
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Plus, Trash2, Calendar as CalendarIcon } from 'lucide-react';
import { TDepositType } from '../../deposit-type/_components/Types/deposit-type';

interface DepositFormProps {
  depositTypes: TDepositType[];
  onSubmit: (values: DepositFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const DepositForm = ({ depositTypes, onSubmit, isSubmitting }: DepositFormProps) => {
  const form = useForm<DepositFormInput, any, DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: {
      deposit_type_id: '',
      total_amount: undefined,
      deposit_date: '',
      description: '',
      depositItems: [{ item_name: '', item_amount: undefined, description: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'depositItems',
  });

  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const watchedItems = useWatch({
    control: form.control,
    name: 'depositItems',
  });

  const calculatedTotal = calculateTotal(watchedItems as any);

  useEffect(() => {
    form.setValue('total_amount', calculatedTotal, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [calculatedTotal, form]);

  const handleFormSubmit = (values: DepositFormValues) => {
    return onSubmit({ ...values, deposit_date: displayToIso(values.deposit_date), total_amount: calculatedTotal });
  };

  return (
    <form id="deposit-form" onSubmit={form.handleSubmit(handleFormSubmit)}>
      <FieldGroup className="gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="deposit_date"
            control={form.control}
            render={({ field, fieldState }) => {
              const parsedDate = parseDisplayDate(field.value as string);

              return (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Day</FieldLabel>
                  <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                    <div className="relative">
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="DD-MM-YYYY"
                        aria-invalid={fieldState.invalid}
                        className="pr-10"
                      />
                      <PopoverTrigger
                        render={
                          <button
                            type="button"
                            aria-label="Open calendar"
                            className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          >
                            <CalendarIcon className="h-4 w-4" />
                          </button>
                        }
                      />
                    </div>
                    <PopoverContent className="w-auto p-0" align="end" sideOffset={8}>
                      <Calendar
                        mode="single"
                        selected={parsedDate}
                        onSelect={(date) => {
                          if (date) {
                            field.onChange(format(date, 'dd-MM-yyyy'));
                          } else {
                            field.onChange('');
                          }
                          setDatePickerOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              );
            }}
          />

          <Controller
            name="deposit_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Deposit Type</FieldLabel>
                <Select onValueChange={field.onChange} value={field.value ?? undefined}>
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select One">
                      {depositTypes.find((dt) => dt.id === field.value)?.name ?? "Select One"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {depositTypes.map((depositType) => (
                      <SelectItem key={depositType.id} value={depositType.id}>
                        {depositType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        <Controller
          name="description"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Details</FieldLabel>
              <textarea
                {...field}
                id={field.name}
                placeholder="Write here..."
                aria-invalid={fieldState.invalid}
                className="flex min-h-20 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <FieldLabel>Deposit Items</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({ item_name: '', item_amount: undefined, description: '' })
              }
            >
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>

          {fields.map((item, index) => (
            <div
              key={item.id}
              className="space-y-4 rounded-lg border border-border/50 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Item #{index + 1}
                </span>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <Controller
                name={`depositItems.${index}.item_name`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`item_name_${index}`}>Item Name</FieldLabel>
                    <Input
                      {...field}
                      id={`item_name_${index}`}
                      placeholder="e.g. Cash"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name={`depositItems.${index}.item_amount`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`item_amount_${index}`}>Item Amount</FieldLabel>
                    <Input
                      {...field}
                      id={`item_amount_${index}`}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5000"
                      value={(field.value ?? '') as string | number}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name={`depositItems.${index}.description`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`description_${index}`}>Description</FieldLabel>
                    <Input
                      {...field}
                      id={`description_${index}`}
                      placeholder="e.g. January deposit"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />
            </div>
          ))}
        </div>

        <Controller
          name="total_amount"
          control={form.control}
          render={({ fieldState }) => (
            <Field
              data-invalid={fieldState.invalid}
              className="rounded-xl border border-primary/20 bg-primary/5 p-4"
            >
              <FieldLabel htmlFor="total_amount" className="text-base font-bold">
                Total Amount
              </FieldLabel>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={calculatedTotal}
                readOnly
                disabled
                aria-invalid={fieldState.invalid}
                className="h-11 bg-white text-base font-bold disabled:opacity-100 dark:bg-background"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="outline" disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save'
            )}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
};

export default DepositForm;
