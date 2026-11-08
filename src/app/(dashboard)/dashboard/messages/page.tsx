"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Send,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/shared/page-header";
import { getDepartmentByProgramId } from "@/services/department";
import { getClassesByDepartmentId } from "@/services/academicClass";
import { getBatchDetails } from "@/services/batch";
import { getPrograms } from "@/services/program";

type ProgramOption = {
  id: string;
  program_name?: string;
  name?: string;
};

type DepartmentOption = {
  id: string;
  department_name?: string;
  name?: string;
};

type AcademicClassOption = {
  id: string;
  class_name?: string;
  name?: string;
};

type BatchOption = {
  id: string;
  batch_name?: string;
  name?: string;
};

const getNumericRecipientCount = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;

  const candidates = [
    record.recipient_count,
    record.recipientCount,
    record.count,
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>).recipient_count
      : undefined,
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>).recipientCount
      : undefined,
    record.data && typeof record.data === "object"
      ? (record.data as Record<string, unknown>).count
      : undefined,
  ];

  const value = candidates.find(
    (candidate) =>
      typeof candidate === "number" || typeof candidate === "string",
  );

  if (value === undefined || value === null || value === "") return null;

  return Number(value);
};

const getErrorMessage = (payload: unknown): string => {
  if (!payload || typeof payload !== "object") return "Something went wrong.";

  const record = payload as Record<string, unknown>;

  if (typeof record.message === "string" && record.message.trim()) {
    return record.message;
  }

  if (record.errors && typeof record.errors === "object") {
    const errors = Object.values(record.errors as Record<string, unknown>);
    const first = errors.find(
      (item) => typeof item === "string" || Array.isArray(item),
    );

    if (Array.isArray(first)) {
      return first.join(", ");
    }

    if (typeof first === "string") {
      return first;
    }
  }

  return "Request failed. Please try again.";
};

const MAX_MESSAGE_LENGTH = 1000;

