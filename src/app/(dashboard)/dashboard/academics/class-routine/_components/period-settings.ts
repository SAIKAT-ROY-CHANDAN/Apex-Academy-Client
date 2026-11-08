/**
 * Shared period-routine primitives.
 *
 * The number of periods per day is institute-wide configuration (see the
 * PeriodSetting module) and is unbounded in practice - the admin adds one row
 * per period in the Period Settings dialog. Everything that renders a routine
 * grid imports from here so the cap and the column/label helpers live in
 * exactly one place.
 */

/**
 * Sanity cap only. The real limit is however many rows the admin adds; this
 * just protects the grid and dialog from an unreasonable value. Keep in sync
 * with MAX_PERIODS in `eims-server/src/app/constant/periods.ts`.
 */
export const MAX_PERIODS = 20;

export const DEFAULT_PERIOD_COUNT = 6;

export const DAYS = [
  "SATURDAY",
  "SUNDAY",
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
] as const;

export type TDayOfWeek = (typeof DAYS)[number];

export type PeriodColumn = {
  periodNumber: number;
};

/**
 * Builds the ordered column list for the routine grid. Only real periods are
 * produced - a break is expressed by leaving a period empty.
 */
export function generatePeriodColumns(periodCount: number): PeriodColumn[] {
  return Array.from({ length: periodCount }, (_, i) => ({
    periodNumber: i + 1,
  }));
}

/**
 * English ordinals: 1st, 2nd, 3rd, 4th ... 11th / 12th / 13th / 21st / 22nd.
 */
export function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const mod100 = n % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : (suffixes[n % 10] ?? "th");
  return `${n}${suffix}`;
}

/** One editable row in the Period Settings dialog. */
export type PeriodTimeValue = {
  /** Stable client-only React key. Never sent to the API. */
  id: string;
  startTime: string;
  endTime: string;
};

let periodRowSequence = 0;

/** Builds one row with a stable client-only id. */
export function createPeriodRow(startTime = "", endTime = ""): PeriodTimeValue {
  periodRowSequence += 1;
  return { id: `period-row-${periodRowSequence}`, startTime, endTime };
}

/** Builds `count` rows, never fewer than one. */
export function createPeriodRows(count: number): PeriodTimeValue[] {
  return Array.from({ length: Math.max(count, 1) }, () => createPeriodRow());
}

/**
 * Editable state behind the Period Settings dialog. There is no separate
 * count: the number of periods is simply `periods.length`, so the row list and
 * the saved period_count cannot go out of sync.
 */
export type PeriodSettingFormValues = {
  periods: PeriodTimeValue[];
};
