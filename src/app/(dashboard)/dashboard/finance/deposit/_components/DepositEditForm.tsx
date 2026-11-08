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
import { updateDeposit } from '@/services/deposit';
import { getDepositTypes } from '@/services/depositType';
import { TDeposit } from './types/deposit';
import { TDepositType } from '../../deposit-type/_components/Types/deposit-type';
import {
  depositSchema,
  DepositFormInput,
  DepositFormValues,
} from './schema/deposit.schema';
import { isoToDisplay, displayToIso, parseDisplayDate } from '../../_utils/date';
import { calculateTotal } from '../../_utils/total';

interface DepositEditFormProps {
  deposit: TDeposit;
  onSuccess: () => void;
  onCancel: () => void;
}

const DepositEditForm = ({ deposit, onSuccess, onCancel }: DepositEditFormProps) => {
  const [isPending, startTransition] = useTransition();
  const [depositTypes, setDepositTypes] = useState<TDepositType[]>([]);
  const [loadingDepositTypes, setLoadingDepositTypes] = useState(true);
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

  const mapDepositToFormValues = (data: TDeposit) => {
    const raw = data as unknown as Record<string, unknown>;
    // Log raw payload for verification (as requested in task)
    if (typeof window !== 'undefined') {
      console.log('[DepositEditForm] raw deposit payload:', data);
      console.log('[DepositEditForm] raw keys:', Object.keys(raw));
      const itemsRaw = raw.depositItems ?? raw['deposit_items'] ?? raw['items'];
      if (itemsRaw) console.log('[DepositEditForm] raw depositItems payload:', itemsRaw);
    }
    // Support multiple possible items-array keys (depositItems, deposit_items, items)
    const rawItems = (raw.depositItems ?? raw['deposit_items'] ?? raw['items'] ?? []) as unknown[];
    const mappedItems =
      (rawItems as Record<string, unknown>[]).length > 0
        ? (rawItems as Record<string, unknown>[]).map((item) => ({
            item_name: (item.item_name ?? item['name'] ?? '') as string,
            item_amount: item.item_amount as number,
            description: getItemDescription(item as Record<string, unknown>),
          }))
        : // Fallback to typed field if rawItems empty but typed still has data
          data.depositItems?.map((item) => ({
            item_name: item.item_name,
            item_amount: item.item_amount,
            description: getItemDescription(item as unknown as Record<string, unknown>),
          })) ?? [{ item_name: '', item_amount: undefined as any, description: '' }];

    // Ensure at least one item row
    const depositItems = mappedItems.length > 0 ? mappedItems : [{ item_name: '', item_amount: undefined as any, description: '' }];

    return {
      deposit_type_id: data.deposit_type_id ?? (raw.deposit_type_id as string) ?? '',
      total_amount: data.total_amount,
      deposit_date: isoToDisplay(data.deposit_date ?? (raw.deposit_date as string | undefined)),
      description: getTopLevelDescription(raw),
      depositItems,
    };
  };

  const form = useForm<DepositFormInput, any, DepositFormValues>({
    resolver: zodResolver(depositSchema),
    defaultValues: mapDepositToFormValues(deposit),
  });

  useEffect(() => {
    // Log precise API response for debugging field-name mismatches
    console.log('[DepositEditForm] useEffect reset - raw deposit:', JSON.stringify(deposit, null, 2));
    const mapped = mapDepositToFormValues(deposit);
    console.log('[DepositEditForm] mapped form values:', JSON.stringify(mapped, null, 2));
    form.reset(mapped);
  }, [deposit]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'depositItems',
  });

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

  useEffect(() => {
    const loadDepositTypes = async () => {
      setLoadingDepositTypes(true);
      const response = await getDepositTypes();
      if (!response.success) {
        toast.error(response.message ?? 'Failed to load deposit types');
        setLoadingDepositTypes(false);
        return;
      }
      setDepositTypes(response.data ?? []);
      setLoadingDepositTypes(false);
    };
    loadDepositTypes();
  }, []);

  const onSubmit = (values: DepositFormValues) => {
    startTransition(async () => {
      const payload = {
        ...values,
        deposit_date: displayToIso(values.deposit_date),
        total_amount: calculatedTotal,
      };
      const response = await updateDeposit(deposit.id, payload);
      if (!response.success) {
        toast.error(response.message ?? 'Failed to update deposit');
        return;
      }
      toast.success(response.message ?? 'Deposit updated successfully');
      onSuccess();
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? undefined}
                  disabled={loadingDepositTypes}
                >
                  <SelectTrigger id={field.name} aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder={loadingDepositTypes ? 'Loading deposit types...' : 'Select One'}>
                      {depositTypes.find((dt) => dt.id === field.value)?.name ?? 'Select One'}
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

export default DepositEditForm;