export default function Page() {
  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [classes, setClasses] = useState<AcademicClassOption[]>([]);
  const [batches, setBatches] = useState<BatchOption[]>([]);

  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [message, setMessage] = useState("");

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingBatches, setLoadingBatches] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formError, setFormError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [recipientCount, setRecipientCount] = useState<number | null>(null);

  const selectedProgramLabel =
    programs.find((program) => program.id === selectedProgramId)
      ?.program_name ??
    programs.find((program) => program.id === selectedProgramId)?.name ??
    "";

  const selectedDepartmentLabel =
    departments.find((department) => department.id === selectedDepartmentId)
      ?.department_name ??
    departments.find((department) => department.id === selectedDepartmentId)
      ?.name ??
    "";

  const selectedClassLabel =
    classes.find((klass) => klass.id === selectedClassId)?.class_name ??
    classes.find((klass) => klass.id === selectedClassId)?.name ??
    "";

  const selectedBatchLabel =
    batches.find((batch) => batch.id === selectedBatchId)?.batch_name ??
    batches.find((batch) => batch.id === selectedBatchId)?.name ??
    "";

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        setLoadingPrograms(true);
        const response = await getPrograms([]);
        setPrograms(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching programs:", error);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, []);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        setLoadingBatches(true);
        const response = await getBatchDetails([]);
        setBatches(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching batches:", error);
        setBatches([]);
      } finally {
        setLoadingBatches(false);
      }
    };

    fetchBatches();
  }, []);

  const handleProgramChange = async (programId: string | null) => {
    const nextProgramId = programId ?? "";

    setSelectedProgramId(nextProgramId);
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setSelectedBatchId("");
    setClasses([]);
    setRecipientCount(null);
    setFormError("");
    setSubmitError("");

    if (!nextProgramId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(nextProgramId);
      setDepartments(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleDepartmentChange = async (departmentId: string | null) => {
    const nextDepartmentId = departmentId ?? "";

    setSelectedDepartmentId(nextDepartmentId);
    setSelectedClassId("");
    setSelectedBatchId("");
    setRecipientCount(null);
    setFormError("");
    setSubmitError("");

    if (!nextDepartmentId) {
      setClasses([]);
      return;
    }

    setLoadingClasses(true);
    try {
      const response = await getClassesByDepartmentId(nextDepartmentId);
      setClasses(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");
    setRecipientCount(null);

    if (!selectedClassId) {
      setFormError("Please select an academic class.");
      return;
    }

    if (!message.trim()) {
      setFormError("Please enter a message.");
      return;
    }

    setFormError("");
    setSubmitting(true);

    try {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

      if (!token) {
        throw new Error("Your session is expired. Please log in again.");
      }

      const payload: {
        academic_class_id: string;
        message: string;
        batch_id?: string;
      } = {
        academic_class_id: selectedClassId,
        message: message.trim(),
      };

      if (selectedBatchId) {
        payload.batch_id = selectedBatchId;
      }

      const request = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/student/send-class-message`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await request.json().catch(() => ({}));

      if (!request.ok || data?.success === false) {
        throw new Error(getErrorMessage(data));
      }

      const count = getNumericRecipientCount(data);
      setRecipientCount(count ?? 0);
      setMessage("");
    } catch (error) {
      const messageText =
        error instanceof Error ? error.message : "Failed to send SMS.";
      setSubmitError(messageText);
      console.error("Class SMS send error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = Boolean(selectedClassId && message.trim()) && !submitting;
  const audienceReady = Boolean(selectedClassId);

  return (
    <Card className="p-5">
      <PageHeader title="Class SMS" backHref="/dashboard" />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/50 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquareText className="h-5 w-5 text-primary" />
              Compose class message
            </CardTitle>
            <CardDescription>
              Select the audience step by step, then write the SMS. Messages go
              to active students in the chosen class.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="program">Program</Label>
                  <Select
                    value={selectedProgramId}
                    onValueChange={handleProgramChange}
                    disabled={loadingPrograms}
                    
                  >
                    <SelectTrigger id="program" className="h-9 text-sm w-full">
                      <SelectValue
                        placeholder={
                          loadingPrograms
                            ? "Loading programs..."
                            : "Select a program"
                        }
                        className={"w-full"}
                      >
                        {selectedProgramLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((program) => (
                        <SelectItem key={program.id} value={program.id} className={"w-full"}>
                          {program.program_name ?? program.name ?? "Program"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    value={selectedDepartmentId}
                    onValueChange={handleDepartmentChange}
                    disabled={!selectedProgramId || loadingDepartments}
                  >
                    <SelectTrigger id="department" className="h-9 text-sm w-full">
                      <SelectValue
                        placeholder={
                          !selectedProgramId
                            ? "Select a program first"
                            : loadingDepartments
                              ? "Loading departments..."
                              : "Select a department"
                        }
                      >
                        {selectedDepartmentLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((department) => (
                        <SelectItem key={department.id} value={department.id}>
                          {department.department_name ??
                            department.name ??
                            "Department"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="academic-class">Academic class</Label>
                  <Select
                    value={selectedClassId}
                    onValueChange={(value) => {
                      setSelectedClassId(value ?? "");
                      setSubmitError("");
                      setFormError("");
                      setRecipientCount(null);
                    }}
                    disabled={!selectedDepartmentId || loadingClasses}
                  >
                    <SelectTrigger id="academic-class" className="h-9 text-sm w-full">
                      <SelectValue
                        placeholder={
                          !selectedDepartmentId
                            ? "Select a department first"
                            : loadingClasses
                              ? "Loading classes..."
                              : "Select a class"
                        }
                      >
                        {selectedClassLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((klass) => (
                        <SelectItem key={klass.id} value={klass.id}>
                          {klass.class_name ?? klass.name ?? "Class"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="batch">Batch</Label>
                    <span className="text-[11px] text-muted-foreground">
                      Optional
                    </span>
                  </div>
                  <Select
                    value={selectedBatchId}
                    onValueChange={(value) => {
                      setSelectedBatchId(value ?? "");
                      setSubmitError("");
                      setFormError("");
                      setRecipientCount(null);
                    }}
                    disabled={loadingBatches}
                  >
                    <SelectTrigger id="batch" className="h-9 text-sm w-full">
                      <SelectValue
                        placeholder={
                          loadingBatches ? "Loading batches..." : "All batches"
                        }
                      >
                        {selectedBatchLabel}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {batches.map((batch) => (
                        <SelectItem key={batch.id} value={batch.id}>
                          {batch.batch_name ?? batch.name ?? "Batch"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <p className="-mt-2 text-xs text-muted-foreground">
                Leave batch empty to message students from all batches in this
                class.
              </p>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="message">Message</Label>
                  <span
                    className={`text-[11px] tabular-nums ${message.length > MAX_MESSAGE_LENGTH ? "font-semibold text-destructive" : "text-muted-foreground"}`}
                  >
                    {message.length}/{MAX_MESSAGE_LENGTH}
                  </span>
                </div>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    setFormError("");
                    setSubmitError("");
                  }}
                  placeholder="Type the SMS message to send to the selected class..."
                  rows={6}
                  className="resize-none"
                />
              </div>

              {(formError || submitError) && (
                <div
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  {formError || submitError}
                </div>
              )}

              {recipientCount !== null && (
                <div
                  aria-live="polite"
                  className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm font-medium text-green-700 dark:text-green-400"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                  Message sent successfully. {recipientCount} recipient(s)
                  matched.
                </div>
              )}

              <div className="flex flex-col gap-3 border-t border-border/50 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  {selectedClassLabel
                    ? `Sending to ${selectedClassLabel}${selectedBatchLabel ? ` · ${selectedBatchLabel}` : ""}`
                    : "Choose a class to begin sending"}
                </p>
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  className="h-9 gap-1.5 px-5"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? "Sending..." : "Send SMS"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Users className="h-4 w-4 text-primary" />
                Target audience
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              {[
                { label: "Program", value: selectedProgramLabel },
                { label: "Department", value: selectedDepartmentLabel },
                { label: "Class", value: selectedClassLabel },
                { label: "Batch", value: selectedBatchLabel || "All batches" },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2.5 py-1.5"
                >
                  <span className="text-xs text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="truncate text-xs font-medium">
                    {row.value || "—"}
                  </span>
                </div>
              ))}
              <div
                className={`mt-1 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium ${audienceReady ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${audienceReady ? "bg-green-500" : "bg-muted-foreground/50"}`}
                />
                {audienceReady ? "Ready to send" : "Select a class to continue"}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">
                How it works
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs text-muted-foreground">
              {[
                "Pick program, then department, then class in order.",
                "Batch is optional — empty means all batches in the class.",
                "Only active students of the selected class receive the SMS.",
              ].map((tip, index) => (
                <div key={tip} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                    {index + 1}
                  </span>
                  {tip}
                </div>
              ))}
              <div className="mt-1 flex items-center justify-between border-t border-border/50 pt-2">
                <span>Next</span>
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  Class <ChevronRight className="h-3 w-3" />
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Card>
  );
}
