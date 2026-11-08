import { getClassRoutineByTeacherId } from "@/services/classRoutine";
import { getPeriodSetting } from "@/services/periodSetting";
import ClassRoutineClient from "./ClassRoutineClient";
import { getToday } from "./routine-data";
import type { TRawPeriodSetting, TRawRoutine } from "./types";

// A teacher's own schedule changes whenever an admin edits a routine, so it is
// always rendered fresh.
export const dynamic = "force-dynamic";

/** Keeps the API envelope down to the fields the cards actually read. */
function toRoutines(value: unknown): TRawRoutine[] {
  if (Array.isArray(value)) return value as TRawRoutine[];
  if (value && typeof value === "object") return [value as TRawRoutine];
  return [];
}

/** Times are optional, so an unreadable setting must not break the schedule. */
function toPeriodSetting(response: unknown): TRawPeriodSetting | null {
  const envelope = response as { data?: TRawPeriodSetting } | null;
  const data = envelope?.data;
  if (!data || typeof data.period_count !== "number") return null;
  return data;
}

async function ClassRoutinePage() {
  let routines: TRawRoutine[] = [];
  let periodSetting: TRawPeriodSetting | null = null;
  let loadError: string | null = null;

  try {
    const [routineResponse, settingResponse] = await Promise.all([
      getClassRoutineByTeacherId(),
      // Teachers may read the period count and times; only admins write them.
      getPeriodSetting(),
    ]);

    if (routineResponse?.success === false) {
      loadError =
        routineResponse?.message ?? "The routine service did not respond.";
    } else {
      routines = toRoutines(routineResponse?.data);
    }

    periodSetting = toPeriodSetting(settingResponse);
  } catch (error) {
    loadError =
      error instanceof Error
        ? error.message
        : "Something went wrong while loading your routine.";
  }

  return (
    <ClassRoutineClient
      routines={routines}
      periodSetting={periodSetting}
      loadError={loadError}
      initialToday={getToday()}
    />
  );
}

export default ClassRoutinePage;
