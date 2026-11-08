"use client";

import {
  ArrowRight,
  Award,
  GraduationCap,
  Hash,
  Loader2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAcademicSections } from "@/services/academicSection";
import { promoteStudent } from "@/services/studentPromotion";
import {
  Field,
  NextTypeSelector,
  OutcomeSelector,
  PROMOTION_OUTCOME_META,
  SectionHeading,
} from "./promotion-dialog-ui";
import type {
  TPromotionEnrollment,
  TPromotionLookups,
  TPromotionOutcome,
} from "./types";

interface PromoteStudentDialogProps {
  enrollment: TPromotionEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookups: TPromotionLookups;
  onPromoted: (enrollmentId: string) => void;
  // Scoped class list (program → department filter). Falls back to all classes.
  targetClasses?: TPromotionLookups["classes"];
  isScoped?: boolean;
}

const PromoteStudentDialog = ({
  enrollment,
  open,
  onOpenChange,
  lookups,
  onPromoted,
  targetClasses,
  isScoped = false,
}: PromoteStudentDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [outcome, setOutcome] = useState<TPromotionOutcome>("PROMOTED");
  const [nextType, setNextType] = useState("REGULAR");
  const [targetSession, setTargetSession] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [targetBatch, setTargetBatch] = useState("");
  const [targetShift, setTargetShift] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [failCount, setFailCount] = useState("");
  const [sections, setSections] = useState<
    Array<{ id: string; section_name: string }>
  >([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Only classes under the current program → department filter are offered
  // as promotion targets (falls back to every class when unscoped).
  // For REPEATED we ensure the student's current class is always present even if filtered out.
  const baseClassOptions = targetClasses ?? lookups.classes;
  const currentClassId = enrollment?.academicClass?.id ?? null;
  const currentClassInOptions = currentClassId ? baseClassOptions.some((c) => c.id === currentClassId) : true;
  const classOptions = !currentClassInOptions && enrollment?.academicClass
    ? [...baseClassOptions, { id: enrollment.academicClass.id, class_name: enrollment.academicClass.class_name, academicSections: enrollment.academicClass.academicSections } as (typeof baseClassOptions)[number]]
    : baseClassOptions;

  // Outcome-driven locking: REPEATED = class locked to current, PROMOTED/WITH_BACKLOG = session+batch locked to current.
  // Section/shift stay editable per requirements.
  const isRepeated = outcome === "REPEATED";
  const isSessionLocked = outcome === "PROMOTED" || outcome === "WITH_BACKLOG";
  const isBatchLocked = outcome === "PROMOTED" || outcome === "WITH_BACKLOG";
  const isClassLocked = isRepeated;

  const currentSessionId = enrollment?.academicSession?.id ?? "";

  // Reset the form every time a new student is opened — respects outcome locking
  useEffect(() => {
    if (enrollment && open) {
      // Default outcome is PROMOTED (session+batch locked)
      setOutcome("PROMOTED");
      setNextType("REGULAR");
      // Session+batch locked to current for PROMOTED by default
      setTargetSession(enrollment.academicSession?.id ?? "");
      setTargetClass("");
      setTargetSection("");
      setTargetBatch(enrollment.batch?.id ?? "");
      setTargetShift("");
      setRollNumber(enrollment.roll_number ?? "");
      setRegistrationNumber(enrollment.registration_number ?? "");
      setFailCount("");
      setSections([]);
    }
  }, [enrollment, open]);

  // Outcome drives the suggested next enrollment type and locked fields (still overridable for nextType)
  useEffect(() => {
    setNextType(PROMOTION_OUTCOME_META[outcome].nextType);
    if (!enrollment) return;
    if (outcome === "REPEATED" && enrollment.academicClass?.id) {
      setTargetClass(enrollment.academicClass.id);
    } else if (outcome !== "REPEATED") {
      // Leaving REPEATED: if class was auto-locked to current, clear it so user picks next class
      if (enrollment.academicClass?.id && targetClass === enrollment.academicClass.id) {
        setTargetClass("");
      }
    }
    if (outcome === "PROMOTED" || outcome === "WITH_BACKLOG") {
      if (enrollment.academicSession?.id) setTargetSession(enrollment.academicSession.id);
      if (enrollment.batch?.id) setTargetBatch(enrollment.batch.id);
    } else if (outcome === "REPEATED") {
      // REPEATED keeps session/batch editable — leave as-is
    }
  }, [outcome]);

  // Load sections for the newly selected target class
  useEffect(() => {
    if (!targetClass) {
      setSections([]);
      setTargetSection("");
      return;
    }
    // Prefer sections already embedded on the class object
    const embedded = classOptions.find(
      (c) => c.id === targetClass,
    )?.academicSections;
    if (embedded && embedded.length > 0) {
      setSections(embedded);
      setTargetSection("");
      return;
    }
    let cancelled = false;
    const fetchSections = async () => {
      setLoadingSections(true);
      try {
        const res = await getAcademicSections([
          { label: "filter", value: JSON.stringify({ class_id: targetClass }) },
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
  }, [targetClass, classOptions]);

  if (!enrollment) return null;

  const canSubmit = !!targetSession && !!targetClass && !!targetBatch;

  const isBacklog = outcome === "WITH_BACKLOG";
  const parsedFailCount = Number.parseInt(failCount, 10);

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Target session, class and batch are required.");
      return;
    }

    if (isBacklog && (!failCount.trim() || Number.isNaN(parsedFailCount) || parsedFailCount < 1)) {
      toast.error("Subject fail count (minimum 1) is required for backlog.");
      return;
    }

    const payload = {
      student_id: enrollment.student_id,
      enrollment_id: enrollment.id,
      academic_session_id: targetSession,
      academic_class_id: targetClass,
      ...(targetSection ? { academic_section_id: targetSection } : {}),
      batch_id: targetBatch,
      ...(targetShift ? { shift_id: targetShift } : {}),
      ...(rollNumber.trim() ? { roll_number: rollNumber.trim() } : {}),
      ...(registrationNumber.trim()
        ? { registration_number: registrationNumber.trim() }
        : {}),
      enrollment_status: outcome,
      enrollment_type: PROMOTION_OUTCOME_META[outcome].oldType,
      next_enrollment_type: nextType,
      next_enrollment_status: "ACTIVE",
      subject_fail_count: isBacklog ? parsedFailCount : 0,
    };

    startTransition(async () => {
      const response = await promoteStudent(payload);
      if (!response?.success) {
        toast.error(response?.message ?? "Failed to promote student");
        return;
      }
      toast.success(
        response?.message ??
        `${enrollment.student?.name ?? "Student"} promoted successfully`,
      );
      onPromoted(enrollment.id);
      onOpenChange(false);
      router.refresh();
    });
  };

  const targetClassName =
    classOptions.find((c) => c.id === targetClass)?.class_name ??
    "Select target";
  const targetSessionName =
    lookups.sessions.find((s) => s.id === targetSession)?.session_name ?? "—";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader className="rounded-t-lg border-b border-border/60 bg-muted/30 px-6 py-4">
          <DialogTitle className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <GraduationCap className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-semibold text-slate-900">
                Promote {enrollment.student?.name ?? "Student"}
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                Currently in {enrollment.academicClass?.class_name ?? "N/A"}
                {enrollment.academicSection?.section_name
                  ? ` (${enrollment.academicSection.section_name})`
                  : ""}{" "}
                · {enrollment.academicSession?.session_name ?? "N/A"} · Roll:{" "}
                {enrollment.roll_number || "N/A"}
              </span>
            </span>
          </DialogTitle>
          <DialogDescription className="pl-[52px]">
            This closes the current enrollment and opens a new one for this
            student.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Outcome */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Award className="h-3.5 w-3.5" />}
              title="Promotion Outcome"
              hint="What happens to the current row"
            />
            <OutcomeSelector value={outcome} onChange={setOutcome} />
            {isBacklog && (
              <Field
                label="Subject Fail Count"
                htmlFor="subject_fail_count"
                required
                hint="Number of failed subjects carried as supplementary backlog"
              >
                <Input
                  id="subject_fail_count"
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 2"
                  value={failCount}
                  onChange={(e) => setFailCount(e.target.value)}
                  className="h-10 max-w-52 rounded-lg text-sm"
                />
              </Field>
            )}
          </section>

          {/* Live path preview */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs">
            <span className="font-semibold text-slate-900">
              {enrollment.academicClass?.class_name ?? "Current"}
            </span>
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <ArrowRight className="h-3 w-3" />
            </span>
            <span className="font-semibold text-primary">
              {targetClassName}
            </span>
            <span className="text-muted-foreground">·</span>
            <span className="text-slate-700">{targetSessionName}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-slate-700">{nextType}</span>
          </div>

          {/* New placement */}
          <section className="space-y-3">
            <SectionHeading
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              title="New Placement"
              hint={isSessionLocked || isBatchLocked ? "Session & batch locked to current — only class can advance" : isClassLocked ? "Class locked to current — repeat stays in same year" : undefined}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="New Session" required hint={isSessionLocked ? "Locked to current session" : undefined}>
                <Select value={targetSession} onValueChange={(value) => setTargetSession(value ?? "")} disabled={isSessionLocked}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select session">
                      {targetSession ? targetSessionName : "Select session"}
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
                label="New Class / Year"
                required
                hint={
                  isClassLocked
                    ? "Locked to current class — repeat stays in same year"
                    : isScoped
                      ? `This filter only (${classOptions.length})`
                      : undefined
                }
              >
                <Select value={targetClass} onValueChange={(value) => setTargetClass(value ?? "")} disabled={isClassLocked}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select class">
                      {targetClass
                        ? classOptions.find((c) => c.id === targetClass)
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
              <Field label="New Section" hint="Keeps current if empty">
                <Select
                  value={targetSection}
                  onValueChange={(value) => setTargetSection(value ?? "")}
                  disabled={!targetClass || loadingSections}
                >
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue
                      placeholder={
                        !targetClass
                          ? "Class first"
                          : loadingSections
                            ? "Loading..."
                            : "Keep current"
                      }
                    >
                      {targetSection
                        ? sections.find((s) => s.id === targetSection)
                          ?.section_name
                        : !targetClass
                          ? "Class first"
                          : loadingSections
                            ? "Loading..."
                            : "Keep current"}
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="New Batch" required hint={isBatchLocked ? "Locked to current batch" : undefined}>
                <Select value={targetBatch} onValueChange={(value) => setTargetBatch(value ?? "")} disabled={isBatchLocked}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Select batch">
                      {targetBatch
                        ? lookups.batches.find((b) => b.id === targetBatch)
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
              <Field label="New Shift" hint="Keeps current if empty">
                <Select value={targetShift} onValueChange={(value) => setTargetShift(value ?? "")}>
                  <SelectTrigger className="h-10 rounded-lg text-sm">
                    <SelectValue placeholder="Keep current shift">
                      {targetShift
                        ? lookups.shifts.find((s) => s.id === targetShift)?.name
                        : "Keep current shift"}
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

          {/* Next enrollment type */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Award className="h-3.5 w-3.5" />}
              title="New Enrollment Type"
              hint="Suggested by the outcome — override if needed"
            />
            <NextTypeSelector value={nextType} onChange={setNextType} />
          </section>

          {/* New identification */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Hash className="h-3.5 w-3.5" />}
              title="New Identification"
              hint="Prefilled from current record"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="New Roll Number" htmlFor="roll_number">
                <Input
                  id="roll_number"
                  placeholder="e.g. 101"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="h-10 rounded-lg text-sm"
                />
              </Field>
              <Field
                label="New Registration Number"
                htmlFor="registration_number"
              >
                <Input
                  id="registration_number"
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
            disabled={isPending || !canSubmit}
            className="h-10 gap-1.5 rounded-lg"
            title={
              !canSubmit ? "Select session, class and batch first" : undefined
            }
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Promoting...
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4" />
                Confirm Promotion
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteStudentDialog;
