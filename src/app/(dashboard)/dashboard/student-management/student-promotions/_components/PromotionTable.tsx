"use client";

import {
  ArrowUpDown,
  GraduationCap,
  History,
  Search,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";
import type { TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
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
import PromoteAllDialog from "./PromoteAllDialog";
import PromoteStudentDialog from "./PromoteStudentDialog";
import type { TPromotionEnrollment, TPromotionLookups } from "./types";

interface PromotionTableProps {
  enrollments: TPromotionEnrollment[];
  currentPage: number;
  pageSize: number;
  lookups: TPromotionLookups;
  mode?: string;
  programs?: TProgram[];
  filterProgramId?: string;
  filterDepartmentId?: string;
}

const PromotionTable = ({
  enrollments,
  currentPage,
  pageSize,
  lookups,
  mode = "SCHOOL",
  programs = [],
  filterProgramId = "",
  filterDepartmentId = "",
}: PromotionTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selected, setSelected] = useState<TPromotionEnrollment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [promotedIds, setPromotedIds] = useState<Set<string>>(new Set());
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);

  const filteredEnrollments = useMemo(() => {
    if (!searchQuery.trim()) return enrollments;
    const query = searchQuery.toLowerCase();
    return enrollments.filter(
      (enrollment) =>
        enrollment.student?.name?.toLowerCase().includes(query) ||
        enrollment.roll_number?.toLowerCase().includes(query) ||
        enrollment.registration_number?.toLowerCase().includes(query),
    );
  }, [enrollments, searchQuery]);

  const handlePromoteClick = (enrollment: TPromotionEnrollment) => {
    setSelected(enrollment);
    setDialogOpen(true);
  };

  const handlePromoted = (enrollmentId: string) => {
    setPromotedIds((prev) => new Set(prev).add(enrollmentId));
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.delete(enrollmentId);
      return next;
    });
  };

  const handleBulkPromoted = (enrollmentIds: string[]) => {
    setPromotedIds((prev) => new Set([...prev, ...enrollmentIds]));
    setCheckedIds(new Set());
  };

  // A closed (non-primary) enrollment can never be promoted — only the
  // student's current enrollment can. Closed rows stay visible (so History
  // remains reachable) but are locked out of single + bulk promotion.
  const isClosed = (e: TPromotionEnrollment) => e.is_primary === false;

  // Students still eligible for promotion (current + not yet promoted here)
  const eligibleEnrollments = useMemo(
    () =>
      filteredEnrollments.filter((e) => !isClosed(e) && !promotedIds.has(e.id)),
    [filteredEnrollments, promotedIds],
  );

  // Bulk target: checked rows win, otherwise every eligible row on screen
  const bulkTargets = useMemo(() => {
    if (checkedIds.size === 0) return eligibleEnrollments;
    return eligibleEnrollments.filter((e) => checkedIds.has(e.id));
  }, [checkedIds, eligibleEnrollments]);

  const allEligibleChecked =
    eligibleEnrollments.length > 0 &&
    eligibleEnrollments.every((e) => checkedIds.has(e.id));

  const toggleOne = (id: string) => {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAll = () => {
    if (allEligibleChecked) {
      setCheckedIds(new Set());
    } else {
      setCheckedIds(new Set(eligibleEnrollments.map((e) => e.id)));
    }
  };

  // Target class scope: in university mode the "New Class/Year" dropdowns
  // (single + bulk) list only classes under the filtered program/department
  // instead of every class in the system. SCHOOL mode has no hierarchy, so
  // everything stays listed. Falls back to the full list when the scope
  // resolves to nothing.
  const isScoped =
    mode === "COLLEGE_UNIVERSITY" &&
    (!!filterProgramId || !!filterDepartmentId);
  const targetClasses = useMemo<TPromotionLookups["classes"]>(() => {
    const all = lookups.classes;
    if (mode !== "COLLEGE_UNIVERSITY") return all;

    const departments = programs.flatMap((p) => p.departments ?? []);

    if (filterDepartmentId) {
      const dept = departments.find((d) => d.id === filterDepartmentId);
      const nested = dept?.academicClasses ?? [];
      if (nested.length > 0) return nested;
      const flat = all.filter((c) => c.department_id === filterDepartmentId);
      return flat.length > 0 ? flat : all;
    }

    if (filterProgramId) {
      const program = programs.find((p) => p.id === filterProgramId);
      const nested = (program?.departments ?? []).flatMap(
        (d) => d.academicClasses ?? [],
      );
      if (nested.length > 0) return nested;
      const deptIds = new Set((program?.departments ?? []).map((d) => d.id));
      const flat = all.filter(
        (c) =>
          c.program_id === filterProgramId ||
          deptIds.has(c.department_id ?? ""),
      );
      return flat.length > 0 ? flat : all;
    }

    return all;
  }, [mode, programs, filterProgramId, filterDepartmentId, lookups.classes]);

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Found Students{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({filteredEnrollments.length})
            </span>
          </CardTitle>
          <div className="flex w-full max-w-md items-center justify-end gap-2">
            <Button
              type="button"
              size="sm"
              className="h-9 gap-1.5 rounded-full px-4 text-xs"
              onClick={() => setBulkOpen(true)}
              disabled={bulkTargets.length === 0}
              title={
                checkedIds.size > 0
                  ? "Promote the checked students together"
                  : "Promote all filtered students together"
              }
            >
              <Users className="h-3.5 w-3.5" />
              {checkedIds.size > 0
                ? `Promote Selected (${bulkTargets.length})`
                : `Promote All (${eligibleEnrollments.length})`}
            </Button>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, roll, reg..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEnrollments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No students match your search."
                  : "No students found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Adjust your filters to see enrolled students."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={allEligibleChecked}
                      onChange={toggleAll}
                      disabled={eligibleEnrollments.length === 0}
                      aria-label="Select all students"
                      className="h-4 w-4 accent-primary"
                    />
                  </TableHead>
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
                    Roll & REG
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Current Class
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Session
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 w-44 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEnrollments.map((enrollment, index) => {
                  const closed = isClosed(enrollment);
                  const isPromoted = promotedIds.has(enrollment.id);
                  const locked = closed || isPromoted;
                  return (
                    <TableRow
                      key={enrollment.id}
                      className={
                        closed
                          ? "opacity-60 transition-colors hover:bg-muted/20"
                          : "group transition-colors hover:bg-muted/20"
                      }
                    >
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={checkedIds.has(enrollment.id)}
                          onChange={() => toggleOne(enrollment.id)}
                          disabled={locked}
                          aria-label={`Select ${enrollment.student?.name ?? "student"}`}
                          title={
                            closed
                              ? "Already closed — only the current enrollment can be promoted"
                              : undefined
                          }
                          className="h-4 w-4 accent-primary disabled:opacity-40"
                        />
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * pageSize + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {enrollment.student?.name}
                        <div className="text-xs font-normal text-muted-foreground">
                          {enrollment.student?.student_phone ||
                            enrollment.student?.email ||
                            "—"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-xs font-normal text-muted-foreground">
                          Roll: {enrollment.roll_number || "N/A"}
                        </div>
                        <div className="text-xs font-normal text-muted-foreground">
                          REG: {enrollment.registration_number || "N/A"}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {enrollment.academicClass?.class_name || "N/A"}
                        {enrollment.academicSection?.section_name && (
                          <span className="block text-muted-foreground">
                            Section: {enrollment.academicSection.section_name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {enrollment.academicSession?.session_name || "N/A"}
                        {enrollment.batch?.batch_name && (
                          <span className="block">
                            Batch: {enrollment.batch.batch_name}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {closed ? (
                          <Badge
                            variant="outline"
                            title="This enrollment is already closed — only the current one can be promoted"
                          >
                            Closed
                          </Badge>
                        ) : isPromoted ? (
                          <Badge variant="default">Promoted</Badge>
                        ) : (
                          <Badge variant="secondary">
                            {enrollment.enrollment_status || "ACTIVE"}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 rounded-full border-green-200 bg-green-50 px-3 text-xs text-green-700 hover:bg-green-100 hover:text-green-800 disabled:opacity-50"
                            onClick={() => handlePromoteClick(enrollment)}
                            disabled={locked}
                            type="button"
                            title={
                              closed
                                ? "Already closed — only the current enrollment can be promoted"
                                : "Promote this student"
                            }
                          >
                            <GraduationCap className="h-3.5 w-3.5" />
                            {isPromoted ? "Done" : "Promote"}
                          </Button>
                          <Link
                            href={`/dashboard/student-management/student-promotions/history/${enrollment.student_id}`}
                            title="View promotion history"
                            aria-label={`Promotion history of ${enrollment.student?.name ?? "student"}`}
                            className="inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-white px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <History className="h-3.5 w-3.5" />
                            History
                          </Link>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <PromoteStudentDialog
        enrollment={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lookups={lookups}
        onPromoted={handlePromoted}
        targetClasses={targetClasses}
        isScoped={isScoped}
      />

      <PromoteAllDialog
        enrollments={bulkTargets}
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        lookups={lookups}
        onPromoted={handleBulkPromoted}
        targetClasses={targetClasses}
        isScoped={isScoped}
      />
    </>
  );
};

export default PromotionTable;
