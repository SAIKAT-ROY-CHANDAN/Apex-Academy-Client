"use client";

import {
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  FilterX,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { TStudentExamResult } from "@/types/modules/student/student-result.type";

const GOVT_RESULT_URL = "";

const PAGE_SIZE = 10;

const formatDate = (date?: string | null) => {
  if (!date) return "N/A";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const getLetterGrade = (r: TStudentExamResult): string => {
  if (r.letterGrade) return String(r.letterGrade);
  if (r.computed?.letterGrade) return String(r.computed.letterGrade);
  if (r.grade?.grade_name) return String(r.grade.grade_name);
  return "—";
};

const getGradePoint = (r: TStudentExamResult): string => {
  const raw: unknown = r.gradePoint ?? r.computed?.gradePoint ?? r.grade?.grade_point;
  if (raw === null || raw === undefined || raw === "") return "—";
  const n = Number(raw);
  return Number.isNaN(n) ? "—" : n.toFixed(2);
};

const getStatusBadgeClass = (passed: boolean | null) => {
  if (passed === null) return "bg-slate-100 text-slate-500 hover:bg-slate-100";
  return passed
    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    : "bg-red-100 text-red-700 hover:bg-red-100";
};

const getLetterForStatus = (r: TStudentExamResult): string | null =>
  r.letterGrade ?? r.computed?.letterGrade ?? r.grade?.grade_name ?? null;

const getStatusString = (r: TStudentExamResult): string | null =>
  r.status ?? r.computed?.status ?? null;

const getPassed = (r: TStudentExamResult): boolean | null => {
  const hasMarks =
    r.obtained_marks !== null &&
    r.obtained_marks !== undefined &&
    r.obtained_marks !== "";
  if (!hasMarks) return null;
  const status = getStatusString(r);
  if (status) return status.toLowerCase() === "passed";
  const letter = getLetterForStatus(r);
  if (letter) return letter !== "F";
  const obtained = toNumber(r.obtained_marks);
  const pass = toNumber(r.examSchedule?.passMarks);
  return obtained >= pass;
};

const getResultYear = (r: TStudentExamResult): string | null => {
  const y = r.examSchedule?.year ?? r.examSchedule?.examTakenYear;
  if (y !== null && y !== undefined && String(y) !== "") return String(y);
  const d = r.examSchedule?.examDate ?? r.examSchedule?.examConfig?.exam_date;
  if (d) {
    const dt = new Date(d);
    if (!Number.isNaN(dt.getTime())) return String(dt.getFullYear());
  }
  return null;
};

const ResultStatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: string;
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardContent className="flex items-center gap-4 p-5">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${accent}`}
      >
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 text-2xl font-bold leading-none">{value}</p>
      </div>
    </CardContent>
  </Card>
);

interface StudentResultsViewProps {
  results: TStudentExamResult[];
  studentName?: string;
}

const StudentResultsView = ({
  results,
  studentName,
}: StudentResultsViewProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [examFilter, setExamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const query = searchQuery.trim().toLowerCase();
  const hasActiveFilters =
    query !== "" ||
    subjectFilter !== "all" ||
    examFilter !== "all" ||
    statusFilter !== "all" ||
    yearFilter !== "all";

  const subjectOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      const name = r.examSchedule?.subject?.name?.trim();
      if (name) set.add(name);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [results]);

  const examOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      const name = r.examSchedule?.examConfig?.exam_name?.trim();
      if (name) set.add(name);
    }
    return [...set].sort((a, b) => a.localeCompare(b));
  }, [results]);

  const yearOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of results) {
      const y = getResultYear(r);
      if (y) set.add(y);
    }
    return [...set].sort((a, b) => Number(b) - Number(a));
  }, [results]);

  const filtered = useMemo(() => {
    return results
      .filter((r) => {
        // Search (subject or exam) — combines with dropdowns, not resets
        if (query) {
          const subject = r.examSchedule?.subject?.name?.toLowerCase() ?? "";
          const exam =
            r.examSchedule?.examConfig?.exam_name?.toLowerCase() ?? "";
          if (!subject.includes(query) && !exam.includes(query)) return false;
        }
        if (
          subjectFilter !== "all" &&
          r.examSchedule?.subject?.name !== subjectFilter
        )
          return false;
        if (
          examFilter !== "all" &&
          r.examSchedule?.examConfig?.exam_name !== examFilter
        )
          return false;
        if (statusFilter !== "all") {
          const passed = getPassed(r);
          if (statusFilter === "pass" && passed !== true) return false;
          if (statusFilter === "fail" && passed !== false) return false;
        }
        if (yearFilter !== "all") {
          const y = getResultYear(r);
          if (y !== yearFilter) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const dateA = a.examSchedule?.examConfig?.exam_date ?? "";
        const dateB = b.examSchedule?.examConfig?.exam_date ?? "";
        if (!dateA || !dateB) return 0;
        return new Date(dateA).getTime() - new Date(dateB).getTime();
      });
  }, [results, query, subjectFilter, examFilter, statusFilter, yearFilter]);

  const stats = useMemo(() => {
    if (filtered.length === 0) return { passed: 0, failed: 0, average: 0 };

    const passed = filtered.filter((r) => getPassed(r) === true).length;

    const failed = filtered.length - passed;
    const average = Math.round(
      filtered.reduce((sum, r) => {
        const obtained = toNumber(r.obtained_marks);
        const full = toNumber(r.examSchedule?.fullMarks);
        return sum + (full === 0 ? 0 : Math.round((obtained / full) * 100));
      }, 0) / filtered.length,
    );

    return { passed, failed, average };
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );
  const startIndex = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(safePage * PAGE_SIZE, filtered.length);

  const clearFilters = () => {
    setSearchQuery("");
    setSubjectFilter("all");
    setExamFilter("all");
    setStatusFilter("all");
    setYearFilter("all");
    setCurrentPage(1);
  };

  return (
    <>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Results Report</h2>
          {studentName && (
            <p className="text-sm text-muted-foreground">{studentName}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={GOVT_RESULT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-input bg-background px-3 text-xs font-medium shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Government Result
          </a>
          <Badge variant="secondary" className="w-fit text-xs font-medium">
            {filtered.length} result{filtered.length !== 1 ? "s" : ""}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ResultStatCard
          label="Passed"
          value={stats.passed}
          accent="bg-emerald-50"
        />
        <ResultStatCard
          label="Failed"
          value={stats.failed}
          accent="bg-red-50"
        />
        <ResultStatCard
          label="Average Score"
          value={`${stats.average}%`}
          accent="bg-violet-50"
        />
      </div>

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
            Result History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-5 pt-0">
          {/* Filter bar — single responsive row inside a subtly shaded container, matching exam-schedule / homework filter bars */}
          <div className="rounded-xl border border-border/40 bg-muted/20 p-3 sm:p-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="results-search"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Search
                </Label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="results-search"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Search subject or exam…"
                    className="h-9 w-full rounded-md border-input bg-white pl-9 pr-3 text-sm placeholder:text-muted-foreground/60 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="filter-subject"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Subject
                </Label>
                <Select
                  value={subjectFilter}
                  onValueChange={(v) => {
                    setSubjectFilter((v as string) ?? "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    id="filter-subject"
                    className="h-9 w-full rounded-md border-input bg-white text-sm focus:ring-ring/50 focus:ring-[3px] data-placeholder:text-muted-foreground/60"
                  >
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjectOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="filter-exam"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Exam
                </Label>
                <Select
                  value={examFilter}
                  onValueChange={(v) => {
                    setExamFilter((v as string) ?? "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    id="filter-exam"
                    className="h-9 w-full rounded-md border-input bg-white text-sm focus:ring-ring/50 focus:ring-[3px] data-placeholder:text-muted-foreground/60"
                  >
                    <SelectValue placeholder="All Exams" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Exams</SelectItem>
                    {examOptions.map((e) => (
                      <SelectItem key={e} value={e}>
                        {e}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="filter-status"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Status
                </Label>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter((v as string) ?? "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    id="filter-status"
                    className="h-9 w-full rounded-md border-input bg-white text-sm focus:ring-ring/50 focus:ring-[3px] data-placeholder:text-muted-foreground/60"
                  >
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pass">Pass</SelectItem>
                    <SelectItem value="fail">Fail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1.5">
                <Label
                  htmlFor="filter-year"
                  className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
                >
                  Year
                </Label>
                <Select
                  value={yearFilter}
                  onValueChange={(v) => {
                    setYearFilter((v as string) ?? "all");
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger
                    id="filter-year"
                    className="h-9 w-full rounded-md border-input bg-white text-sm focus:ring-ring/50 focus:ring-[3px] data-placeholder:text-muted-foreground/60"
                  >
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {yearOptions.map((y) => (
                      <SelectItem key={y} value={y}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <div className="min-h-5 text-xs text-muted-foreground">
                {hasActiveFilters && filtered.length > 0 ? (
                  <span>
                    Showing{" "}
                    <span className="font-medium text-foreground">{filtered.length}</span> of{" "}
                    <span className="font-medium text-foreground">{results.length}</span> records
                    {query ? ` for "${searchQuery.trim()}"` : ""}
                    {subjectFilter !== "all" ? ` • ${subjectFilter}` : ""}
                    {examFilter !== "all" ? ` • ${examFilter}` : ""}
                    {statusFilter !== "all" ? ` • ${statusFilter.toUpperCase()}` : ""}
                    {yearFilter !== "all" ? ` • ${yearFilter}` : ""}
                  </span>
                ) : hasActiveFilters ? (
                  <span className="text-muted-foreground/70">Filters applied — no matches</span>
                ) : (
                  <span className="text-muted-foreground/0 select-none">-</span>
                )}
              </div>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 rounded-md border-input bg-white px-3 text-xs font-medium hover:bg-accent"
                  onClick={clearFilters}
                >
                  <FilterX className="h-3.5 w-3.5" />
                  Clear filters
                </Button>
              )}
            </div>
          </div>
          <div className="h-px bg-border/40" />

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <Search className="mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm font-medium text-muted-foreground">
                {results.length === 0
                  ? "No results yet."
                  : hasActiveFilters
                    ? "No results match your filters."
                    : "No results in this range."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {results.length === 0
                  ? "Your marks will appear here once exams are graded."
                  : hasActiveFilters
                    ? "Try adjusting search or dropdown filters above."
                    : "Try adjusting the filters above."}
              </p>
              {hasActiveFilters && results.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4 h-8 text-xs"
                  onClick={clearFilters}
                >
                  Clear all filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-border/50">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Subject
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Exam
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Obtained
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Full Marks
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Pass Marks
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Grade
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Point
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paged.map((r) => {
                      const obtained = toNumber(r.obtained_marks);
                      const full = toNumber(r.examSchedule?.fullMarks);
                      const pass = toNumber(r.examSchedule?.passMarks);
                      const hasMarks =
                        r.obtained_marks !== null &&
                        r.obtained_marks !== undefined &&
                        r.obtained_marks !== "";
                      const passed = hasMarks ? getPassed(r) : null;
                      const pct =
                        full === 0 ? 0 : Math.round((obtained / full) * 100);

                      return (
                        <TableRow
                          key={r.id}
                          className="transition-colors hover:bg-muted/20"
                        >
                          <TableCell className="whitespace-nowrap text-sm font-medium">
                            {formatDate(r.examSchedule?.examConfig?.exam_date)}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm">
                            {r.examSchedule?.subject?.name ?? "—"}
                          </TableCell>
                          <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                            {r.examSchedule?.examConfig?.exam_name ?? "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="text-sm font-semibold">
                              {hasMarks ? obtained : "—"}
                            </span>
                            {hasMarks && full > 0 && (
                              <span className="ml-1 text-[10px] text-muted-foreground">
                                ({pct}%)
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold">
                            {full || "—"}
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold">
                            {pass || "—"}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className="border-border bg-muted/20 px-2 py-0 text-xs font-semibold"
                            >
                              {getLetterGrade(r)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center text-sm font-semibold">
                            {getGradePoint(r)}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              className={cn(
                                "gap-1 px-2 py-0 text-xs font-medium",
                                getStatusBadgeClass(passed),
                              )}
                            >
                              {passed === null ? "—" : passed ? "PASS" : "FAIL"}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-medium text-foreground">
                    {startIndex}
                  </span>
                  –{endIndex} of{" "}
                  <span className="font-medium text-foreground">
                    {filtered.length}
                  </span>{" "}
                  records
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-3 text-xs"
                    disabled={safePage <= 1}
                    onClick={() => setCurrentPage(safePage - 1)}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Prev
                  </Button>
                  <span className="text-xs font-medium text-muted-foreground">
                    Page {safePage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1 px-3 text-xs"
                    disabled={safePage >= totalPages}
                    onClick={() => setCurrentPage(safePage + 1)}
                  >
                    Next
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default StudentResultsView;
