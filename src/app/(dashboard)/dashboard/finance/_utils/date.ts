'use client';

import { format, parse, isValid } from 'date-fns';

/**
 * Convert ISO / backend date string (e.g. 2026-09-13 or 2026-09-13T00:00:00.000Z)
 * to display format DD-MM-YYYY for the date picker input.
 * Reused by both Create and Edit Expense/Deposit forms.
 */
export function isoToDisplay(iso?: string | null): string {
  if (!iso || !iso.trim()) return '';
  const trimmed = iso.trim();
  // Already in display format
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) return trimmed;
  // Try parsing ISO string via Date
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return format(d, 'dd-MM-yyyy');
  // Fallback try parse as yyyy-MM-dd
  try {
    const parsed = parse(trimmed, 'yyyy-MM-dd', new Date());
    if (isValid(parsed)) return format(parsed, 'dd-MM-yyyy');
  } catch {}
  return '';
}

/**
 * Convert display format DD-MM-YYYY to ISO yyyy-MM-dd for backend.
 * If value is empty, returns today's date in ISO (yyyy-MM-dd).
 * Reused by both Create and Edit Expense/Deposit forms.
 */
export function displayToIso(value?: string | null): string {
  if (!value || !value.trim()) return format(new Date(), 'yyyy-MM-dd');
  const trimmed = value.trim();
  try {
    const parsed = parse(trimmed, 'dd-MM-yyyy', new Date());
    if (isValid(parsed)) return format(parsed, 'yyyy-MM-dd');
  } catch {}
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) return format(d, 'yyyy-MM-dd');
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Parse a DD-MM-YYYY string to a Date for Calendar selected prop.
 */
export function parseDisplayDate(value?: string | null): Date | undefined {
  if (!value) return undefined;
  try {
    const d = parse(value as string, 'dd-MM-yyyy', new Date());
    return isValid(d) ? d : undefined;
  } catch {
    return undefined;
  }
}
