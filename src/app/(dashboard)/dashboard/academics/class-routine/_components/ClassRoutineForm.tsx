"use client";

import {
  AlertTriangle,
  Check,
  Loader2,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { FormSelect, type FormSelectOption } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type ConflictRoutineSource,
  computeTeacherConflicts,
} from "./conflict-check";
import { usePeriodSetting } from "./PeriodSettingProvider";
import { DAYS, generatePeriodColumns, ordinal } from "./period-settings";

export type { TDayOfWeek } from "./period-settings";
export {
  DAYS,
  generatePeriodColumns,
  MAX_PERIODS,
  ordinal,
} from "./period-settings";

type RoutineCell = {
  teacher_id: string;
  subject_id: string;
  roomNo: string;
};

export type ClassRoutineItemFormValue = {
  day: (typeof DAYS)[number];
  period_no: number;
  teacher_id: string;
  subject_id: string;
  /** Free text - "101", "B-12", "Lab 2". "" means "no room set". */
  roomNo: string;
};

export type ClassRoutineFormValues = {
  academic_class_id: string;
  academic_section_id: string;
  batch_id: string;
  shift_id: string;
  classRoutineItems: ClassRoutineItemFormValue[];
};

export type ClassRoutineFormDefaults = Partial<
  Omit<ClassRoutineFormValues, "classRoutineItems">
> & {
  classRoutineItems?: ClassRoutineItemFormValue[];
};

type OptionItem = {
  id: string;
  name?: string;
  class_name?: string;
  section_name?: string;
  batch_name?: string;
  shift_name?: string;
  subject_name?: string;
  teacher_name?: string;
  full_name?: string;
  title?: string;
  department_name?: string;
  department_id?: string;
  program_name?: string;
  program_id?: string;
  // AcademicClass fields (year_level / class_level are the canonical Level/Year)
  year_level?: number | null;
  class_level?: number | null;
  // Present on subject items - links a subject to its academic class.
  // Adjust the field name here if your API returns it differently
  // (e.g. class_id, academicClassId, academic_class?.id, etc).
  academic_class_id?: string;
  class_id?: string;
  academicClassId?: string;
  academic_class?:
    | {
        id?: string;
        program_id?: string | null;
        department_id?: string | null;
        year_level?: number | null;
        class_level?: number | null;
      }
    | string;
  academicClass?: {
    id?: string;
    program_id?: string | null;
    department_id?: string | null;
    year_level?: number | null;
    class_level?: number | null;
  } | null;
};

// Pulls a class id off a subject item, trying several common API shapes.
// Once you confirm the real field name from console.log, you can simplify
// this back down to a single direct property access.
function getSubjectClassId(subject: OptionItem): string | undefined {
  if (subject.academic_class_id) return subject.academic_class_id;
  if (subject.class_id) return subject.class_id;
  if (subject.academicClassId) return subject.academicClassId;
  if (subject.academic_class) {
    return typeof subject.academic_class === "string"
      ? subject.academic_class
      : subject.academic_class.id;
  }
  if (subject.academicClass) return subject.academicClass.id;
  return undefined;
}

function getSubjectAcademicClass(subject: OptionItem) {
  if (subject.academicClass) return subject.academicClass;
  if (subject.academic_class && typeof subject.academic_class !== "string") {
    return subject.academic_class;
  }
  return undefined;
}

type ClassRoutineFormProps = {
  academicClasses: OptionItem[];
  academicSections: OptionItem[];
  batches: OptionItem[];
  shifts: OptionItem[];
  subjects: OptionItem[];
  teachers: OptionItem[];
  departments: OptionItem[];
  programs: OptionItem[];
  initialValues?: ClassRoutineFormDefaults;
  submitLabel: string;
  isSubmitting?: boolean;
  onSubmit: (values: ClassRoutineFormValues) => void | Promise<void | any>;
  onCancel?: () => void;
  /**
   * All routines (including other departments) for client-side combined-class
   * validation. When omitted, only the server validates teacher conflicts.
   */
  allRoutines?: ConflictRoutineSource[];
  /** Id of the routine being edited — its own records never conflict with it. */
  currentRoutineId?: string;
};

type FormErrors = {
  academic_class_id?: string;
  academic_section_id?: string;
  batch_id?: string;
  shift_id?: string;
  items?: string;
};

