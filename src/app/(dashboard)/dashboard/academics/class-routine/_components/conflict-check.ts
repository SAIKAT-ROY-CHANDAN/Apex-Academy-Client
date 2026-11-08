/**
 * Client-side teacher-conflict check for the class-routine grid.
 *
 * Mirrors the backend rule in
 * `eims-server/src/app/modules/classRoutine/classRoutine.conflict.ts`:
 *
 * - Same teacher + same day + same period + same shift (shift is optional:
 *   null/empty on both sides counts as equal; a shift on only one side counts
 *   as different shifts and is not a conflict):
 *   - Same subject AND same room -> OK (combined class)
 *   - Different subject OR different/unconfirmed room -> blocking conflict
 * - Only teacher / day / period / shift / subject / room take part. Batch,
 *   section, program, department and year are deliberately NOT compared.
 * - Subjects are compared by NORMALIZED NAME (trim + lowercase), not by id: a
 *   Subject row belongs to a single AcademicClass, so a common subject taught
 *   across departments has one row (and id) per department. Falls back to
 *   subject_id equality when a name is unavailable on either side.
 * - An empty room on EITHER side is a real conflict - the same room cannot be
 *   confirmed.
 * - The routine being edited is excluded by id.
 *
 * A cell whose teacher is busy elsewhere but whose subject is still empty (or
 * whose subject match cannot be verified) yields a soft warning (not a
 * blocking error), because subject/room are picked after the teacher. The
 * server remains the source of truth on save.
 */

export type ConflictGridCell = {
  teacher_id: string;
  subject_id: string;
  roomNo: string;
};

export type ConflictRoutineItem = {
  day: string;
  period_no: number;
  teacher_id: string;
  subject_id: string;
  /** Embedded subject from the API (present on routine details responses). */
  subject?: { name?: string; subject_name?: string } | null;
  roomNo?: string | null;
};

export type ConflictRoutineSource = {
  id: string;
  shift_id?: string | null;
  classRoutineItems?: ConflictRoutineItem[];
};

export const SOFT_WARNING_MESSAGE =
  "This teacher is already assigned at this time. Use the same subject and room to make it a combined class.";

export function normalizeRoom(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizeSubjectName(
  value: string | null | undefined,
): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeShift(value: string | null | undefined): string | null {
  const trimmed = (value ?? "").trim();
  return trimmed ? trimmed : null;
}

function formatDayLabel(day: string): string {
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

export function blockingMessage(day: string, period: number): string {
  return `Already assigned to ${formatDayLabel(day)} ${period}`;
}

function resolveSubjectName(
  subjectId: string,
  embedded: { name?: string; subject_name?: string } | null | undefined,
  subjectNames: Record<string, string> | undefined,
): string {
  const fromEmbedded = (embedded?.subject_name ?? embedded?.name ?? "").trim();
  if (fromEmbedded) return fromEmbedded;
  return (subjectNames?.[subjectId] ?? "").trim();
}

function isSameSubject(
  wantedId: string,
  wantedName: string,
  existingId: string,
  existingName: string,
): boolean {
  const a = normalizeSubjectName(wantedName);
  const b = normalizeSubjectName(existingName);
  if (a && b) return a === b;
  return wantedId === existingId;
}

export type CellConflicts = {
  errors: Record<string, string>;
  warnings: Record<string, string>;
};

/**
 * Checks every filled grid cell against other routines. Pure + synchronous so
 * it can run on each Teacher/Subject/Room change and again on save.
 *
 * @param subjectNames id -> display-name map for resolving the grid's (and
 *   other routines') subject names. Built from the `subjects` prop.
 */
export function computeTeacherConflicts(
  grid: Record<string, Record<number, ConflictGridCell>>,
  shiftId: string | null | undefined,
  allRoutines: ConflictRoutineSource[] | undefined,
  currentRoutineId?: string,
  subjectNames?: Record<string, string>,
): CellConflicts {
  const errors: Record<string, string> = {};
  const warnings: Record<string, string> = {};
  if (!allRoutines || allRoutines.length === 0) return { errors, warnings };

  const targetShift = normalizeShift(shiftId);
  const others = allRoutines.filter((r) => r.id !== currentRoutineId);

  for (const day of Object.keys(grid)) {
    for (const periodKey of Object.keys(grid[day] ?? {})) {
      const period = Number(periodKey);
      const cell = grid[day]?.[period];
      if (!cell?.teacher_id) continue;

      // Other-routine bookings for this exact teacher + slot + shift.
      const clashes = others.flatMap((routine) => {
        if (normalizeShift(routine.shift_id) !== targetShift) return [];
        return (routine.classRoutineItems ?? []).filter(
          (item) =>
            item.teacher_id === cell.teacher_id &&
            item.day === day &&
            item.period_no === period,
        );
      });
      if (clashes.length === 0) continue;

      const key = `${day}-${period}`;

      // Subject not picked yet -> cannot judge combined vs conflict: warn only.
      if (!cell.subject_id) {
        warnings[key] = SOFT_WARNING_MESSAGE;
        continue;
      }

      const wantedName = resolveSubjectName(
        cell.subject_id,
        undefined,
        subjectNames,
      );
      const wantedRoom = normalizeRoom(cell.roomNo);

      let hasRealConflict = false;
      let verifiable = false;
      for (const item of clashes) {
        const existingName = resolveSubjectName(
          item.subject_id,
          item.subject,
          subjectNames,
        );
        const namesKnown =
          normalizeSubjectName(wantedName) &&
          normalizeSubjectName(existingName);
        const idsEqual = item.subject_id === cell.subject_id;
        // Without names on both sides and different ids, the subject match
        // cannot be verified client-side: leave it to the server on save.
        if (!namesKnown && !idsEqual) continue;
        verifiable = true;
        const sameSubject = isSameSubject(
          cell.subject_id,
          wantedName,
          item.subject_id,
          existingName,
        );
        const existingRoom = normalizeRoom(item.roomNo);
        // Empty room on either side cannot confirm the same room.
        if (!sameSubject || !wantedRoom || !existingRoom) {
          hasRealConflict = true;
          break;
        }
        if (wantedRoom !== existingRoom) {
          hasRealConflict = true;
          break;
        }
      }

      if (hasRealConflict) {
        errors[key] = blockingMessage(day, period);
      } else if (!verifiable) {
        warnings[key] = SOFT_WARNING_MESSAGE;
      }
    }
  }

  return { errors, warnings };
}
