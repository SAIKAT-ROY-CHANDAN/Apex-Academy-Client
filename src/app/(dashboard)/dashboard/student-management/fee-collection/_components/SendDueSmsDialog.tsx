"use client";

import { AlertTriangle, Loader2, MessageSquareText } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { sendBulkSms } from "@/services/bulkSms";
import { getFeeManage } from "@/services/feeType";
import type { QueryParams } from "@/types/shared/query.type";
import type { TStudentWithFeeCollections } from "./types";

export type TDueSmsFilters = {
  searchTerm?: string;
  classId?: string;
  programId?: string;
  departmentId?: string;
  academicSessionId?: string;
};

type TDueTarget = {
  studentId: string;
  name: string;
  phone: string;
  dueAmount: number;
  className: string;
};

interface SendDueSmsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: TDueSmsFilters;
  currentPageStudents: TStudentWithFeeCollections[];
  totalStudents: number;
  institutionName?: string;
}

const FETCH_PAGE_LIMIT = 100;
const SEND_BATCH_SIZE = 100;
const MAX_MESSAGE_LENGTH = 1000;

const pickPhone = (
  s: TStudentWithFeeCollections,
): { phone: string; hasPhone: boolean } => {
  const raw = (s.student_phone || "").trim() || (s.father_phone || "").trim();
  return { phone: raw, hasPhone: Boolean(raw) };
};

const primaryClassName = (s: TStudentWithFeeCollections) =>
  s.studentEnrollments?.find((e) => e.is_primary)?.academicClass?.class_name ??
  s.studentEnrollments?.[0]?.academicClass?.class_name ??
  "—";

const buildMessage = (
  template: string,
  target: TDueTarget,
  institutionName?: string,
) => {
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  return template
    .replaceAll("{name}", target.name)
    .replaceAll("{due}", String(Math.round(target.dueAmount * 100) / 100))
    .replaceAll(
      "{due_amount}",
      String(Math.round(target.dueAmount * 100) / 100),
    )
    .replaceAll("{class}", target.className)
    .replaceAll("{institution}", institutionName ?? "")
    .replaceAll("{date}", today)
    .replaceAll("{today}", today)
    .replaceAll("{today_date}", today)
    .replaceAll("{today date}", today);
};

