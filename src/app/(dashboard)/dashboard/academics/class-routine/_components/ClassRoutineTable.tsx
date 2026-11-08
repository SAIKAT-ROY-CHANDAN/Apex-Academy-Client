"use client";

import { Edit, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  deleteClassRoutine,
  updateClassRoutine,
} from "@/services/classRoutine";
import ClassRoutineForm, {
  type ClassRoutineFormValues,
  ordinal,
} from "./ClassRoutineForm";

/** SATURDAY -> Saturday */
function formatDayLabel(day: string | null | undefined): string {
  if (!day) return "";
  return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase();
}

export type ClassRoutineItemRecord = {
  day: string;
  period_no: number;
  teacher_id: string;
  subject_id: string;
  /** Optional room / lab for this slot. null for routines saved before rooms. */
  roomNo?: string | null;
};

export type ClassRoutineRecord = {
  id: string;
  academic_class_id?: string | null;
  academic_section_id?: string | null;
  batch_id?: string | null;
  shift_id?: string | null;
  classRoutineItems?: ClassRoutineItemRecord[];
  academicClass?: {
    class_name?: string;
    name?: string;
    // Needed to resolve this routine's Program / Department columns below.
    // Adjust the field name here if your API returns it differently.
    program_id?: string | null;
    department_id?: string | null;
  } | null;
  academicSection?: { section_name?: string; name?: string } | null;
  batch?: { batch_name?: string; name?: string } | null;
  shift?: { shift_name?: string; name?: string } | null;
  created_at?: string;
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
  program_name?: string;
  program_id?: string;
};

type ClassRoutineTableProps = {
  routines: ClassRoutineRecord[];
  academicClasses: OptionItem[];
  academicSections: OptionItem[];
  batches: OptionItem[];
  shifts: OptionItem[];
  subjects: OptionItem[];
  teachers: OptionItem[];
  departments: OptionItem[];
  programs: OptionItem[];
};

function getLabel(item?: OptionItem | null) {
  if (!item) return "—";
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
    "—"
  );
}

function getClassLabel(routine: ClassRoutineRecord) {
  return (
    routine.academicClass?.class_name ?? routine.academicClass?.name ?? "—"
  );
}

function getYearLabel(routine: ClassRoutineRecord) {
  return getClassLabel(routine);
}

function getProgramLabel(routine: ClassRoutineRecord, programs: OptionItem[]) {
  const programId = routine.academicClass?.program_id;
  if (!programId) return "—";
  return getLabel(programs.find((program) => program.id === programId));
}

function getDepartmentLabel(
  routine: ClassRoutineRecord,
  departments: OptionItem[],
) {
  const departmentId = routine.academicClass?.department_id;
  if (!departmentId) return "—";
  return getLabel(
    departments.find((department) => department.id === departmentId),
  );
}

function getBatchLabel(routine: ClassRoutineRecord, batches: OptionItem[]) {
  if (routine.batch?.batch_name) return routine.batch.batch_name;
  if (routine.batch?.name) return routine.batch.name;
  if (routine.batch_id) {
    const found = batches.find((b) => b.id === routine.batch_id);
    if (found) return getLabel(found);
  }
  return "—";
}

function getTeacherNames(
  routine: ClassRoutineRecord,
  teachers: OptionItem[],
): string[] {
  const teacherIds = Array.from(
    new Set(
      (routine.classRoutineItems ?? [])
        .map((item) => item.teacher_id)
        .filter(Boolean),
    ),
  );
  return teacherIds
    .map((id) => teachers.find((teacher) => teacher.id === id))
    .filter((teacher): teacher is OptionItem => Boolean(teacher))
    .map((teacher) => getLabel(teacher));
}

function getSubjectNames(
  routine: ClassRoutineRecord,
  subjects: OptionItem[],
): string[] {
  const subjectIds = Array.from(
    new Set(
      (routine.classRoutineItems ?? [])
        .map((item) => item.subject_id)
        .filter(Boolean),
    ),
  );
  return subjectIds
    .map((id) => subjects.find((subject) => subject.id === id))
    .filter((subject): subject is OptionItem => Boolean(subject))
    .map((subject) => getLabel(subject));
}

/**
 * Rooms used by a routine, de-duplicated case-insensitively (the API compares
 * them that way too) and ordered so the column is stable between renders.
 * Routines saved before rooms existed simply have none.
 */
