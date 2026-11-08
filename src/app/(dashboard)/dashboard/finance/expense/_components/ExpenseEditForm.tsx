'use client';

import { useEffect, useState, useTransition } from 'react';
import { useForm, Controller, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { toast } from 'sonner';
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
import { updateExpense } from '@/services/expense';
import { getExpenseTypes } from '@/services/expenseType';
import { TExpense } from './types/expense';
import { TExpenseType } from '../../expense-type/_components/Types/expense-type';
import {
  expenseSchema,
  ExpenseFormInput,
  ExpenseFormValues,
} from './schema/expense.schema';
import { isoToDisplay, displayToIso, parseDisplayDate } from '../../_utils/date';
import { calculateTotal } from '../../_utils/total';

interface ExpenseEditFormProps {
  expense: TExpense;
  onSuccess: () => void;
  onCancel: () => void;
}

const ExpenseEditForm = ({ expense, onSuccess, onCancel }: ExpenseEditFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [expenseTypes, setExpenseTypes] = useState<TExpenseType[]>([]);
  const [loadingExpenseTypes, setLoadingExpenseTypes] = useState(true);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Robust helper: tries multiple possible keys and treats empty/null/whitespace as missing
  const getTopLevelDescription = (raw: Record<string, unknown>) => {
    const keys = ['description', 'details', 'detail', 'desc', 'note', 'notes', 'remarks', 'comment'];
    for (const k of keys) {
      const v = raw[k];
      if (typeof v === 'string' && v.trim() !== '') return v;
      if (v != null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  };

  const getItemDescription = (raw: Record<string, unknown>) => {
    const keys = ['description', 'details', 'detail', 'desc', 'note', 'notes', 'remarks'];
    for (const k of keys) {
      const v = raw[k];
      if (typeof v === 'string' && v.trim() !== '') return v;
      if (v != null && String(v).trim() !== '') return String(v).trim();
    }
    return '';
  };

  const mapExpenseToFormValues = (data: TExpense) => {
    const raw = data as unknown as Record<string, unknown>;
    // Log raw payload for verification (as requested in task)
    if (typeof window !== 'undefined') {
      console.log('[ExpenseEditForm] raw expense payload:', data);
      console.log('[ExpenseEditForm] raw keys:', Object.keys(raw));
      const itemsRaw = raw.expenseItems ?? raw['expense_items'] ?? raw['items'];
      if (itemsRaw) console.log('[ExpenseEditForm] raw expenseItems payload:', itemsRaw);
    }
    // Support multiple possible items-array keys (expenseItems, expense_items, items)
    const rawItems = (raw.expenseItems ?? raw['expense_items'] ?? raw['items'] ?? []) as unknown[];
    const mappedItems =
      (rawItems as Record<string, unknown>[]).length > 0
        ? (rawItems as Record<string, unknown>[]).map((item) => ({
            item_name: (item.item_name ?? item['name'] ?? '') as string,
            item_amount: item.item_amount as number,
            description: getItemDescription(item as Record<string, unknown>),
          }))
        : // Fallback to typed field if rawItems empty but typed still has data
          data.expenseItems?.map((item) => ({
            item_name: item.item_name,
            item_amount: item.item_amount,
            description: getItemDescription(item as unknown as Record<string, unknown>),
          })) ?? [{ item_name: '', item_amount: undefined as any, description: '' }];

    // Ensure at least one item row
    const expenseItems = mappedItems.length > 0 ? mappedItems : [{ item_name: '', item_amount: undefined as any, description: '' }];

    return {
      expense_type_id: data.expense_type_id ?? (raw.expense_type_id as string) ?? '',
      total_amount: data.total_amount,
      expense_date: isoToDisplay(data.expense_date ?? (raw.expense_date as string | undefined)),
      description: getTopLevelDescription(raw),
      expenseItems,
    };
  };

  const form = useForm<ExpenseFormInput, any, ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: mapExpenseToFormValues(expense),
  });

  useEffect(() => {
    // Log precise API response for debugging field-name mismatches
    console.log('[ExpenseEditForm] useEffect reset - raw expense:', JSON.stringify(expense, null, 2));
    const mapped = mapExpenseToFormValues(expense);
    console.log('[ExpenseEditForm] mapped form values:', JSON.stringify(mapped, null, 2));
    form.reset(mapped);
  }, [expense]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'expenseItems',
  });

  const watchedItems = useWatch({
    control: form.control,
    name: 'expenseItems',
  });

  const calculatedTotal = calculateTotal(watchedItems as any);

  useEffect(() => {
    form.setValue('total_amount', calculatedTotal, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [calculatedTotal, form]);

  useEffect(() => {
    const loadExpenseTypes = async () => {
      setLoadingExpenseTypes(true);
      const response = await getExpenseTypes();
      if (!response.success) {
        toast.error(response.message ?? 'Failed to load expense types');
        setLoadingExpenseTypes(false);
        return;
      }
      setExpenseTypes(response.data ?? []);
      setLoadingExpenseTypes(false);
    };
    loadExpenseTypes();
  }, []);

  const onSubmit = (values: ExpenseFormValues) => {
    startTransition(async () => {
      const payload = {
        ...values,
        expense_date: displayToIso(values.expense_date),
        total_amount: calculatedTotal,
      };
      const response = await updateExpense(expense.id, payload);
      if (!response.success) {
        toast.error(response.message ?? 'Failed to update expense');
        return;
      }
      toast.success(response.message ?? 'Expense updated successfully');
      onSuccess();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FieldGroup className="gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="expense_date"
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
            name="expense_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Expense Type</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                  disabled={loadingExpenseTypes}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={loadingExpenseTypes ? 'Loading expense types...' : 'Select One'}>
                      {expenseTypes.find((et) => et.id === field.value)?.name ?? 'Select One'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {expenseTypes.map((expenseType) => (
                      <SelectItem key={expenseType.id} value={expenseType.id}>
                        {expenseType.name}
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
            <FieldLabel>Expense Items</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ item_name: '', item_amount: undefined as any, description: '' })}
            >
              <Plus className="mr-1 h-4 w-4" />
              Add Item
            </Button>
          </div>

          {fields.map((item, index) => (
            <div key={item.id} className="space-y-4 rounded-lg border border-border/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Item #{index + 1}</span>
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
                name={`expenseItems.${index}.item_name`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`item_name_${index}`}>Item Name</FieldLabel>
                    <Input
                      {...field}
                      id={`item_name_${index}`}
                      placeholder="e.g. Electricity bill"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                  </Field>
                )}
              />

              <Controller
                name={`expenseItems.${index}.item_amount`}
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
                name={`expenseItems.${index}.description`}
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={`description_${index}`}>Description</FieldLabel>
                    <Input
                      {...field}
                      id={`description_${index}`}
                      placeholder="e.g. June month bill"
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
            <Field data-invalid={fieldState.invalid} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
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
      </FieldGroup>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ExpenseEditForm;