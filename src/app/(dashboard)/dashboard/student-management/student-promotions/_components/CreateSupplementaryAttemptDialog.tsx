"use client";

import { Award, BookX, Calculator, CheckCircle2, Clock, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupplementaryAttempt } from "@/services/studentEnrollment";
import type { TPromotionEnrollment } from "./types";

interface Props {
  enrollment: TPromotionEnrollment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

const CreateSupplementaryAttemptDialog = ({ enrollment, open, onOpenChange, onCreated }: Props) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [failCount, setFailCount] = useState("");

  useEffect(() => {
    if (open) setFailCount("");
  }, [open]);

  const parsed = useMemo(() => {
    const n = Number.parseInt(failCount, 10);
    return Number.isNaN(n) ? 0 : n;
  }, [failCount]);

  const canSubmit = parsed >= 1 && parsed <= 100;
  const hasError = failCount !== "" && !canSubmit;

  if (!enrollment) return null;

  const handleSubmit = () => {
    if (!canSubmit) {
      toast.error("Please enter how many subjects are still failed (1-100).");
      return;
    }
    const payload = {
      student_id: enrollment.student_id,
      previous_enrollment_id: enrollment.id,
      subject_fail_count: parsed,
    };
    startTransition(async () => {
      const res = await createSupplementaryAttempt(payload);
      if (!res?.success) {
        toast.error(res?.message ?? "Could not create supplementary attempt. Please try again.");
        return;
      }
      toast.success(res?.message ?? "Supplementary attempt created successfully.");
      onCreated();
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 bg-muted/30 border-b">
          <DialogTitle className="flex items-center gap-3 text-base">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <BookX className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold">Create Supplementary Attempt</span>
              <span className="block text-xs font-normal text-muted-foreground">
                For {enrollment.student?.name ?? "student"} • {enrollment.academicClass?.class_name ?? "—"}
              </span>
            </span>
          </DialogTitle>
          <DialogDescription className="sr-only">Create a new supplementary attempt without changing the previous one.</DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-5">
          {/* Previous attempt - immutable */}
          <div className="rounded-xl border bg-amber-50/60 border-amber-200 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-800">
                <Clock className="h-3.5 w-3.5" /> Previous attempt — keeps as history
              </span>
              <Badge variant="secondary" className="bg-white text-amber-700 border-amber-200">Not changed</Badge>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900">{enrollment.subject_fail_count ?? 0}</span>
              <span className="text-sm text-slate-600">subject(s) failed</span>
              <span className="text-sm text-muted-foreground">• {enrollment.academicClass?.class_name} • {enrollment.academicSession?.session_name}</span>
            </div>
            <p className="mt-2 text-xs text-amber-700">This record stays exactly as it is. We will add a new attempt below.</p>
          </div>

          {/* New attempt input */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary"><Award className="h-3.5 w-3.5" /></span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">New attempt</h4>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supp_fail" className="text-xs font-semibold">
                How many subjects are still failed? <span className="text-destructive">*</span>
              </Label>
              <Input
                id="supp_fail"
                type="number"
                inputMode="numeric"
                min={1}
                max={100}
                step={1}
                placeholder="Example: 1"
                value={failCount}
                onChange={(e) => setFailCount(e.target.value)}
                className="h-11 max-w-[200px] text-base"
                aria-invalid={hasError}
              />
              <p className="text-[11px] text-muted-foreground">Enter the number of subjects the student still needs to re-appear for.</p>
              {hasError && <p className="text-xs text-destructive">Enter a number between 1 and 100.</p>}
            </div>

            {/* Preview - simple, no technical IDs */}
            <div className="rounded-xl border border-primary/20 bg-primary/[0.04] px-4 py-3 flex items-center justify-between gap-4">
              <span className="flex items-center gap-2 text-sm">
                <Calculator className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">New total</span>
                <span className="font-semibold text-slate-900">{canSubmit ? `${parsed} subject${parsed === 1 ? "" : "s"}` : "—"}</span>
              </span>
              <span className="text-xs text-muted-foreground text-right">
                Fee = fee per subject × subjects<br />
                <span className="font-medium text-slate-700">{canSubmit ? `Will be calculated automatically` : "Enter subjects to preview"}</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-slate-50 border px-3 py-2.5 text-xs text-slate-600">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>Previous attempt keeps its payment and history. Only the new attempt will be due.</span>
          </div>
        </div>

        <DialogFooter className="bg-muted/30 border-t px-6 py-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="h-10 rounded-lg">
            <X className="h-4 w-4" /> Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !canSubmit} className="h-10 rounded-lg min-w-[140px]">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              "Create Attempt"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSupplementaryAttemptDialog;
