/**
 * Types for the teacher portal Class Routine page.
 *
 * The teacher schedule is read-only, so nothing here is ever sent back to the
 * API. `TRawRoutine` / `TRawPeriodSetting` mirror exactly what
 * GET /class-routine/my-routine and GET /period-setting return for a teacher;
 * everything else is derived for display.
 */

/** Bangladesh week order, matching the admin routine grid. */
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

/** One routine as GET /class-routine/my-routine returns it for a teacher. */
export type TRawRoutine = {
  id: string;
  academic_class_id: string;
  academic_section_id?: string | null;
  batch_id?: string | null;
  shift_id?: string | null;
  academicClass?: {
    class_name?: string | null;
    year_level?: number | null;
    department?: { id?: string; department_name?: string | null } | null;
    program?: { id?: string; program_name?: string | null } | null;
  } | null;
  academicSection?: { section_name?: string | null } | null;
  batch?: { batch_name?: string | null } | null;
  shift?: { name?: string | null } | null;
  classRoutineItems?:
    | {
        period_no: number;
        day: string;
        subject?: { name?: string | null } | null;
        /** Optional room / lab for this slot; null when unset. */
        roomNo?: string | null;
      }[]
    | null;
};

/** GET /period-setting as it looks to a teacher (read-only). */
export type TRawPeriodSetting = {
  period_count: number;
  periods?:
    | { periodNumber: number; startTime: string; endTime: string }[]
    | null;
};

/** One teacher lesson, flattened and ready to render. */
export type TRoutineEntry = {
  /** Unique per card, so a slot with several classes keys correctly. */
  key: string;
  /** The routine (class) this entry belongs to. */
  routineId: string;
  day: TDayOfWeek;
  periodNo: number;
  subject: string;
  /** Room / lab of this slot - "101", or "" when the admin left it unset. */
  roomNo: string;
  /** "1st Year" */
  yearLabel: string;
  department: string;
  program: string;
  batch: string;
  section: string;
  shift: string;
  /** Identity of the class, used for the colour and the filter. */
  classKey: string;
  /** Full, unshortened class text - "1st Year - Computer science and Engineering". */
  classLabel: string;
  /** Shortened form for the badge - "1st Year - CSE". Tooltip shows classLabel. */
  shortLabel: string;
  /**
   * Readable text for the filter, using the same wording as the card badge for
   * the year and department and then adding the rest of the class context:
   * "1st Year - CSE - B.SC - 1st batch - A - Morning-shift".
   */
  filterLabel: string;
  /** Index into CLASS_PALETTE, stable for the life of the page. */
  colorIndex: number;
};

/** A row in the week table / an item in the day list. */
export type TPeriodMeta = {
  periodNo: number;
  /** "3rd Period" */
  label: string;
  /** "08:00" or "" when the institute has not set times. */
  startTime: string;
  endTime: string;
};

export type TClassOption = {
  key: string;
  /** Readable text - "1st Year - CSE - B.SC - 1st batch - A - Morning-shift". */
  label: string;
  /** Badge wording - "1st Year - CSE". */
  shortLabel: string;
  colorIndex: number;
};

/**
 * One entry of the class filter dropdown. `value` is the stored id and must
 * never be rendered as text.
 */
export type TClassFilterOption = {
  value: string;
  label: string;
};

/**
 * The single source both views render from: day -> period -> entries.
 * `byDay[day][periodNo]` is always an array, empty for a free period.
 */
export type TNormalizedRoutine = {
  /** Every period row to render, ordered, including free ones. */
  periods: TPeriodMeta[];
  /** Days the institute actually uses, in week order. */
  days: TDayOfWeek[];
  byDay: Record<TDayOfWeek, Record<number, TRoutineEntry[]>>;
  /** Flat list of every lesson, for counts and summaries. */
  entries: TRoutineEntry[];
  /** Distinct classes, for the filter. */
  classes: TClassOption[];
  /** `${day}|${periodNo}` keys where a teacher has more than one class. */
  conflictKeys: Set<string>;
};

export type TRoutineSummary = {
  /** Lessons across the whole week. */
  totalWeek: number;
  /** Lessons on `today`. */
  totalToday: number;
  /** The next lesson today, when there is one. */
  next: TRoutineEntry | null;
  /** Time range of `next`, or "" when the institute has no times. */
  nextTimeLabel: string;
  /** Period label of `next`, e.g. "3rd Period". */
  nextPeriodLabel: string;
};

export type TViewMode = "week" | "day";
