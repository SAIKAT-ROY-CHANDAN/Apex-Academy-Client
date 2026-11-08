"use client";

import {
  ArrowUpDown,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TEnrichedResultRow } from "./types/result";

const PAGE_SIZE = 10;

const toNumber = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === "") return 0;
  const n = Number(value);
  return Number.isNaN(n) ? 0 : n;
};

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Single source of truth: status derived from letterGrade (F => Failed). Pending only when no marks/grade yet.
const getLetterForStatus = (row: TEnrichedResultRow) =>
  (row as unknown as { letterGrade?: string | null }).letterGrade ??
  (row as unknown as { computed?: { letterGrade?: string } }).computed?.letterGrade ??
  row.grade?.grade_name ??
  null;

const getStatusRaw = (row: TEnrichedResultRow): string | null =>
  (row as unknown as { status?: string | null }).status ??
  (row as unknown as { computed?: { status?: string } }).computed?.status ??
  null;

const resolveStatus = (row: TEnrichedResultRow) => {
  const raw = getStatusRaw(row);
  if (raw) {
    const n = raw.toLowerCase();
    if (n === "failed") return "failed" as const;
    if (n === "passed") return "passed" as const;
  }
  const letter = getLetterForStatus(row);
  if (letter) return letter === "F" ? ("failed" as const) : ("passed" as const);
  if (!row.examSchedule || !row.examSchedule.fullMarks) return "pending" as const;
  // fallback for legacy rows without letterGrade (should not happen after gradeScale)
  const obtained = toNumber(row.obtained_marks);
  const passMarks = toNumber(row.examSchedule?.passMarks);
  return obtained >= passMarks ? ("passed" as const) : ("failed" as const);
};