function getRoomEntries(routine: ClassRoutineRecord): string[] {
  const seen = new Map<string, string>();
  for (const item of routine.classRoutineItems ?? []) {
    const roomNo = (item.roomNo ?? "").trim();
    if (!roomNo) continue;
    const key = roomNo.toLowerCase();
    if (!seen.has(key)) seen.set(key, roomNo);
  }
  return Array.from(seen.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
}

/** "Room" tooltip line for one cell: "Saturday · 1st period — Room 101". */
function getRoomSlotLabel(item: ClassRoutineItemRecord): string {
  const day = formatDayLabel(item.day);
  return `${day} · ${ordinal(item.period_no)} period — Room ${(item.roomNo ?? "").trim()}`;
}

/**
 * Distinct rooms as small badges, with the full slot-by-slot list in a tooltip.
 * Nothing is rendered when the routine has no rooms.
 */
function RoomsCell({ routine }: { routine: ClassRoutineRecord }) {
  const rooms = getRoomEntries(routine);
  if (rooms.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const [first, ...rest] = rooms;
  const slotLabels = (routine.classRoutineItems ?? [])
    .filter((item) => (item.roomNo ?? "").trim())
    .map(getRoomSlotLabel);

  return (
    <div className="flex max-w-64 items-center gap-1.5">
      <span className="truncate text-slate-700">{first}</span>
      {rest.length > 0 ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>
                <Badge
                  variant="secondary"
                  className="shrink-0 cursor-default rounded-full px-2 py-0 text-[11px] font-medium"
                >
                  +{rest.length}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm leading-snug">{rooms.join(", ")}</p>
              <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
                {slotLabels.map((label) => (
                  <li key={label}>{label}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

type TeacherCountEntry = { id: string; name: string; count: number };

function getTeacherEntriesWithCounts(
  routine: ClassRoutineRecord,
  teachers: OptionItem[],
): TeacherCountEntry[] {
  const counts = new Map<string, number>();
  for (const item of routine.classRoutineItems ?? []) {
    if (!item.teacher_id) continue;
    counts.set(item.teacher_id, (counts.get(item.teacher_id) ?? 0) + 1);
  }
  const entries: TeacherCountEntry[] = [];
  for (const [teacherId, count] of counts.entries()) {
    const teacher = teachers.find((t) => t.id === teacherId);
    const name = teacher ? getLabel(teacher) : teacherId.slice(0, 8);
    entries.push({ id: teacherId, name, count });
  }
  // Sort by count desc for primary teacher first
  entries.sort((a, b) => b.count - a.count);
  return entries;
}

function mapRoutineToFormValues(
  routine: ClassRoutineRecord,
): ClassRoutineFormValues {
  return {
    academic_class_id: routine.academic_class_id ?? "",
    academic_section_id: routine.academic_section_id ?? "",
    batch_id: routine.batch_id ?? "",
    shift_id: routine.shift_id ?? "",
    classRoutineItems: (routine.classRoutineItems ?? []).map((item) => ({
      day: item.day as ClassRoutineFormValues["classRoutineItems"][number]["day"],
      period_no: item.period_no,
      teacher_id: item.teacher_id,
      subject_id: item.subject_id,
      roomNo: item.roomNo ?? "",
    })),
  };
}

// Renders "First Name +2" with a badge; hovering the badge shows the full
// comma-separated list in a tooltip instead of relying on the native
// title="" attribute, which browsers render inconsistently (slow, tiny,
// sometimes clipped).
function NamesCell({ names }: { names: string[] }) {
  if (names.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }

  const [first, ...rest] = names;

  return (
    <div className="flex max-w-64 items-center gap-1.5">
      <span className="truncate text-slate-700">{first}</span>
      {rest.length > 0 ? (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span>
                <Badge
                  variant="secondary"
                  className="shrink-0 cursor-default rounded-full px-2 py-0 text-[11px] font-medium"
                >
                  +{rest.length}
                </Badge>
              </span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="text-sm leading-snug">{names.join(", ")}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ) : null}
    </div>
  );
}

function TeacherCountCell({ entries }: { entries: TeacherCountEntry[] }) {
  if (entries.length === 0) {
    return <span className="text-muted-foreground">—</span>;
  }
  const total = entries.reduce((sum, e) => sum + e.count, 0);
  const [primary, ...rest] = entries;

  // Single teacher: "Phill salt (24 classes)" — matches Items total when sole teacher
  if (entries.length === 1) {
    return (
      <span className="text-slate-700">
        {primary.name}{" "}
        <span className="text-muted-foreground">({primary.count} classes)</span>
      </span>
    );
  }

  // Multiple teachers: "Phill salt (12) +2" with tooltip listing all counts and total
  const tooltipText =
    entries.map((e) => `${e.name} (${e.count})`).join(", ") +
    ` — ${total} classes total`;
  return (
    <div className="flex max-w-64 items-center gap-1.5">
      <span className="truncate text-slate-700">
        {primary.name}{" "}
        <span className="text-muted-foreground">({primary.count})</span>
      </span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <span>
              <Badge
                variant="secondary"
                className="shrink-0 cursor-default rounded-full px-2 py-0 text-[11px] font-medium"
                title={`${entries.length} teachers, ${total} classes`}
              >
                +{rest.length} · {total} classes
              </Badge>
            </span>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-sm leading-snug">{tooltipText}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {entries.length} teachers, {total} classes
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

export default function ClassRoutineTable({
  routines,
  academicClasses,
  academicSections,
  batches,
  shifts,
  subjects,
  teachers,
  departments,
  programs,
}: ClassRoutineTableProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoutine, setSelectedRoutine] =
    useState<ClassRoutineRecord | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [routineToDelete, setRoutineToDelete] =
    useState<ClassRoutineRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isSaving, setIsSaving] = useState(false);

  const filteredRoutines = useMemo(() => {
    if (!searchQuery.trim()) return routines;
    const query = searchQuery.toLowerCase();
    return routines.filter((routine) => {
      const searchable = [
        getYearLabel(routine),
        getProgramLabel(routine, programs),
        getDepartmentLabel(routine, departments),
        getBatchLabel(routine, batches),
        ...getTeacherNames(routine, teachers),
      ]
        .join(" ")
        .toLowerCase();
      return searchable.includes(query);
    });
  }, [routines, searchQuery, programs, departments, batches, teachers]);

  const handleSave = async (values: ClassRoutineFormValues) => {
    if (!selectedRoutine)
      return { success: false, message: "No routine selected" };
    setIsSaving(true);
    try {
      const response = await updateClassRoutine(selectedRoutine.id, values);
      if (!response?.success) {
        const msg = response?.message ?? "";
        if (
          typeof msg === "string" &&
          msg.toLowerCase().includes("already assigned")
        ) {
          return response;
        }
        toast.error(msg || "Failed to update class routine");
        return response;
      }

      toast.success(response?.message ?? "Class routine updated successfully");
      setEditOpen(false);
      setSelectedRoutine(null);
      router.refresh();
      return response;
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = () => {
    if (!routineToDelete) return;

    startTransition(async () => {
      const response = await deleteClassRoutine(routineToDelete.id);
      if (!response?.success) {
        toast.error(response?.message ?? "Failed to delete class routine");
        return;
      }

      toast.success(response?.message ?? "Class routine deleted successfully");
      setDeleteOpen(false);
      setRoutineToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Class Routines
          </CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search routines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredRoutines.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No class routines found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Program</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Year</th>
                    <th className="px-4 py-3">Batch</th>
                    <th className="px-4 py-3">Teacher</th>
                    <th className="px-4 py-3">Rooms</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoutines.map((routine, index) => (
                    <tr
                      key={routine.id}
                      className="border-b transition-colors hover:bg-muted/20"
                    >
                      <td className="px-4 py-4 text-muted-foreground">
                        {index + 1}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {getProgramLabel(routine, programs)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {getDepartmentLabel(routine, departments)}
                      </td>
                      <td className="px-4 py-4 font-medium">
                        {getYearLabel(routine)}
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {getBatchLabel(routine, batches)}
                      </td>
                      <td className="px-4 py-4">
                        <TeacherCountCell
                          entries={getTeacherEntriesWithCounts(
                            routine,
                            teachers,
                          )}
                        />
                      </td>
                      <td className="px-4 py-4">
                        <RoomsCell routine={routine} />
                      </td>
                      <td className="px-4 py-4 text-muted-foreground">
                        {routine.classRoutineItems?.length ?? 0}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Edit class routine"
                            onClick={() => {
                              setSelectedRoutine(routine);
                              setEditOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            title="Delete class routine"
                            onClick={() => {
                              setRoutineToDelete(routine);
                              setDeleteOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) setSelectedRoutine(null);
        }}
      >
        <DialogContent className="w-[96vw] max-w-[1600px] sm:max-w-[95vw] max-h-[92vh] overflow-hidden rounded-3xl p-0 gap-0 flex flex-col">
          <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-5">
            <DialogTitle className="text-xl font-semibold">
              Edit Class Routine
            </DialogTitle>
            <DialogDescription>
              Update the class, batch, shift, and period assignments.
            </DialogDescription>
          </DialogHeader>
          {selectedRoutine ? (
            <div className="min-w-0 flex-1 overflow-y-auto px-6 py-4">
              <ClassRoutineForm
                academicClasses={academicClasses}
                academicSections={academicSections}
                batches={batches}
                shifts={shifts}
                subjects={subjects}
                teachers={teachers}
                departments={departments}
                programs={programs}
                initialValues={mapRoutineToFormValues(selectedRoutine)}
                allRoutines={routines}
                currentRoutineId={selectedRoutine.id}
                submitLabel="Update Routine"
                isSubmitting={isSaving}
                onSubmit={handleSave}
                onCancel={() => {
                  setEditOpen(false);
                  setSelectedRoutine(null);
                }}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Class Routine"
        description={
          routineToDelete
            ? `Are you sure you want to delete the class routine for ${getClassLabel(routineToDelete)}? This action cannot be undone.`
            : "Are you sure you want to delete this class routine? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
