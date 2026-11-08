import {
  DAYS,
  type TClassFilterOption,
  type TClassOption,
  type TDayOfWeek,
  type TNormalizedRoutine,
  type TPeriodMeta,
  type TRawPeriodSetting,
  type TRawRoutine,
  type TRoutineEntry,
  type TRoutineSummary,
} from "./types";

/**
 * A small fixed palette. Colour is never the only signal - every card also
 * shows the year and department as text - but the same class keeps the same
 * colour everywhere on the page so the week reads at a glance.
 *
 * Each entry pairs a soft background with a dark text colour, so the label
 * stays readable (WCAG AA on the soft background).
 */
export const CLASS_PALETTE = [
  {
    soft: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    dot: "bg-blue-500",
    bar: "bg-blue-500",
  },
  {
    soft: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-500",
  },
  {
    soft: "bg-amber-50",
    text: "text-amber-900",
    border: "border-amber-200",
    dot: "bg-amber-500",
    bar: "bg-amber-500",
  },
  {
    soft: "bg-violet-50",
    text: "text-violet-800",
    border: "border-violet-200",
    dot: "bg-violet-500",
    bar: "bg-violet-500",
  },
  {
    soft: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    dot: "bg-rose-500",
    bar: "bg-rose-500",
  },
  {
    soft: "bg-teal-50",
    text: "text-teal-800",
    border: "border-teal-200",
    dot: "bg-teal-500",
    bar: "bg-teal-500",
  },
  {
    soft: "bg-indigo-50",
    text: "text-indigo-800",
    border: "border-indigo-200",
    dot: "bg-indigo-500",
    bar: "bg-indigo-500",
  },
  {
    soft: "bg-orange-50",
    text: "text-orange-900",
    border: "border-orange-200",
    dot: "bg-orange-500",
    bar: "bg-orange-500",
  },
] as const;

export const getPalette = (colorIndex: number) =>
  CLASS_PALETTE[
    ((colorIndex % CLASS_PALETTE.length) + CLASS_PALETTE.length) %
      CLASS_PALETTE.length
  ];

/** 1st, 2nd, 3rd ... 11th, 12th, 13th, 21st, 22nd */
export function ordinal(n: number): string {
  const suffixes: Record<number, string> = { 1: "st", 2: "nd", 3: "rd" };
  const mod100 = n % 100;
  const suffix =
    mod100 >= 11 && mod100 <= 13 ? "th" : (suffixes[n % 10] ?? "th");
  return `${n}${suffix}`;
}

export const periodLabel = (periodNo: number): string =>
  `${ordinal(periodNo)} Period`;

/** "SATURDAY" -> "Saturday" */
export function formatDayLabel(day: string | null | undefined): string {
  if (!day) return "";
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

/** Narrows an arbitrary string to a known week day, or null. */
export function toDayOfWeek(
  value: string | null | undefined,
): TDayOfWeek | null {
  if (!value) return null;
  const upper = value.toUpperCase() as TDayOfWeek;
  return DAYS.includes(upper) ? upper : null;
}

/** Today's week day in the browser's timezone. */
export function getToday(now: Date = new Date()): TDayOfWeek {
  // getDay(): 0 = Sunday. DAYS[0] = SATURDAY.
  const index = (now.getDay() + 1) % 7;
  return DAYS[index];
}

/** "08:00" -> 480. Returns null for anything unparseable. */
export function timeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

/** Current wall-clock time in minutes. */
export function nowInMinutes(now: Date = new Date()): number {
  return now.getHours() * 60 + now.getMinutes();
}

const STOPWORDS = new Set(["and", "of", "the", "for", "in", "a", "&", "dept"]);

/**
 * Department names are long ("Computer science and Engineering"). Shorten to
 * initials when they will not fit, but keep the full text available for the
 * tooltip. Anything that cannot be shortened sensibly is truncated.
 */
export function shortenDepartment(name: string, max = 18): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.length <= max) return trimmed;

  const initials = trimmed
    .split(/\s+/)
    .filter((word) => word && !STOPWORDS.has(word.toLowerCase()))
    .map((word) => word.charAt(0).toUpperCase())
    .join("");

  if (initials.length >= 2 && initials.length <= 5) return initials;
  return `${trimmed.slice(0, max - 1)}…`;
}

const clean = (value: string | null | undefined): string =>
  (value ?? "").toString().trim();

/** Reads the year as "1st Year", falling back to the numeric year level. */
function toYearLabel(
  className: string | null | undefined,
  yearLevel: number | null | undefined,
): string {
  const name = clean(className);
  if (name) return name;
  if (typeof yearLevel === "number" && Number.isFinite(yearLevel)) {
    return `${ordinal(yearLevel)} Year`;
  }
  return "";
}

/**
 * Builds the period rows. The institute's period settings decide how many rows
 * there are (so free periods still appear), but any period that only exists in
 * saved routine data is kept too - otherwise a real class would be hidden.
 */