function getItemLabel(item: OptionItem) {
  return (
    item.name ??
    item.class_name ??
    item.section_name ??
    item.batch_name ??
    item.shift_name ??
    item.department_name ??
    item.program_name ??
    item.subject_name ??
    item.teacher_name ??
    item.full_name ??
    item.title ??
    "Untitled"
  );
}

function buildOptions(items: OptionItem[]): FormSelectOption[] {
  return items.map((item) => ({ label: getItemLabel(item), value: item.id }));
}

function getSubjectDisplayName(item: OptionItem): string {
  return (item.subject_name ?? item.name ?? "").trim();
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildEmptyGrid() {
  return DAYS.reduce<Record<string, Record<number, RoutineCell>>>(
    (acc, day) => {
      acc[day] = {};
      return acc;
    },
    {},
  );
}

function buildEmptyCell(): RoutineCell {
  return { teacher_id: "", subject_id: "", roomNo: "" };
}

function normalizeGrid(items?: ClassRoutineItemFormValue[]) {
  const grid = buildEmptyGrid();
  items?.forEach((item) => {
    if (!grid[item.day]) {
      grid[item.day] = {};
    }
    grid[item.day][item.period_no] = {
      teacher_id: item.teacher_id,
      subject_id: item.subject_id,
      roomNo: item.roomNo ?? "",
    };
  });
  return grid;
}

function getInitialDepartmentId(
  items: ClassRoutineItemFormValue[] | undefined,
  teachers: OptionItem[],
) {
  const teacherId = items?.find((item) => item.teacher_id)?.teacher_id;
  return (
    teachers.find((teacher) => teacher.id === teacherId)?.department_id ?? ""
  );
}

function getInitialDepartmentIdFromClass(
  academicClassId: string | undefined,
  academicClasses: OptionItem[],
) {
  if (!academicClassId) return "";
  return (
    academicClasses.find((cls) => cls.id === academicClassId)?.department_id ??
    ""
  );
}

function getInitialProgramId(
  items: ClassRoutineItemFormValue[] | undefined,
  teachers: OptionItem[],
  departments: OptionItem[],
) {
  const departmentId = getInitialDepartmentId(items, teachers);
  return (
    departments.find((department) => department.id === departmentId)
      ?.program_id ?? ""
  );
}

function getInitialProgramIdFromClass(
  academicClassId: string | undefined,
  academicClasses: OptionItem[],
  departments: OptionItem[],
) {
  if (!academicClassId) return "";
  const cls = academicClasses.find((c) => c.id === academicClassId);
  if (cls?.program_id) return cls.program_id;
  if (cls?.department_id) {
    return (
      departments.find((d) => d.id === cls.department_id)?.program_id ?? ""
    );
  }
  return "";
}

type ActiveCell = { day: (typeof DAYS)[number]; period: number } | null;

export default function ClassRoutineForm({
  academicClasses,
  academicSections,
  batches,
  shifts,
  subjects,
  teachers,
  departments,
  programs,
  initialValues,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  onCancel,
  allRoutines,
  currentRoutineId,
}: ClassRoutineFormProps) {
  const sectionOptions = useMemo(
    () => buildOptions(academicSections),
    [academicSections],
  );
  const shiftOptions = useMemo(() => buildOptions(shifts), [shifts]);
  const programOptions = useMemo(() => buildOptions(programs), [programs]);
  const ALL_PROGRAMS_VALUE = "__all__";
  const dialogProgramOptions = useMemo(
    () => [
      { label: "All Programs", value: ALL_PROGRAMS_VALUE },
      ...programOptions,
    ],
    [programOptions],
  );

  const [academicClassId, setAcademicClassId] = useState(
    initialValues?.academic_class_id ?? "",
  );
  const [academicSectionId, setAcademicSectionId] = useState(
    initialValues?.academic_section_id ?? "",
  );
  const [batchId, setBatchId] = useState(initialValues?.batch_id ?? "");
  const [shiftId, setShiftId] = useState(initialValues?.shift_id ?? "");
  const [departmentId, setDepartmentId] = useState(() => {
    const fromClass = getInitialDepartmentIdFromClass(
      initialValues?.academic_class_id,
      academicClasses,
    );
    if (fromClass) return fromClass;
    return getInitialDepartmentId(initialValues?.classRoutineItems, teachers);
  });
  const [programId, setProgramId] = useState(() => {
    const fromClass = getInitialProgramIdFromClass(
      initialValues?.academic_class_id,
      academicClasses,
      departments,
    );
    if (fromClass) return fromClass;
    return getInitialProgramId(
      initialValues?.classRoutineItems,
      teachers,
      departments,
    );
  });
  const [grid, setGrid] = useState<Record<string, Record<number, RoutineCell>>>(
    normalizeGrid(initialValues?.classRoutineItems),
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [teacherErrors, setTeacherErrors] = useState<Record<string, string>>(
    {},
  );

  // id -> display-name map for the name-based subject comparison (a common
  // subject has one row/id per department, so ids alone cannot match across
  // departments).
  const subjectNameById = useMemo(() => {
    const map: Record<string, string> = {};
    for (const subject of subjects) {
      const displayName = getSubjectDisplayName(subject);
      if (displayName) map[subject.id] = displayName;
    }
    return map;
  }, [subjects]);

  // Client-side combined-class validation. Recomputed whenever Teacher,
  // Subject, Room, or Shift changes (grid + shiftId are deps), so a blocking
  // error clears itself as soon as the combination becomes a valid combined
  // class. Server-reported errors stay in `teacherErrors` above.
  const clientConflicts = useMemo(
    () =>
      computeTeacherConflicts(
        grid,
        shiftId,
        allRoutines,
        currentRoutineId,
        subjectNameById,
      ),
    [grid, shiftId, allRoutines, currentRoutineId, subjectNameById],
  );

  // The period count comes from institute settings, not a local constant, so
  // Create and Edit grids always match the configured timetable.
  const {
    periodCount,
    loading: settingsLoading,
    error: settingsError,
  } = usePeriodSetting();

  // ---- Teacher picker dialog state ----
  const [activeCell, setActiveCell] = useState<ActiveCell>(null);
  const [dialogProgramId, setDialogProgramId] = useState("");
  const [dialogTeacherId, setDialogTeacherId] = useState("");
  const [dialogSearchQuery, setDialogSearchQuery] = useState("");

  // A teacher only carries a department_id, so to filter by program we first
  // find which departments belong to the selected program, then match teachers
  // against that set.
  const dialogFilteredTeachers = useMemo(() => {
    let list = teachers;
    if (dialogProgramId) {
      const departmentIdsInProgram = new Set(
        departments
          .filter((d) => d.program_id === dialogProgramId)
          .map((d) => d.id),
      );
      list = list.filter(
        (teacher) =>
          teacher.department_id &&
          departmentIdsInProgram.has(teacher.department_id),
      );
    }
    const query = dialogSearchQuery.trim().toLowerCase();
    if (query) {
      list = list.filter((teacher) =>
        getItemLabel(teacher).toLowerCase().includes(query),
      );
    }
    return list;
  }, [teachers, departments, dialogProgramId, dialogSearchQuery]);

  const getTeacherProgramId = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    const department = teacher
      ? departments.find((d) => d.id === teacher.department_id)
      : undefined;
    return department?.program_id;
  };

  const openTeacherDialog = (day: (typeof DAYS)[number], period: number) => {
    const currentTeacherId = grid[day]?.[period]?.teacher_id ?? "";
    setDialogProgramId(getTeacherProgramId(currentTeacherId) ?? "");
    setDialogTeacherId(currentTeacherId);
    setDialogSearchQuery("");
    setActiveCell({ day, period });
  };

  const closeTeacherDialog = () => {
    setActiveCell(null);
    setDialogProgramId("");
    setDialogTeacherId("");
    setDialogSearchQuery("");
  };

  const confirmTeacherSelection = () => {
    if (activeCell && dialogTeacherId) {
      updateCell(
        activeCell.day,
        activeCell.period,
        "teacher_id",
        dialogTeacherId,
      );
    }
    closeTeacherDialog();
  };

  const getTeacherLabel = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? getItemLabel(teacher) : "";
  };
  // ---- end teacher picker dialog state ----

  // Subjects are associated with an AcademicClass via `class_id`.
  // That AcademicClass is the source of truth for Level/Year
  // (year_level / class_level) and for Program + Department/Group.
  // Filter subjects by Program + Department + Level/Year — same logic
  // as subject-config (programId + departmentId + levelYear). The routine
  // page's "Year" dropdown holds an AcademicClass id (e.g. "1st Year");
  // map it to its numeric level (year_level ?? class_level) before
  // comparing to the subject's academicClass level. Batch/Section/Shift
  // remain unrelated to subject filtering.
  const filteredSubjects = useMemo(() => {
    if (!programId || !departmentId || !academicClassId) return [];
    const selectedClass = academicClasses.find((c) => c.id === academicClassId);
    const targetLevel =
      (selectedClass as OptionItem | undefined)?.year_level ??
      (selectedClass as OptionItem | undefined)?.class_level;
    // If the selected Year has no numeric level, don't show subjects from other years
    if (targetLevel == null) return [];
    return subjects.filter((subject) => {
      let subjectClass = getSubjectAcademicClass(subject);
      // If the inline academicClass is missing or lacks program/department,
      // resolve via the academicClasses lookup by class_id. This handles
      // the case where subjects only carry `class_id` without an expanded
      // academicClass object (or where year vs year_level format differed).
      if (
        !subjectClass ||
        (subjectClass.program_id == null && subjectClass.department_id == null)
      ) {
        const fallbackId = getSubjectClassId(subject);
        if (fallbackId) {
          const resolved = academicClasses.find((c) => c.id === fallbackId);
          if (resolved) {
            subjectClass = {
              id: resolved.id,
              program_id: resolved.program_id ?? null,
              department_id: resolved.department_id ?? null,
              year_level: (resolved as OptionItem).year_level ?? null,
              class_level: (resolved as OptionItem).class_level ?? null,
            };
          }
        }
      }
      if (!subjectClass || typeof subjectClass === "string") return false;
      const subjectLevel =
        (subjectClass as OptionItem).year_level ??
        (subjectClass as OptionItem).class_level;
      return (
        subjectClass.program_id === programId &&
        subjectClass.department_id === departmentId &&
        subjectLevel === targetLevel
      );
    });
  }, [subjects, programId, departmentId, academicClassId, academicClasses]);

  const filteredClasses = useMemo(
    () =>
      academicClasses.filter(
        (academicClass) =>
          academicClass.program_id === programId &&
          academicClass.department_id === departmentId,
      ),
    [academicClasses, departmentId, programId],
  );
  const classOptions = useMemo(
    () => buildOptions(filteredClasses),
    [filteredClasses],
  );
  const subjectOptions = useMemo(
    () => buildOptions(filteredSubjects),
    [filteredSubjects],
  );
  const batchOptions = useMemo(() => buildOptions(batches), [batches]);
  const filteredDepartments = useMemo(
    () =>
      programId
        ? departments.filter(
            (department) => department.program_id === programId,
          )
        : [],
    [departments, programId],
  );
  const departmentOptions = useMemo(
    () => buildOptions(filteredDepartments),
    [filteredDepartments],
  );

  useEffect(() => {
    setAcademicClassId(initialValues?.academic_class_id ?? "");
    setAcademicSectionId(initialValues?.academic_section_id ?? "");
    setBatchId(initialValues?.batch_id ?? "");
    setShiftId(initialValues?.shift_id ?? "");
    const clsDept = getInitialDepartmentIdFromClass(
      initialValues?.academic_class_id,
      academicClasses,
    );
    const clsProg = getInitialProgramIdFromClass(
      initialValues?.academic_class_id,
      academicClasses,
      departments,
    );
    setDepartmentId(
      clsDept ||
        getInitialDepartmentId(initialValues?.classRoutineItems, teachers),
    );
    setProgramId(
      clsProg ||
        getInitialProgramId(
          initialValues?.classRoutineItems,
          teachers,
          departments,
        ),
    );
    setGrid(normalizeGrid(initialValues?.classRoutineItems));
    setErrors({});
  }, [initialValues, teachers, departments, academicClasses]);

  useEffect(() => {
    if (
      departmentId &&
      !filteredDepartments.some((department) => department.id === departmentId)
    ) {
      setDepartmentId("");
    }
  }, [departmentId, filteredDepartments]);
  // When Program/Department/Year changes, drop any subject selections that no
  // longer belong to the filtered subject list (Batch/Section/Shift must
  // NOT clear subjects — see filteredSubjects memo).
  useEffect(() => {
    const validSubjectIds = new Set(filteredSubjects.map((s) => s.id));
    setGrid((prev) => {
      let changed = false;
      const next: Record<string, Record<number, RoutineCell>> = {};
      for (const day of Object.keys(prev)) {
        next[day] = {};
        for (const periodKey of Object.keys(prev[day] ?? {})) {
          const cell = prev[day][Number(periodKey)];
          if (cell.subject_id && !validSubjectIds.has(cell.subject_id)) {
            changed = true;
            // The subject is gone, so the room it was paired with goes too.
            next[day][Number(periodKey)] = {
              ...cell,
              subject_id: "",
              roomNo: "",
            };
          } else {
            next[day][Number(periodKey)] = cell;
          }
        }
      }
      return changed ? next : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredSubjects]);

  const updateCell = (
    day: (typeof DAYS)[number],
    periodNo: number,
    field: keyof RoutineCell,
    value: string,
  ) => {
    setGrid((prev) => {
      const current = prev[day]?.[periodNo] ?? buildEmptyCell();
      const next = { ...current, [field]: value };
      // A room only means something together with a subject, so clearing the
      // subject in a cell clears its room as well.
      if (field === "subject_id" && !value) {
        next.roomNo = "";
      }
      return {
        ...prev,
        [day]: {
          ...(prev[day] ?? {}),
          [periodNo]: next,
        },
      };
    });
    // Clear items error when user starts filling the grid
    if (errors.items) {
      setErrors((prev) => ({ ...prev, items: undefined }));
    }
    // Clear the server-reported inline conflict for this cell when teacher,
    // subject, or room changes — the client check below re-evaluates live, so
    // a stale server error never sticks around after the fix.
    if (
      field === "teacher_id" ||
      field === "subject_id" ||
      field === "roomNo"
    ) {
      const key = `${day}-${periodNo}`;
      if (teacherErrors[key]) {
        setTeacherErrors((prev) => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
      }
    }
  };

  const handleSubmit = async () => {
    // Client-side combined-class check runs again on save: same
    // teacher + day + period + shift with a different subject or room blocks
    // the save, while a valid combined class (or a soft warning) lets it
    // through for the server to confirm.
    const liveConflicts = computeTeacherConflicts(
      grid,
      shiftId,
      allRoutines,
      currentRoutineId,
      subjectNameById,
    );
    if (Object.keys(liveConflicts.errors).length > 0) {
      setTeacherErrors((prev) => ({ ...prev, ...liveConflicts.errors }));
      setErrors((prev) => ({
        ...prev,
        items: "Resolve the highlighted teacher conflicts before saving.",
      }));
      return;
    }

    const newErrors: FormErrors = {};

    if (!academicClassId) {
      newErrors.academic_class_id = "Class is required";
    }
    // Validate academic_section_id if provided
    if (
      academicSectionId &&
      !academicSections.some((section) => section.id === academicSectionId)
    ) {
      newErrors.academic_section_id = "Invalid section";
    }

    const classRoutineItems: ClassRoutineItemFormValue[] = [];

    for (const day of DAYS) {
      const dayEntries = grid[day] ?? {};
      for (const periodNo of Object.keys(dayEntries)) {
        const numericPeriod = Number(periodNo);
        // Columns beyond the configured count are not rendered; a stale cell
        // there (period count was just reduced) must not be submitted.
        if (numericPeriod < 1 || numericPeriod > periodCount) continue;
        const cell = dayEntries[numericPeriod];
        if (cell?.teacher_id && cell?.subject_id) {
          classRoutineItems.push({
            day,
            period_no: numericPeriod,
            teacher_id: cell.teacher_id,
            subject_id: cell.subject_id,
            roomNo: cell.roomNo?.trim() ?? "",
          });
        }
      }
    }

    if (settingsError) {
      newErrors.items =
        "Period settings could not be loaded, so the routine cannot be saved.";
    } else if (classRoutineItems.length === 0) {
      newErrors.items = "Add at least one routine entry (teacher and subject)";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setTeacherErrors({});
    try {
      const result: any = await onSubmit({
        academic_class_id: academicClassId,
        academic_section_id: academicSectionId,
        batch_id: batchId,
        shift_id: shiftId,
        classRoutineItems: classRoutineItems,
      });
      // Inline teacher double-booking: show on the specific Teacher field, suppress global toast
      if (
        result &&
        result.success === false &&
        typeof result.message === "string" &&
        result.message.toLowerCase().includes("already assigned")
      ) {
        const msg = result.message as string;
        const match = msg.match(/on\s+(\w+),\s*period\s+(\d+)/i);
        if (match) {
          const rawDay = match[1].toUpperCase() as (typeof DAYS)[number];
          const period = Number(match[2]);
          const key = `${rawDay}-${period}`;
          const helper = `Already assigned to ${rawDay.charAt(0) + rawDay.slice(1).toLowerCase()} ${period}`;
          setTeacherErrors({ [key]: helper });
        } else {
          setErrors((prev) => ({ ...prev, items: msg }));
        }
        return;
      }
    } catch (err: any) {
      const msg = err?.message ?? (typeof err === "string" ? err : "");
      if (
        typeof msg === "string" &&
        msg.toLowerCase().includes("already assigned")
      ) {
        const match = msg.match(/on\s+(\w+),\s*period\s+(\d+)/i);
        if (match) {
          const rawDay = match[1].toUpperCase() as (typeof DAYS)[number];
          const period = Number(match[2]);
          const key = `${rawDay}-${period}`;
          const helper = `Already assigned to ${rawDay.charAt(0) + rawDay.slice(1).toLowerCase()} ${period}`;
          setTeacherErrors({ [key]: helper });
          return;
        }
      }
      console.log("onSubmit threw an error:", err);
    }
  };

  const handleReset = () => {
    setAcademicClassId(initialValues?.academic_class_id ?? "");
    setAcademicSectionId(initialValues?.academic_section_id ?? "");
    setBatchId(initialValues?.batch_id ?? "");
    setShiftId(initialValues?.shift_id ?? "");
    setProgramId(
      getInitialProgramIdFromClass(
        initialValues?.academic_class_id,
        academicClasses,
        departments,
      ) ||
        getInitialProgramId(
          initialValues?.classRoutineItems,
          teachers,
          departments,
        ),
    );
    setDepartmentId(
      getInitialDepartmentIdFromClass(
        initialValues?.academic_class_id,
        academicClasses,
      ) || getInitialDepartmentId(initialValues?.classRoutineItems, teachers),
    );
    setGrid(normalizeGrid(initialValues?.classRoutineItems));
    setErrors({});
    setTeacherErrors({});
  };

  return (
    <div className="min-w-0 space-y-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="grid min-w-0 grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 [&>div]:min-w-0">
        <FormSelect
          label="Program"
          placeholder="Select program"
          value={programId}
          onValueChange={(value) => {
            setProgramId(value);
            setDepartmentId("");
            setAcademicClassId("");
          }}
          options={programOptions}
          triggerClassName="h-11 w-full min-w-0 overflow-hidden rounded-2xl [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
        />
        <FormSelect
          label="Department/Group"
          placeholder="Select dep/group"
          value={departmentId}
          onValueChange={(value) => {
            setDepartmentId(value);
            setAcademicClassId("");
          }}
          options={departmentOptions}
          disabled={!programId}
          triggerClassName="h-11 w-full min-w-0 overflow-hidden rounded-2xl [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
        />
        <FormSelect
          label="Year"
          placeholder="Select year"
          value={academicClassId}
          onValueChange={(value) => {
            setAcademicClassId(value);
            if (errors.academic_class_id) {
              setErrors((prev) => ({ ...prev, academic_class_id: undefined }));
            }
          }}
          options={classOptions}
          disabled={!departmentId}
          triggerClassName="h-11 w-full min-w-0 overflow-hidden rounded-2xl [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
          error={errors.academic_class_id}
        />
        <FormSelect
          label="Batch"
          placeholder="Select batch"
          value={batchId}
          onValueChange={(value) => {
            setBatchId(value);
            if (errors.batch_id) {
              setErrors((prev) => ({ ...prev, batch_id: undefined }));
            }
          }}
          options={batchOptions}
          triggerClassName="h-11 w-full min-w-0 overflow-hidden rounded-2xl [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
          error={errors.batch_id}
        />
        <FormSelect
          label="Section (optional)"
          placeholder="Select section"
          value={academicSectionId}
          onValueChange={(value) => {
            setAcademicSectionId(value);
            if (errors.academic_section_id) {
              setErrors((prev) => ({
                ...prev,
                academic_section_id: undefined,
              }));
            }
          }}
          options={sectionOptions}
          triggerClassName="h-11 w-full min-w-0 overflow-hidden rounded-2xl [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
          error={errors.academic_section_id}
        />
        <FormSelect
          label="Shift (optional)"
          placeholder="Select shift"
          value={shiftId}
          onValueChange={(value) => {
            setShiftId(value);
            if (errors.shift_id) {
              setErrors((prev) => ({ ...prev, shift_id: undefined }));
            }
          }}
          options={shiftOptions}
          triggerClassName="h-11 w-full min-w-0 overflow-hidden rounded-2xl [&_[data-slot=select-value]]:min-w-0 [&_[data-slot=select-value]]:truncate"
          error={errors.shift_id}
        />
      </div>

      <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Routine Grid</h2>
          <p className="text-sm text-slate-500">
            {programId && departmentId && academicClassId
              ? "Assign teacher, subject and room for each period. Subjects are filtered by Program + Department + Year (Level/Year)."
              : "Select Program, Department and Year above to see subjects."}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="w-fit gap-2 rounded-2xl"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      {errors.items ? (
        <p className="text-sm text-destructive">{errors.items}</p>
      ) : null}

      {settingsError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-destructive/40 bg-destructive/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-medium text-destructive">
              Period settings unavailable
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {settingsError}
            </p>
          </div>
        </div>
      ) : settingsLoading ? (
        <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
        </div>
      ) : (
        <div className="min-w-0 overflow-x-auto rounded-2xl border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead className="sticky top-0 z-20">
              <tr>
                <th className="sticky left-0 z-30 w-48 min-w-48 bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700">
                  Day
                </th>
                {generatePeriodColumns(periodCount).map((col) => (
                  <th
                    key={col.periodNumber}
                    className="min-w-40 bg-blue-600 px-4 py-3 text-center font-semibold text-white"
                  >
                    {ordinal(col.periodNumber)} Period
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day} className="border-t border-slate-100 align-top">
                  <td className="sticky left-0 z-10 bg-slate-50 px-4 py-6 text-base font-medium text-slate-700">
                    {day}
                  </td>
                  {generatePeriodColumns(periodCount).map((col) => {
                    const period = col.periodNumber;
                    const cell = grid[day]?.[period] ?? buildEmptyCell();
                    const teacherLabel = cell.teacher_id
                      ? getTeacherLabel(cell.teacher_id)
                      : "";
                    // Server-reported error wins; otherwise the live
                    // combined-class check (blocking error, else soft warning
                    // when subject/room are still empty). All clear once the
                    // combination becomes a valid combined class.
                    const cellKey = `${day}-${period}`;
                    const teacherError =
                      teacherErrors[cellKey] ??
                      clientConflicts.errors[cellKey];
                    const teacherWarning = teacherError
                      ? undefined
                      : clientConflicts.warnings[cellKey];

                    return (
                      <td
                        key={`${day}-${period}`}
                        className="min-w-40 px-3 py-4"
                      >
                        {/*
                          DOM order is the tab order: teacher -> subject ->
                          room -> the next period's teacher. The two clear (X)
                          buttons are mouse shortcuts only (tabIndex -1), so they
                          never interrupt that path.
                        */}
                        <div className="grid gap-2">
                          <div className="relative w-full">
                            <button
                              type="button"
                              onClick={() => openTeacherDialog(day, period)}
                              className={`flex h-8 w-full items-center justify-between rounded-xl border bg-background px-3 pr-8 text-xs text-left hover:bg-slate-50 ${teacherError ? "border-destructive ring-1 ring-destructive" : "border-input"}`}
                            >
                              <span
                                className={
                                  teacherLabel
                                    ? "truncate pr-1 text-slate-900"
                                    : "truncate pr-1 text-muted-foreground"
                                }
                              >
                                {teacherLabel || "Teacher Name"}
                              </span>
                            </button>
                            {cell.teacher_id ? (
                              <button
                                type="button"
                                aria-label="Clear teacher"
                                tabIndex={-1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCell(day, period, "teacher_id", "");
                                }}
                                className="absolute right-1 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-100 hover:text-foreground"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                          {teacherError ? (
                            <p className="text-xs text-destructive">
                              {teacherError}
                            </p>
                          ) : teacherWarning ? (
                            <p className="text-xs text-amber-600">
                              {teacherWarning}
                            </p>
                          ) : null}
                          <div className="relative w-full">
                            <FormSelect
                              placeholder={
                                programId && departmentId && academicClassId
                                  ? "Subject Name"
                                  : "Select program, department & year first"
                              }
                              value={cell.subject_id}
                              onValueChange={(value) =>
                                updateCell(day, period, "subject_id", value)
                              }
                              options={subjectOptions}
                              disabled={
                                !programId || !departmentId || !academicClassId
                              }
                              triggerClassName="h-8 w-full rounded-xl pr-10 text-xs [&>svg:last-child]:right-2"
                              contentClassName="max-h-72"
                            />
                            {cell.subject_id ? (
                              <button
                                type="button"
                                aria-label="Clear subject"
                                tabIndex={-1}
                                disabled={
                                  !programId ||
                                  !departmentId ||
                                  !academicClassId
                                }
                                onClick={() =>
                                  updateCell(day, period, "subject_id", "")
                                }
                                className="absolute right-7 top-1/2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-slate-100 hover:text-foreground disabled:opacity-0"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            ) : null}
                          </div>
                          <Input
                            id={`room-no-${day}-${period}`}
                            aria-label={`Room No, ${day} ${ordinal(
                              period,
                            )} period`}
                            placeholder="Room No"
                            value={cell.roomNo}
                            disabled={!cell.subject_id}
                            maxLength={20}
                            onChange={(e) =>
                              updateCell(day, period, "roomNo", e.target.value)
                            }
                            className="h-8 w-full rounded-xl px-3 text-xs"
                          />
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
        <Button
          type="button"
          variant="outline"
          className="min-w-28 rounded-2xl"
          onClick={() => {
            if (onCancel) onCancel();
            else handleReset();
          }}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          className="min-w-36 rounded-2xl"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>

      <Dialog
        open={activeCell !== null}
        onOpenChange={(open) => !open && closeTeacherDialog()}
      >
        <DialogContent className="rounded-3xl sm:max-w-xl">
          <DialogHeader className="space-y-1.5">
            <DialogTitle className="text-lg font-semibold text-slate-900">
              Select Teacher
            </DialogTitle>
            {activeCell ? (
              <span className="inline-flex w-fit items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                {activeCell.day.charAt(0)}
                {activeCell.day.slice(1).toLowerCase()} · Period{" "}
                {activeCell.period}
              </span>
            ) : null}
          </DialogHeader>

          <div className="space-y-4 py-1">
            <div className="grid grid-cols-2 gap-3">
              <FormSelect
                label="Program"
                placeholder="Filter by program"
                value={dialogProgramId || ALL_PROGRAMS_VALUE}
                onValueChange={(value) => {
                  const newProgramId =
                    value === ALL_PROGRAMS_VALUE ? "" : value;
                  setDialogProgramId(newProgramId);
                  // Clear teacher choice if it no longer belongs to the newly picked program
                  setDialogTeacherId((prev) => {
                    if (!newProgramId) return prev;
                    return getTeacherProgramId(prev) === newProgramId
                      ? prev
                      : "";
                  });
                }}
                options={dialogProgramOptions}
                triggerClassName="h-11 rounded-2xl"
              />

              <div className="space-y-2">
                <Label className="text-sm font-medium text-slate-900">
                  Search
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={dialogSearchQuery}
                    onChange={(e) => setDialogSearchQuery(e.target.value)}
                    placeholder="Search teacher by name..."
                    className="h-11 rounded-2xl border-slate-200 pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-slate-900">
                  Teacher <span className="text-rose-500">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Choose a teacher from the list below to assign them to this
                  period.
                </p>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 shadow-sm">
                {dialogFilteredTeachers.length === 0 ? (
                  <p className="p-4 text-center text-sm text-muted-foreground">
                    No teachers found
                    {dialogSearchQuery ? " for this search" : ""}.
                  </p>
                ) : (
                  dialogFilteredTeachers.map((teacher) => {
                    const isSelected = dialogTeacherId === teacher.id;
                    const label = getItemLabel(teacher);
                    return (
                      <button
                        key={teacher.id}
                        type="button"
                        onClick={() => setDialogTeacherId(teacher.id)}
                        className={`flex w-full items-center gap-3 border-b border-slate-100 px-3 py-2.5 text-left text-sm transition-colors last:border-b-0 ${
                          isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            isSelected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {getInitials(label)}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block truncate font-medium ${isSelected ? "text-blue-900" : "text-slate-900"}`}
                          >
                            {label}
                          </span>
                          {teacher.department_name ? (
                            <span className="mt-0.5 inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                              {teacher.department_name}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <Check className="h-4 w-4 shrink-0 text-blue-600" />
                        ) : null}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={closeTeacherDialog}
              className="rounded-2xl"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmTeacherSelection}
              disabled={!dialogTeacherId}
              className="rounded-2xl"
            >
              Select
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
