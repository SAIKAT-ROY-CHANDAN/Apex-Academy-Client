"use client";

import {
  Award,
  Check,
  GraduationCap,
  Hash,
  Loader2,
  PencilLine,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import type { TPromotionLookups } from "../../../_components/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAcademicSections } from "@/services/academicSection";
import { updateStudentEnrollment } from "@/services/studentEnrollment";
import { cn } from "@/lib/utils";
import type { THistoryEnrollment } from "./types";

interface EditEnrollmentDialogProps {
  enrollment: THistoryEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookups: TPromotionLookups;
  onUpdated: () => void;
}

const ENROLLMENT_STATUSES = [
  "ACTIVE",
  "PROMOTED",
  "WITH_BACKLOG",
  "REPEATED",
] as const;

const ENROLLMENT_TYPES = ["REGULAR", "REPEAT", "SUPPLEMENTARY"] as const;

const STATUS_STYLES: Record<string, string> = {
  ACTIVE:
    "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
  PROMOTED: "border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100",
  WITH_BACKLOG:
    "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  REPEATED: "border-rose-300 bg-rose-50 text-rose-700 hover:bg-rose-100",
};

const humanize = (value: string) =>
  value
    .split("_")
    .map((w) => w.charAt(0) + w.slice(1).toLowerCase())
    .join(" ");

const Field = ({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={htmlFor} className="text-xs font-semibold text-slate-700">
      {label}
    </Label>
    {children}
    {hint && (
      <p className="text-[11px] leading-tight text-muted-foreground">{hint}</p>
    )}
  </div>
);

const SectionHeading = ({
  icon,
  title,
  hint,
}: {
  icon: ReactNode;
  title: string;
  hint?: string;
}) => (
  <div className="flex items-center gap-2">
    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
      {icon}
    </span>
    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
      {title}
    </h4>
    {hint && (
      <span className="text-[11px] font-normal text-muted-foreground">
        {hint}
      </span>
    )}
  </div>
);

const EditEnrollmentDialog = ({
  enrollment,
  open,
  onOpenChange,
  lookups,
  onUpdated,
}: EditEnrollmentDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [sessionId, setSessionId] = useState("");
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [batchId, setBatchId] = useState("");
  const [shiftId, setShiftId] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [status, setStatus] = useState<string>("ACTIVE");
  const [type, setType] = useState<string>("REGULAR");
  const [initial, setInitial] = useState<Record<string, string> | null>(null);
  const [sections, setSections] = useState<
    Array<{ id: string; section_name: string }>
  >([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Prefill the form every time a new enrollment row is opened
  useEffect(() => {
    if (enrollment && open) {
      const snapshot = {
        sessionId: enrollment.academic_session_id ?? "",
        classId: enrollment.academic_class_id ?? "",
        sectionId: enrollment.academic_section_id ?? "",
        batchId: enrollment.batch_id ?? "",
        shiftId: enrollment.shift_id ?? "",
        rollNumber: enrollment.roll_number ?? "",
        registrationNumber: enrollment.registration_number ?? "",
        status: enrollment.enrollment_status ?? "ACTIVE",
        type: enrollment.enrollment_type ?? "REGULAR",
      };
      setSessionId(snapshot.sessionId);
      setClassId(snapshot.classId);
      setSectionId(snapshot.sectionId);
      setBatchId(snapshot.batchId);
      setShiftId(snapshot.shiftId);
      setRollNumber(snapshot.rollNumber);
      setRegistrationNumber(snapshot.registrationNumber);
      setStatus(snapshot.status);
      setType(snapshot.type);
      setInitial(snapshot);
      setSections([]);
    }
  }, [enrollment, open]);

  // Load sections for the chosen class (prefer embedded, else fetch)
  useEffect(() => {
    if (!classId) {
      setSections([]);
      return;
    }
    const embedded = lookups.classes.find(
      (c) => c.id === classId,
    )?.academicSections;
    if (embedded && embedded.length > 0) {
      setSections(embedded);
      return;
    }
    let cancelled = false;
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const res = await getAcademicSections([
          { label: "filter", value: JSON.stringify({ class_id: classId }) },
        ]);
        if (!cancelled) setSections(res?.data ?? []);
      } catch {
        if (!cancelled) setSections([]);
      } finally {
        if (!cancelled) setLoadingSections(false);
      }
    };
    fetchSections();
    return () => {
      cancelled = true;
    };
  }, [classId, lookups.classes]);

  if (!enrollment) return null;

  // Scope the class dropdown to the edited row's own department, so only
  // that department's nested classes are offered instead of every class in
  // the system. Falls back to all classes when the department is unknown or
  // the scope resolves to nothing.
  const referenceDeptId =
    lookups.classes.find((c) => c.id === (enrollment.academic_class_id ?? ""))
      ?.department_id ?? null;
  const scopedClasses = referenceDeptId
    ? lookups.classes.filter((c) => c.department_id === referenceDeptId)
    : lookups.classes;
  const classOptions =
    scopedClasses.length === 0 ? lookups.classes : scopedClasses;
  const isScoped =
    scopedClasses.length > 0 && scopedClasses.length < lookups.classes.length;

  const isDirty =
    !initial ||
    sessionId !== initial.sessionId ||
    classId !== initial.classId ||
    sectionId !== initial.sectionId ||
    batchId !== initial.batchId ||
    shiftId !== initial.shiftId ||
    rollNumber.trim() !== (initial.rollNumber ?? "").trim() ||
    registrationNumber.trim() !== (initial.registrationNumber ?? "").trim() ||
    status !== initial.status ||
    type !== initial.type;

  const handleSubmit = () => {
    // Empty optional selects are omitted so existing values are kept.
    // (The update API rejects empty-string UUIDs.)
    const payload: Record<string, string> = {};
    if (sessionId) payload.academic_session_id = sessionId;
    if (classId) payload.academic_class_id = classId;
    if (sectionId) payload.academic_section_id = sectionId;
    if (batchId) payload.batch_id = batchId;
    if (shiftId) payload.shift_id = shiftId;
    if (rollNumber.trim()) payload.roll_number = rollNumber.trim();
    if (registrationNumber.trim())
      payload.registration_number = registrationNumber.trim();
    if (status) payload.enrollment_status = status;
    if (type) payload.enrollment_type = type;

    startTransition(async () => {
      const response = await updateStudentEnrollment(enrollment.id, payload);
      if (!response?.success) {
        toast.error(response?.message ?? "Failed to update enrollment");
        return;
      }
      toast.success(response?.message ?? "Enrollment updated successfully");
      onUpdated();
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="rounded-t-lg border-b border-border/60 bg-muted/30 px-6 py-4">
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <PencilLine className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-semibold text-slate-900">
                Edit Enrollment
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                {enrollment.student?.name ?? "Student"} ·{" "}
                {enrollment.academicSession?.session_name ?? "—"} ·{" "}
                {enrollment.academicClass?.class_name ?? "—"}
              </span>
            </span>
            <span className="ml-auto flex shrink-0 items-center gap-1.5">
              {enrollment.is_primary && (
                <Badge variant="default">Current</Badge>
              )}
              <Badge variant="secondary">
                {enrollment.enrollment_status ?? "ACTIVE"}
              </Badge>
            </span>
          </DialogTitle>
          <DialogDescription className="pl-[52px]">
            Fix anything recorded wrong — placement, batch, outcome or IDs.
            {isDirty ? " Unsaved changes." : " No changes yet."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Academic placement */}
          <section className="space-y-3">
            <SectionHeading
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              title="Academic Placement"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="Session">
                <Select value={sessionId} onValueChange={(value) => setSessionId(value ?? "")}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select session">
                      {sessionId
                        ? lookups.sessions.find((s) => s.id === sessionId)
                          ?.session_name
                        : "Select session"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.sessions.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.session_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Class / Year"
                hint={
                  isScoped
                    ? `This department only (${classOptions.length})`
                    : undefined
                }
              >
                <Select value={classId} onValueChange={(value) => setClassId(value ?? "")}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select class">
                      {classId
                        ? lookups.classes.find((c) => c.id === classId)
                          ?.class_name
                        : "Select class"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Section">
                <Select
                  value={sectionId}
                  onValueChange={(value) => setSectionId(value ?? "")}
                  disabled={!classId || loadingSections}
                >
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue
                      placeholder={
                        !classId
                          ? "Class first"
                          : loadingSections
                            ? "Loading..."
                            : "Select section"
                      }
                    >
                      {sectionId
                        ? sections.find((s) => s.id === sectionId)?.section_name
                        : !classId
                          ? "Class first"
                          : loadingSections
                            ? "Loading..."
                            : "Select section"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.section_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Batch & shift */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Users className="h-3.5 w-3.5" />}
              title="Batch & Shift"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Batch">
                <Select value={batchId} onValueChange={(value) => setBatchId(value ?? "")}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select batch">
                      {batchId
                        ? lookups.batches.find((b) => b.id === batchId)
                          ?.batch_name
                        : "Select batch"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.batches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.batch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Shift" hint="Leave as-is unless changing">
                <Select value={shiftId} onValueChange={(value) => setShiftId(value ?? "")}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select shift">
                      {shiftId
                        ? lookups.shifts.find((s) => s.id === shiftId)?.name
                        : "Select shift"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {lookups.shifts.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </section>

          {/* Outcome */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Award className="h-3.5 w-3.5" />}
              title="Outcome"
              hint="How this row closed / continues"
            />
            <Field label="Enrollment Status">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {ENROLLMENT_STATUSES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    aria-pressed={status === s}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all",
                      status === s
                        ? cn(STATUS_STYLES[s], "shadow-sm ring-2 ring-offset-1")
                        : "border-border bg-white text-muted-foreground hover:border-slate-300 hover:text-foreground",
                    )}
                  >
                    {status === s && <Check className="h-3.5 w-3.5" />}
                    {humanize(s)}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Enrollment Type">
              <div className="grid grid-cols-3 gap-2">
                {ENROLLMENT_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={type === t}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-semibold transition-all",
                      type === t
                        ? "border-primary bg-primary/10 text-primary shadow-sm ring-2 ring-primary/30 ring-offset-1"
                        : "border-border bg-white text-muted-foreground hover:border-slate-300 hover:text-foreground",
                    )}
                  >
                    {type === t && <Check className="h-3.5 w-3.5" />}
                    {humanize(t)}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          {/* Identification */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Hash className="h-3.5 w-3.5" />}
              title="Identification"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Roll Number" htmlFor="history_roll_number">
                <Input
                  id="history_roll_number"
                  placeholder="e.g. 101"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </Field>
              <Field
                label="Registration Number"
                htmlFor="history_registration_number"
              >
                <Input
                  id="history_registration_number"
                  placeholder="e.g. REG-2026-001"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </Field>
            </div>
          </section>
        </div>

        <DialogFooter className="border-t border-border/60 bg-muted/30 px-6 py-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="h-10 gap-1.5 rounded-lg"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !isDirty}
            className="h-10 gap-1.5 rounded-lg"
            title={!isDirty ? "Change something first" : "Save changes"}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditEnrollmentDialog;