const getStatusBadgeClass = (status: "passed" | "failed" | "pending") => {
  if (status === "pending")
    return "bg-slate-100 text-slate-500 hover:bg-slate-100";
  return status === "passed"
    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
    : "bg-red-100 text-red-700 hover:bg-red-100";
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

interface ResultsTableProps {
  rows: TEnrichedResultRow[];
  loading?: boolean;
}

const ResultsTable = ({ rows, loading = false }: ResultsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageState, setPageState] = useState({ source: rows, page: 1 });

  // Restart at the first page whenever the underlying data set changes
  // (filters applied up in the page or a fresh fetch).
  if (pageState.source !== rows) {
    setPageState({ source: rows, page: 1 });
  }

  const setCurrentPage = (page: number) => {
    setPageState((prev) => ({ ...prev, page }));
  };

  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows;
    const query = searchQuery.toLowerCase();
    return rows.filter(
      (row) =>
        (row.student?.name ?? "").toLowerCase().includes(query) ||
        row.programName.toLowerCase().includes(query) ||
        row.departmentName.toLowerCase().includes(query) ||
        (row.examSchedule?.subject?.name ?? "").toLowerCase().includes(query) ||
        (row.examSchedule?.examConfig?.exam_name ?? "")
          .toLowerCase()
          .includes(query) ||
        (row.grade?.grade_name ?? "").toLowerCase().includes(query),
    );
  }, [rows, searchQuery]);

  const stats = useMemo(() => {
    if (filteredRows.length === 0) return { passed: 0, failed: 0, average: 0 };

    let passed = 0;
    let failed = 0;
    let percentSum = 0;
    let gradedCount = 0;

    filteredRows.forEach((row) => {
      const status = resolveStatus(row);
      if (status === "passed") passed += 1;
      if (status === "failed") failed += 1;

      const fullMarks = toNumber(row.examSchedule?.fullMarks);
      if (fullMarks > 0) {
        percentSum += (toNumber(row.obtained_marks) / fullMarks) * 100;
        gradedCount += 1;
      }
    });

    return {
      passed,
      failed,
      average: gradedCount > 0 ? Math.round(percentSum / gradedCount) : 0,
    };
  }, [filteredRows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(pageState.page, totalPages);
  const paginatedRows = filteredRows.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE,
  );

  const handleExport = () => {
    const csvContent = filteredRows.map((row, index) => ({
      "#": index + 1,
      Student: row.student?.name ?? "—",
      Program: row.programName,
      Department: row.departmentName,
      Subject: row.examSchedule?.subject?.name ?? "—",
      Exam: row.examSchedule?.examConfig?.exam_name ?? "—",
      Obtained: toNumber(row.obtained_marks),
      "Full Marks": row.examSchedule?.fullMarks ?? "—",
      Grade: row.grade?.grade_name ?? "—",
      Status:
        resolveStatus(row) === "passed"
          ? "Passed"
          : resolveStatus(row) === "failed"
            ? "Failed"
            : "Pending",
      Date: formatDate(
        row.examSchedule?.examConfig?.exam_date ?? row.examSchedule?.examDate,
      ),
    }));

    const csvString = [
      Object.keys(csvContent[0] || {}).join(","),
      ...csvContent.map((row) => Object.values(row).join(",")),
    ].join("\n");

    const blob = new Blob([csvString], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `exam-results-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success("Results exported successfully");
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
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
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <BookOpenCheck className="h-5 w-5 text-muted-foreground" />
            All Results
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search results..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="h-9 pl-8 text-sm"
              />
            </div>
            <Button
              onClick={handleExport}
              disabled={filteredRows.length === 0}
              className="h-9 bg-primary px-4 text-sm font-medium text-white hover:bg-primary/90"
            >
              <Download className="mr-2 h-3.5 w-3.5" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {loading
                  ? "Loading results..."
                  : searchQuery
                    ? "No results match your search."
                    : rows.length === 0
                      ? "No exam results found."
                      : "No results match the selected filters."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {loading
                  ? "Please wait a moment."
                  : searchQuery
                    ? "Try a different search term."
                    : rows.length === 0
                      ? "Results will appear here once teachers publish marks."
                      : "Try clearing the program or department filter."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Student
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Program
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Department
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Subject
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Exam
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Marks
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Grade
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Date
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRows.map((row, index) => {
                    const status = resolveStatus(row);
                    const serial =
                      (safeCurrentPage - 1) * PAGE_SIZE + index + 1;

                    return (
                      <TableRow key={row.id} className="hover:bg-muted/20">
                        <TableCell className="text-center text-sm text-muted-foreground">
                          {serial}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                                {getInitials(row.student?.name ?? "?")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate text-sm font-medium text-foreground">
                              {row.student?.name ?? "Unknown student"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.programName}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.departmentName}
                        </TableCell>
                        <TableCell className="text-sm font-medium text-foreground">
                          {row.examSchedule?.subject?.name ?? "—"}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {row.examSchedule?.examConfig?.exam_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          <span className="font-semibold text-foreground">
                            {toNumber(row.obtained_marks)}
                          </span>
                          <span className="text-muted-foreground">
                            {" "}
                            / {row.examSchedule?.fullMarks ?? "—"}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium text-foreground">
                          {row.grade?.grade_name ?? "—"}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            className={`${getStatusBadgeClass(status)} border-transparent`}
                          >
                            {status === "passed"
                              ? "Passed"
                              : status === "failed"
                                ? "Failed"
                                : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(
                            row.examSchedule?.examConfig?.exam_date ??
                              row.examSchedule?.examDate,
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? `Showing ${filteredRows.length} matching result${filteredRows.length === 1 ? "" : "s"}`
                    : `Showing ${(safeCurrentPage - 1) * PAGE_SIZE + 1}–${Math.min(safeCurrentPage * PAGE_SIZE, filteredRows.length)} of ${filteredRows.length}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safeCurrentPage === 1}
                    onClick={() =>
                      setCurrentPage(Math.max(1, safeCurrentPage - 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground">
                    Page {safeCurrentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage(safeCurrentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsTable;