const chunk = <T,>(arr: T[], size: number): T[][] => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const SendDueSmsDialog = ({
  open,
  onOpenChange,
  filters,
  currentPageStudents,
  totalStudents,
  institutionName,
}: SendDueSmsDialogProps) => {
  const defaultTemplate = useMemo(
    () =>
      "Dear {name}, your tuition fee of {due} BDT was due on {date}. Kindly pay it as soon as possible. Thank you.",
    [],
  );

  const [message, setMessage] = useState(defaultTemplate);
  const [scope, setScope] = useState<"all" | "page">("all");
  const [phase, setPhase] = useState<"idle" | "scanning" | "sending" | "done">(
    "idle",
  );
  const [scanned, setScanned] = useState(0);
  const [targets, setTargets] = useState<TDueTarget[]>([]);
  const [skippedNoPhone, setSkippedNoPhone] = useState(0);
  const [sent, setSent] = useState(0);
  const [failed, setFailed] = useState(0);
  const [failedNames, setFailedNames] = useState<string[]>([]);
  const [errorDetail, setErrorDetail] = useState<string>("");

  useEffect(() => {
    if (open) {
      setMessage(defaultTemplate);
      setScope("all");
      setPhase("idle");
      setScanned(0);
      setTargets([]);
      setSkippedNoPhone(0);
      setSent(0);
      setFailed(0);
      setFailedNames([]);
      setErrorDetail("");
    }
  }, [open, defaultTemplate]);

  const pageDueCount = useMemo(
    () =>
      currentPageStudents.filter((s) => (s.feeSummary?.dueAmount ?? 0) > 0)
        .length,
    [currentPageStudents],
  );

  const isPersonalized = /{name}|{due}|{due_amount}|{class}/.test(message);
  const messageTooLong = message.trim().length > MAX_MESSAGE_LENGTH;
  const messageEmpty = message.trim().length === 0;
  const busy = phase === "scanning" || phase === "sending";

  const buildQuery = (page: number, limit: number): QueryParams[] => {
    const query: QueryParams[] = [
      { label: "page", value: page },
      { label: "limit", value: limit },
    ];
    if (filters.searchTerm)
      query.push({ label: "searchTerm", value: filters.searchTerm });
    if (filters.academicSessionId)
      query.push({
        label: "academicSessionId",
        value: filters.academicSessionId,
      });
    if (filters.classId)
      query.push({ label: "class_id", value: filters.classId });
    if (filters.programId)
      query.push({ label: "program_id", value: filters.programId });
    if (filters.departmentId)
      query.push({ label: "department_id", value: filters.departmentId });
    return query;
  };

  const collectFromRows = (rows: TStudentWithFeeCollections[]) => {
    const found: TDueTarget[] = [];
    let noPhone = 0;
    for (const s of rows) {
      const due = s.feeSummary?.dueAmount ?? 0;
      if (due <= 0) continue;
      const { phone, hasPhone } = pickPhone(s);
      if (!hasPhone) {
        noPhone += 1;
        continue;
      }
      found.push({
        studentId: s.id,
        name: s.name,
        phone,
        dueAmount: due,
        className: primaryClassName(s),
      });
    }
    return { found, noPhone };
  };

  const fetchAllDueTargets = async (): Promise<{
    found: TDueTarget[];
    noPhone: number;
  }> => {
    const found: TDueTarget[] = [];
    let noPhone = 0;
    let page = 1;
    let totalPages = 1;
    let total = totalStudents;

    do {
      const response = await getFeeManage(buildQuery(page, FETCH_PAGE_LIMIT));
      if (!response?.success) {
        throw new Error(response?.message ?? "Failed to load students");
      }
      const rows: TStudentWithFeeCollections[] = response.data ?? [];
      totalPages = Math.max(1, response.meta?.totalPages ?? 1);
      total = response.meta?.total ?? rows.length;
      const { found: batch, noPhone: batchNoPhone } = collectFromRows(rows);
      found.push(...batch);
      noPhone += batchNoPhone;
      setScanned((prev) => prev + rows.length);
      page += 1;
    } while (page <= totalPages);

    // Guard against backend meta drift: if nothing scanned but total known, stop.
    if (total === 0) return { found, noPhone };
    return { found, noPhone };
  };

  const handleSend = async () => {
    if (messageEmpty) {
      toast.error("Message is required");
      return;
    }
    if (messageTooLong) {
      toast.error(`Message must not exceed ${MAX_MESSAGE_LENGTH} characters`);
      return;
    }

    setPhase("scanning");
    setScanned(0);
    setSent(0);
    setFailed(0);
    setFailedNames([]);
    setErrorDetail("");
    setTargets([]);
    setSkippedNoPhone(0);

    try {
      let dueTargets: TDueTarget[] = [];
      let noPhone = 0;

      if (scope === "page") {
        const { found, noPhone: np } = collectFromRows(currentPageStudents);
        dueTargets = found;
        noPhone = np;
        setScanned(currentPageStudents.length);
      } else {
        const result = await fetchAllDueTargets();
        dueTargets = result.found;
        noPhone = result.noPhone;
      }

      // De-duplicate by phone so one guardian with several children gets one SMS
      // in generic (non-personalized) mode. In personalized mode keep every
      // student so each due amount is reported.
      let sendTargets = dueTargets;
      if (!isPersonalized) {
        const seen = new Set<string>();
        sendTargets = dueTargets.filter((t) => {
          const key = t.phone.trim();
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      }

      setTargets(sendTargets);
      setSkippedNoPhone(noPhone);

      if (sendTargets.length === 0) {
        setPhase("done");
        toast.info(
          noPhone > 0
            ? "All due students are missing phone numbers."
            : "No students with unpaid dues found for the current filter.",
        );
        return;
      }

      setPhase("sending");

      if (isPersonalized) {
        let ok = 0;
        let fail = 0;
        const failList: string[] = [];
        let lastError = "";
        for (const target of sendTargets) {
          const personalized = buildMessage(
            message.trim(),
            target,
            institutionName,
          );
          try {
            const res = await sendBulkSms({
              message: personalized,
              target: "MANUAL",
              phoneNumbers: [target.phone],
            });
            if (res?.success === false)
              throw new Error(res?.message ?? "SMS rejected by server");
            ok += 1;
          } catch (err) {
            fail += 1;
            failList.push(target.name);
            lastError =
              err instanceof Error ? err.message : "Failed to send SMS";
            console.error(`Due SMS failed for ${target.name}:`, err);
          }
          setSent(ok);
          setFailed(fail);
          setFailedNames([...failList]);
        }
        setPhase("done");
        if (fail === 0) toast.success(`SMS sent to ${ok} student(s).`);
        else {
          setErrorDetail(lastError);
          toast.warning(`Sent to ${ok}, failed for ${fail}. ${lastError}`);
        }
      } else {
        const batches = chunk(
          sendTargets.map((t) => t.phone),
          SEND_BATCH_SIZE,
        );
        let ok = 0;
        let fail = 0;
        let lastError = "";
        for (const batchPhones of batches) {
          try {
            const res = await sendBulkSms({
              message: message.trim(),
              target: "MANUAL",
              phoneNumbers: batchPhones,
            });
            if (res?.success === false)
              throw new Error(res?.message ?? "SMS rejected by server");
            ok += batchPhones.length;
          } catch (err) {
            fail += batchPhones.length;
            lastError =
              err instanceof Error ? err.message : "Failed to send SMS";
            console.error("Due SMS batch failed:", err);
          }
          setSent(ok);
          setFailed(fail);
        }
        setPhase("done");
        if (fail === 0) toast.success(`SMS sent to ${ok} phone number(s).`);
        else {
          setErrorDetail(lastError);
          toast.warning(`Sent to ${ok}, failed for ${fail}. ${lastError}`);
        }
      }
    } catch (error) {
      console.error("Send due SMS failed:", error);
      setPhase("idle");
      toast.error(
        error instanceof Error ? error.message : "Failed to send SMS",
      );
    }
  };

  const progressValue =
    phase === "scanning"
      ? totalStudents > 0
        ? Math.min(100, Math.round((scanned / totalStudents) * 100))
        : 0
      : targets.length > 0
        ? Math.min(100, Math.round(((sent + failed) / targets.length) * 100))
        : 0;

  return (
    <Dialog open={open} onOpenChange={busy ? () => {} : onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquareText className="h-5 w-5" />
            Send due-fee SMS
          </DialogTitle>
          <DialogDescription>
            Sends an SMS to every student with unpaid dues — across all pages,
            not just the {currentPageStudents.length} rows visible now. Current
            search / class filters are respected.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => setScope("all")}
              className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                scope === "all"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <p className="font-semibold">All due students</p>
              <p className="mt-1 text-muted-foreground">
                Scan all pages with current filters (recommended)
              </p>
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setScope("page")}
              className={`rounded-lg border p-3 text-left text-xs transition-colors ${
                scope === "page"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:bg-muted/40"
              }`}
            >
              <p className="font-semibold">
                Current page only ({pageDueCount} due)
              </p>
              <p className="mt-1 text-muted-foreground">
                Only the {currentPageStudents.length} rows on screen
              </p>
            </button>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="due-sms-message">Message</Label>
            <Textarea
              id="due-sms-message"
              value={message}
              disabled={busy}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              maxLength={MAX_MESSAGE_LENGTH + 50}
              placeholder="Type SMS message..."
            />
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                Placeholders: {"{name}"} {"{due}"} {"{date}"} {"{class}"}{" "}
                {"{institution}"}
                {isPersonalized
                  ? " — personalized SMS per student"
                  : " — one shared SMS (faster)"}
              </span>
              <span
                className={messageTooLong ? "font-semibold text-red-600" : ""}
              >
                {message.trim().length}/{MAX_MESSAGE_LENGTH}
              </span>
            </div>
          </div>

          {busy && (
            <div className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/30 p-3">
              <p className="text-xs font-medium">
                {phase === "scanning"
                  ? `Scanning students... (${scanned}${totalStudents ? ` of ~${totalStudents}` : ""})`
                  : `Sending SMS... (${sent + failed}${targets.length ? ` of ${targets.length}` : ""})`}
              </p>
              <Progress value={progressValue} />
              {(sent > 0 || failed > 0) && (
                <p className="text-[11px] text-muted-foreground">
                  Sent: {sent} · Failed: {failed}
                </p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/30 p-3 text-xs">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex flex-col gap-1">
                <p>
                  Targets found: <strong>{targets.length}</strong> · Sent:{" "}
                  <strong>{sent}</strong> · Failed: <strong>{failed}</strong>
                  {skippedNoPhone > 0 && (
                    <>
                      {" "}
                      · Skipped (no phone): <strong>{skippedNoPhone}</strong>
                    </>
                  )}
                </p>
                {failedNames.length > 0 && (
                  <p className="text-muted-foreground">
                    Failed: {failedNames.slice(0, 5).join(", ")}
                    {failedNames.length > 5 &&
                      ` and ${failedNames.length - 5} more`}
                  </p>
                )}
                {errorDetail && (
                  <p className="font-medium text-red-600">
                    Reason: {errorDetail}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            {phase === "done" ? "Close" : "Cancel"}
          </Button>
          <Button
            disabled={busy || messageEmpty || messageTooLong}
            onClick={handleSend}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {phase === "done" ? "Send again" : "Send SMS to due students"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SendDueSmsDialog;