export function buildPeriods(
  setting: TRawPeriodSetting | null | undefined,
  usedPeriodNos: number[],
): TPeriodMeta[] {
  const savedTimes = new Map<number, { startTime: string; endTime: string }>();
  for (const period of setting?.periods ?? []) {
    if (typeof period?.periodNumber !== "number") continue;
    savedTimes.set(period.periodNumber, {
      startTime: clean(period.startTime),
      endTime: clean(period.endTime),
    });
  }

  const count =
    typeof setting?.period_count === "number" && setting.period_count > 0
      ? setting.period_count
      : 0;

  const numbers = new Set<number>();
  for (let i = 1; i <= count; i++) numbers.add(i);
  for (const periodNo of usedPeriodNos) {
    if (Number.isFinite(periodNo) && periodNo > 0) numbers.add(periodNo);
  }

  return Array.from(numbers)
    .sort((a, b) => a - b)
    .map((periodNo) => {
      const times = savedTimes.get(periodNo);
      return {
        periodNo,
        label: periodLabel(periodNo),
        startTime: times?.startTime ?? "",
        endTime: times?.endTime ?? "",
      };
    });
}

/** Flattens every routine the teacher is assigned to into lesson entries. */
export function flattenRoutines(routines: TRawRoutine[]): TRoutineEntry[] {
  const entries: TRoutineEntry[] = [];

  for (const routine of routines ?? []) {
    if (!routine?.id) continue;

    const academicClass = routine.academicClass ?? null;
    const department = clean(academicClass?.department?.department_name);
    const yearLabel = toYearLabel(
      academicClass?.class_name,
      academicClass?.year_level,
    );
    const program = clean(academicClass?.program?.program_name);
    const batch = clean(routine.batch?.batch_name);
    const section = clean(routine.academicSection?.section_name);
    const shift = clean(routine.shift?.name);

    // The filter is about the class a teacher teaches, so the class name and
    // department identify it; batch/section/shift stay as card detail.
    const classKey = [
      routine.academic_class_id,
      batch || "no-batch",
      section || "no-section",
      shift || "no-shift",
    ].join("|");

    const classLabelParts = [yearLabel, department].filter(Boolean);
    const classLabel = classLabelParts.join(" - ");
    const shortDepartment = shortenDepartment(department);
    const shortLabel = [yearLabel, shortDepartment].filter(Boolean).join(" - ");
    // The filter text keeps the badge wording for the year and department, then
    // adds the rest of the class context so each option is unambiguous.
    const filterLabel = [
      yearLabel,
      shortDepartment,
      program,
      batch,
      section,
      shift,
    ]
      .filter(Boolean)
      .join(" - ");

    let index = 0;
    for (const item of routine.classRoutineItems ?? []) {
      const day = toDayOfWeek(item?.day);
      const periodNo = Number(item?.period_no);
      if (!day || !Number.isFinite(periodNo) || periodNo <= 0) continue;

      entries.push({
        key: `${routine.id}:${day}:${periodNo}:${index}`,
        routineId: routine.id,
        day,
        periodNo,
        subject: clean(item?.subject?.name) || "Untitled subject",
        roomNo: clean(item?.roomNo),
        yearLabel,
        department,
        program,
        batch,
        section,
        shift,
        classKey,
        classLabel: classLabel || "Unassigned class",
        shortLabel: shortLabel || "Unassigned class",
        filterLabel: filterLabel || classLabel || "Unassigned class",
        colorIndex: 0,
      });
      index += 1;
    }
  }

  return entries;
}

/**
 * Turns the raw API payloads into the one structure both the week table and the
 * day list render from: day -> period -> entries[].
 */
export function normalizeRoutine(
  routines: TRawRoutine[],
  setting: TRawPeriodSetting | null | undefined,
): TNormalizedRoutine {
  const entries = flattenRoutines(routines);
  const periods = buildPeriods(
    setting,
    entries.map((entry) => entry.periodNo),
  );

  // Distinct classes, sorted so the colour assignment is stable across renders.
  // The filter label is the readable text; it is never the routine id.
  const classMap = new Map<string, { label: string; shortLabel: string }>();
  for (const entry of entries) {
    if (!classMap.has(entry.classKey)) {
      classMap.set(entry.classKey, {
        label: entry.filterLabel,
        shortLabel: entry.shortLabel,
      });
    }
  }
  const orderedClasses = Array.from(classMap.entries()).sort((a, b) =>
    a[1].label.localeCompare(b[1].label),
  );
  const colorOfClass = new Map<string, number>();
  orderedClasses.forEach(([key], index) => {
    colorOfClass.set(key, index);
  });

  const classes: TClassOption[] = orderedClasses.map(([key, value], index) => ({
    key,
    label: value.label,
    shortLabel: value.shortLabel,
    colorIndex: index,
  }));

  for (const entry of entries) {
    entry.colorIndex = colorOfClass.get(entry.classKey) ?? 0;
  }

  // Only days the institute actually uses, in week order.
  const usedDays = new Set(entries.map((entry) => entry.day));
  const days = DAYS.filter((day) => usedDays.has(day));

  const byDay = {} as Record<TDayOfWeek, Record<number, TRoutineEntry[]>>;
  for (const day of DAYS) {
    const slots: Record<number, TRoutineEntry[]> = {};
    for (const period of periods) slots[period.periodNo] = [];
    byDay[day] = slots;
  }

  const conflictKeys = new Set<string>();
  for (const entry of entries) {
    const slot = byDay[entry.day];
    if (!slot) continue;
    if (!slot[entry.periodNo]) slot[entry.periodNo] = [];
    slot[entry.periodNo].push(entry);

    if (slot[entry.periodNo].length > 1) {
      conflictKeys.add(`${entry.day}|${entry.periodNo}`);
    }
  }

  return { periods, days, byDay, entries, classes, conflictKeys };
}

/**
 * "All classes" first, then one option per distinct class. Values are ids and
 * must only ever be used for matching, never rendered.
 */
export function buildClassFilterOptions(
  classes: TClassOption[],
  allValue: string,
  allLabel: string,
): TClassFilterOption[] {
  return [
    { value: allValue, label: allLabel },
    ...classes.map((option) => ({ value: option.key, label: option.label })),
  ];
}

/**
 * Safety net: if the stored value is not one of the current options (the
 * teacher's classes changed, or nothing is selected) fall back to "all", so a
 * raw id can never end up on screen.
 */
export function resolveFilterValue(
  selected: string,
  options: TClassFilterOption[],
  fallback: string,
): string {
  return options.some((option) => option.value === selected)
    ? selected
    : fallback;
}

/** The label to show for a filter value - always readable text. */
export function filterValueLabel(
  value: string,
  options: TClassFilterOption[],
  fallback: string,
): string {
  return options.find((option) => option.value === value)?.label ?? fallback;
}

/** Lessons that match the active filter, for the "Showing x of y" counter. */
export function countFilteredEntries(
  normalized: TNormalizedRoutine,
  selected: string,
  allValue: string,
): number {
  if (selected === allValue) return normalized.entries.length;
  return normalized.entries.filter((entry) => entry.classKey === selected)
    .length;
}

/** The period the clock currently sits in, or null when times are unknown. */
export function getCurrentPeriodNo(
  periods: TPeriodMeta[],
  now: Date = new Date(),
): number | null {
  const minutes = nowInMinutes(now);
  let fallback: number | null = null;

  for (const period of periods) {
    const start = timeToMinutes(period.startTime);
    const end = timeToMinutes(period.endTime);
    if (start === null || end === null) continue;
    if (minutes >= start && minutes < end) return period.periodNo;
    // Outside every configured window, remember the most recent one so the
    // summary can say the day is over rather than "no next class".
    if (minutes >= end && end <= minutes) fallback = period.periodNo;
  }

  return fallback;
}

export const slotKey = (day: string, periodNo: number): string =>
  `${day}|${periodNo}`;

/**
 * The day the day-view chips should open on: today when the institute teaches
 * today, otherwise the first day in the week that actually has classes.
 */
export function getFirstDayWithClasses(
  normalized: TNormalizedRoutine,
  today: TDayOfWeek | null,
): TDayOfWeek | null {
  if (normalized.days.length === 0) return null;
  if (today && normalized.days.includes(today)) return today;
  return normalized.days[0];
}

/** "08:00 - 08:45", or "" when the institute has not set times. */
export function periodTimeLabel(period: TPeriodMeta | undefined): string {
  if (!period?.startTime || !period?.endTime) return "";
  return `${period.startTime} - ${period.endTime}`;
}

/**
 * Counts for the header, plus the next lesson of the day. "Next" means the
 * first lesson that has not finished yet; with no times configured it falls
 * back to the first lesson of the day.
 */
export function summarizeRoutine(
  normalized: TNormalizedRoutine,
  today: TDayOfWeek,
  now: Date = new Date(),
): TRoutineSummary {
  const minutes = nowInMinutes(now);
  const periodsByNo = new Map(normalized.periods.map((p) => [p.periodNo, p]));
  const todaySlots = normalized.byDay[today] ?? {};

  const todaysEntries = normalized.periods
    .flatMap((period) => todaySlots[period.periodNo] ?? [])
    .sort((a, b) => a.periodNo - b.periodNo);

  let next: TRoutineEntry | null = null;
  for (const entry of todaysEntries) {
    const period = periodsByNo.get(entry.periodNo);
    const end = timeToMinutes(period?.endTime);
    if (end === null || minutes < end) {
      next = entry;
      break;
    }
  }

  const nextPeriod = next ? periodsByNo.get(next.periodNo) : undefined;

  return {
    totalWeek: normalized.entries.length,
    totalToday: todaysEntries.length,
    next,
    nextTimeLabel: periodTimeLabel(nextPeriod),
    nextPeriodLabel: next ? periodLabel(next.periodNo) : "",
  };
}
