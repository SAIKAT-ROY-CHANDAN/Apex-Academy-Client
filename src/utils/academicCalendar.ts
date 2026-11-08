import type { DayOfWeek } from "@/validation/institution/setup-institution.validation";

export type THolidayType =
  | "PUBLIC"
  | "ACADEMIC"
  | "INSTITUTIONAL"
  | "EMERGENCY";

export interface ICalendarHoliday {
  id: string;
  title: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  holiday_type: THolidayType;
  is_active: boolean;
}

export interface IHolidayInfo {
  title: string;
  description: string | null;
  type: THolidayType;
  isGovernment: boolean;
}

export type TDayStatus =
  | "working"
  | "weekend"
  | "institution-holiday"
  | "government-holiday";

export interface ICalendarCell {
  key: string;
  day: number;
  month: number;
  year: number;
  weekday: number;
  inMonth: boolean;
  isToday: boolean;
  status: TDayStatus;
  holiday?: IHolidayInfo;
}

const DAY_INDEX_BY_NAME: Record<
  (typeof DayOfWeek)[keyof typeof DayOfWeek],
  number
> = {
  SUNDAY: 0,
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
};

const pad = (value: number) => String(value).padStart(2, "0");

export const toDayKey = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const parseIsoDateParts = (iso: string) => {
  const [year, month, day] = iso.slice(0, 10).split("-").map(Number);
  return { year, month: month - 1, day };
};

export const normalizeWeekendDays = (weekendDays: unknown): number[] => {
  let days: unknown = weekendDays;

  if (typeof days === "string") {
    try {
      days = JSON.parse(days);
    } catch {
      return [];
    }
  }

  if (!Array.isArray(days)) return [];

  return days
    .map((day) => DAY_INDEX_BY_NAME[day as keyof typeof DAY_INDEX_BY_NAME])
    .filter((index) => index !== undefined);
};

export const buildHolidayMap = (
  holidays: ICalendarHoliday[],
): Map<string, IHolidayInfo> => {
  const map = new Map<string, IHolidayInfo>();

  holidays.forEach((holiday) => {
    if (!holiday.is_active) return;

    const start = parseIsoDateParts(holiday.start_date);
    const startDate = Date.UTC(start.year, start.month, start.day);
    let endDate = startDate;

    if (holiday.end_date) {
      const end = parseIsoDateParts(holiday.end_date);
      endDate = Date.UTC(end.year, end.month, end.day);
    }

    for (let ts = startDate; ts <= endDate; ts += 86_400_000) {
      const date = new Date(ts);
      map.set(
        toDayKey(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
        {
          title: holiday.title,
          description: holiday.description,
          type: holiday.holiday_type,
          isGovernment: holiday.holiday_type === "PUBLIC",
        },
      );
    }
  });

  return map;
};

export const getDayStatus = (
  weekday: number,
  weekendDays: number[],
  holiday?: IHolidayInfo,
): TDayStatus => {
  if (holiday?.isGovernment) return "government-holiday";
  if (holiday) return "institution-holiday";
  if (weekendDays.includes(weekday)) return "weekend";
  return "working";
};

export const buildMonthGrid = (
  year: number,
  month: number,
  weekendDays: number[],
  holidayMap: Map<string, IHolidayInfo>,
  todayKey: string | null,
): ICalendarCell[][] => {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const leadingCount = firstDay.getDay();

  const cells: ICalendarCell[] = [];

  for (let i = leadingCount - 1; i >= 0; i--) {
    cells.push(
      buildCell(
        year,
        month - 1,
        daysInPrevMonth - i,
        weekendDays,
        holidayMap,
        todayKey,
      ),
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(buildCell(year, month, day, weekendDays, holidayMap, todayKey));
  }

  const trailingCount = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= trailingCount; day++) {
    cells.push(
      buildCell(year, month + 1, day, weekendDays, holidayMap, todayKey),
    );
  }

  const weeks: ICalendarCell[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return weeks;
};

const buildCell = (
  year: number,
  month: number,
  day: number,
  weekendDays: number[],
  holidayMap: Map<string, IHolidayInfo>,
  todayKey: string | null,
): ICalendarCell => {
  const normalized = new Date(year, month, day);
  const key = toDayKey(
    normalized.getFullYear(),
    normalized.getMonth(),
    normalized.getDate(),
  );
  const holiday = holidayMap.get(key);

  return {
    key,
    day: normalized.getDate(),
    month: normalized.getMonth(),
    year: normalized.getFullYear(),
    weekday: normalized.getDay(),
    inMonth:
      normalized.getMonth() === month && normalized.getFullYear() === year,
    isToday: todayKey === key,
    status: getDayStatus(normalized.getDay(), weekendDays, holiday),
    holiday,
  };
};
