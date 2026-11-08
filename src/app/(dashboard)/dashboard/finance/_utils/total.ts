'use client';

import { useEffect } from 'react';
import { useWatch, type Control, type UseFormSetValue, type FieldValues, type Path } from 'react-hook-form';

/**
 * Shared total-calculation logic — sum of all item_amount values.
 * Reused by both Create and Edit Expense/Deposit forms.
 * Don't duplicate this logic inline; import and reuse.
 */
export function calculateTotal(items?: Array<{ item_amount?: number | string | null }>): number {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => sum + (Number((item as any)?.item_amount) || 0), 0);
}

/**
 * Hook version that watches a field array and syncs total_amount.
 * Mirrors the logic already implemented for Create forms.
 */
export function useCalculatedTotal<
  T extends FieldValues,
  ItemsField extends Path<T>,
  TotalField extends Path<T>,
>(
  control: Control<T>,
  setValue: UseFormSetValue<T>,
  itemsFieldName: ItemsField,
  totalFieldName: TotalField,
): number {
  const watchedItems = useWatch({ control, name: itemsFieldName }) as unknown as Array<{ item_amount?: number }>;

  const calculatedTotal = calculateTotal(watchedItems as any);

  useEffect(() => {
    setValue(totalFieldName, calculatedTotal as any, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  }, [calculatedTotal, setValue, totalFieldName]);

  return calculatedTotal;
}
