"use client";

import {
  ArrowRight,
  Award,
  GraduationCap,
  Loader2,
  Users,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { getAcademicSections } from "@/services/academicSection";
import { promoteStudentsBulk } from "@/services/studentPromotion";
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

interface PromoteAllDialogProps {
  enrollments: TPromotionEnrollment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lookups: TPromotionLookups;
  onPromoted: (enrollmentIds: string[]) => void;
  // Scoped class list (program → department filter). Falls back to all classes.
  targetClasses?: TPromotionLookups["classes"];
  isScoped?: boolean;
}

const PromoteAllDialog = ({
  enrollments,
  open,
  onOpenChange,
  lookups,
  onPromoted,
  targetClasses,
  isScoped = false,
}: PromoteAllDialogProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [outcome, setOutcome] = useState<TPromotionOutcome>("PROMOTED");
  const [nextType, setNextType] = useState("REGULAR");
  const [targetSession, setTargetSession] = useState("");
  const [targetClass, setTargetClass] = useState("");
  const [targetSection, setTargetSection] = useState("");
  const [targetBatch, setTargetBatch] = useState("");
  const [targetShift, setTargetShift] = useState("");
  const [failCount, setFailCount] = useState("");
  const [sections, setSections] = useState<
    Array<{ id: string; section_name: string }>
  >([]);
  const [loadingSections, setLoadingSections] = useState(false);

  // Only classes under the current program → department filter are offered
  // as promotion targets (falls back to every class when unscoped).
  // For bulk REPEATED, ensure common class is present even if filtered out.
  const baseClassOptions = targetClasses ?? lookups.classes;
  const commonClassId = enrollments.length > 0 ? enrollments[0]?.academicClass?.id ?? null : null;
  const allSameClass = commonClassId ? enrollments.every((e) => e.academicClass?.id === commonClassId) : false;
  const commonSessionId = enrollments.length > 0 ? enrollments[0]?.academicSession?.id ?? null : null;
  const allSameSession = commonSessionId ? enrollments.every((e) => e.academicSession?.id === commonSessionId) : false;
  const commonBatchId = enrollments.length > 0 ? enrollments[0]?.batch?.id ?? null : null;
  const allSameBatch = commonBatchId ? enrollments.every((e) => e.batch?.id === commonBatchId) : false;
  const currentBulkClassInOptions = commonClassId ? baseClassOptions.some((c) => c.id === commonClassId) : true;
  const classOptions = !currentBulkClassInOptions && allSameClass && enrollments[0]?.academicClass
    ? [...baseClassOptions, { id: enrollments[0].academicClass!.id, class_name: enrollments[0].academicClass!.class_name, academicSections: (enrollments[0].academicClass as any).academicSections } as (typeof baseClassOptions)[number]]
    : baseClassOptions;

  const isRepeatedBulk = outcome === "REPEATED";
  const isSessionLockedBulk = (outcome === "PROMOTED" || outcome === "WITH_BACKLOG") && allSameSession;
  const isBatchLockedBulk = (outcome === "PROMOTED" || outcome === "WITH_BACKLOG") && allSameBatch;
  const isClassLockedBulk = isRepeatedBulk && allSameClass;

  // Reset the form every time the dialog opens — respects outcome locking
  useEffect(() => {
    if (open) {
      setOutcome("PROMOTED");
      setNextType("REGULAR");
      // Session+batch locked to common values when all share them
      if (allSameSession && commonSessionId) setTargetSession(commonSessionId);
      else setTargetSession("");
      setTargetClass("");
      setTargetSection("");
      if (allSameBatch && commonBatchId) setTargetBatch(commonBatchId);
      else setTargetBatch("");
      setTargetShift("");
      setFailCount("");
      setSections([]);
    }
  }, [open]);

  // Outcome drives the suggested next enrollment type and locked fields
  useEffect(() => {
    setNextType(PROMOTION_OUTCOME_META[outcome].nextType);
    if (outcome === "REPEATED" && allSameClass && commonClassId) {
      setTargetClass(commonClassId);
    } else if (outcome !== "REPEATED" && allSameClass && commonClassId && targetClass === commonClassId) {
      setTargetClass("");
    }
    if ((outcome === "PROMOTED" || outcome === "WITH_BACKLOG")) {
      if (allSameSession && commonSessionId) setTargetSession(commonSessionId);
      if (allSameBatch && commonBatchId) setTargetBatch(commonBatchId);
    }
  }, [outcome]);

  // Load sections for the newly selected target class
  useEffect(() => {
    if (!targetClass) {
      setSections([]);
      setTargetSection("");
      return;
    }
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

  const canSubmit =
    enrollments.length > 0 && !!targetSession && !!targetClass && !!targetBatch;

  const isBacklog = outcome === "WITH_BACKLOG";
  const parsedFailCount = Number.parseInt(failCount, 10);

  const handleSubmit = () => {
    if (enrollments.length === 0) {
      toast.error("No students to promote.");
      return;
    }
    if (!canSubmit) {
      toast.error("Target session, class and batch are required.");
      return;
    }
    if (isBacklog && (!failCount.trim() || Number.isNaN(parsedFailCount) || parsedFailCount < 1)) {
      toast.error("Subject fail count (minimum 1) is required for backlog bulk promotion.");
      return;
    }

    const payload = {
      enrollment_ids: enrollments.map((e) => e.id),
      academic_session_id: targetSession,
      academic_class_id: targetClass,
      ...(targetSection ? { academic_section_id: targetSection } : {}),
      batch_id: targetBatch,
      ...(targetShift ? { shift_id: targetShift } : {}),
      enrollment_status: outcome,
      enrollment_type: PROMOTION_OUTCOME_META[outcome].oldType,
      next_enrollment_type: nextType,
      next_enrollment_status: "ACTIVE",
      ...(isBacklog ? { subject_fail_count: parsedFailCount } : {}),
    };

    startTransition(async () => {
      const response = await promoteStudentsBulk(payload);
      if (!response?.success) {
        toast.error(response?.message ?? "Failed to promote students");
        return;
      }
      toast.success(
        response?.message ??
        `${enrollments.length} student(s) promoted successfully`,
      );
      onPromoted(enrollments.map((e) => e.id));
      onOpenChange(false);
      router.refresh();
    });
  };

  const currentClassName =
    enrollments[0]?.academicClass?.class_name ?? "current class";
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
              <Users className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-semibold text-slate-900">
                Promote {enrollments.length} student
                {enrollments.length === 1 ? "" : "s"} at once
              </span>
              <span className="block text-xs font-normal text-muted-foreground">
                All from {currentClassName} · same target for everyone · no roll
                or registration numbers needed
              </span>
            </span>
            <span className="ml-auto shrink-0">
              <Badge variant="default">
                {enrollments.length} student
                {enrollments.length === 1 ? "" : "s"}
              </Badge>
            </span>
          </DialogTitle>
          <DialogDescription className="pl-[52px]">
            Only the students listed on this page are included — repeat per page
            if the filter spans multiple pages.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-5">
          {/* Outcome */}
          <section className="space-y-3">
            <SectionHeading
              icon={<Award className="h-3.5 w-3.5" />}
              title="Promotion Outcome"
              hint="Applies to every selected student"
            />
            <OutcomeSelector value={outcome} onChange={setOutcome} />
            {isBacklog && (
              <Field label="Subject Fail Count" htmlFor="bulk_fail_count" required hint="Same count applied to all selected students for backlog">
                <Input
                  id="bulk_fail_count"
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
              {currentClassName}
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
            <span className="text-muted-foreground">·</span>
            <span className="text-slate-700">
              {enrollments.length} student{enrollments.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* New placement */}
          <section className="space-y-3">
            <SectionHeading
              icon={<GraduationCap className="h-3.5 w-3.5" />}
              title="New Placement"
              hint={isSessionLockedBulk || isBatchLockedBulk ? "Session & batch locked to common current — only class can advance" : isClassLockedBulk ? "Class locked — repeat stays in same year" : undefined}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Field label="New Session" required hint={isSessionLockedBulk ? "Locked to current session" : !allSameSession && (outcome === "PROMOTED" || outcome === "WITH_BACKLOG") ? "Mixed sessions — choose target" : undefined}>
                <Select value={targetSession} onValueChange={(value) => setTargetSession(value ?? "")} disabled={isSessionLockedBulk}>
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
                  isClassLockedBulk
                    ? "Locked to current class — repeat stays in same year"
                    : !allSameClass && isRepeatedBulk
                      ? "Mixed classes — choose target"
                      : isScoped
                        ? `This filter only (${classOptions.length})`
                        : undefined
                }
              >
                <Select value={targetClass} onValueChange={(value) => setTargetClass(value ?? "")} disabled={isClassLockedBulk}>
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
              <Field label="New Batch" required hint={isBatchLockedBulk ? "Locked to current batch" : !allSameBatch && (outcome === "PROMOTED" || outcome === "WITH_BACKLOG") ? "Mixed batches — choose target" : undefined}>
                <Select value={targetBatch} onValueChange={(value) => setTargetBatch(value ?? "")} disabled={isBatchLockedBulk}>
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
                Promoting {enrollments.length}...
              </>
            ) : (
              <>
                <Users className="h-4 w-4" />
                Promote All {enrollments.length}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PromoteAllDialog;
