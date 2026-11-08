"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
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
import EditSubjectDialog from "./EditSubjectDialog";
import {
  BookText,
  Edit,
  Search,
  ArrowUpDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useMemo, useTransition, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { TSubject } from "./types";
import { deleteSubject } from "@/services/subject";
import { getPrograms } from "@/services/program";
import { getDepartments } from "@/services/department";
import { getAcademicClassDetails } from "@/services/academicClass";

interface SubjectTableProps {
  subjects: TSubject[] | [];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
  initialProgramId?: string;
  initialDepartmentId?: string;
  initialLevelYear?: string;
}

type ProgramOption = { id: string; program_name: string };
type DepartmentOption = { id: string; department_name: string; program_id: string | null };
type AcademicClassOption = {
  id: string;
  program_id: string | null;
  department_id: string | null;
  class_name: string;
  class_level: number | null;
  year_level: number | null;
};

const PAGE_SIZE = 10;

const SubjectTable = ({
  subjects,
  currentPage,
  totalItems,
  totalPages,
  initialProgramId = "",
  initialDepartmentId = "",
  initialLevelYear = "",
}: SubjectTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<TSubject | null>(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<TSubject | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  // ── Filter state (URL-persisted, cascading like Class Routine form) ──
  const [selectedProgramId, setSelectedProgramId] = useState(initialProgramId);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(initialDepartmentId);
  const [selectedLevelYear, setSelectedLevelYear] = useState(initialLevelYear);

  const [programs, setPrograms] = useState<ProgramOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClassOption[]>([]);

  // Sync from URL when back/forward navigation changes initial props
  useEffect(() => {
    setSelectedProgramId(initialProgramId);
  }, [initialProgramId]);
  useEffect(() => {
    setSelectedDepartmentId(initialDepartmentId);
  }, [initialDepartmentId]);
  useEffect(() => {
    setSelectedLevelYear(initialLevelYear);
  }, [initialLevelYear]);

  // Fetch programs / departments / classes for filter options
  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      try {
        const [progRes, deptRes, classRes] = await Promise.all([
          getPrograms([{ label: "limit", value: "100" }]),
          getDepartments([{ label: "limit", value: "100" }]),
          getAcademicClassDetails([{ label: "limit", value: "100" }]),
        ]);
        if (cancelled) return;
        const progData: ProgramOption[] = progRes?.data ?? [];
        // Some APIs paginate; if limit default is 10 we may get only 10.
        // Fall back to whatever we got; still functional for most cases.
        setPrograms(progData);
        const deptData: DepartmentOption[] = deptRes?.data ?? [];
        setDepartments(deptData);
        const classDataRaw = classRes?.data ?? [];
        // API may return paginated wrapper; ensure array
        const classData: AcademicClassOption[] = Array.isArray(classDataRaw)
          ? classDataRaw
          : [];
        setAcademicClasses(classData);
      } catch (e) {
        console.error("Failed to load filter options", e);
      }
    };
    fetchAll();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cascade: when Program changes, reset Department + Level if no longer valid
  const filteredDepartments = useMemo(() => {
    if (!selectedProgramId) return departments;
    return departments.filter((d) => d.program_id === selectedProgramId);
  }, [departments, selectedProgramId]);

  // Level/Year options: distinct year_level (fallback class_level) present in classes,
  // filtered by selected Program / Department when applicable (cascading).
  const levelYearOptions = useMemo(() => {
    let pool = academicClasses;
    if (selectedProgramId) {
      pool = pool.filter((c) => c.program_id === selectedProgramId);
    }
    if (selectedDepartmentId) {
      pool = pool.filter((c) => c.department_id === selectedDepartmentId);
    }
    const distinct = new Map<number, string>();
    for (const cls of pool) {
      const lvl = cls.year_level ?? cls.class_level;
      if (lvl == null) continue;
      if (!distinct.has(lvl)) {
        distinct.set(lvl, String(lvl));
      }
    }
    return Array.from(distinct.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, label]) => ({ value: String(value), label }));
  }, [academicClasses, selectedProgramId, selectedDepartmentId]);

  // Guard: if selected department no longer belongs to selected program, clear it
  useEffect(() => {
    if (
      selectedDepartmentId &&
      selectedProgramId &&
      !filteredDepartments.some((d) => d.id === selectedDepartmentId)
    ) {
      setSelectedDepartmentId("");
      // Also clear levelYear since department context changed; caller will push URL
      // via handleDepartmentChange below, but for program-driven clear we handle it here
      // by pushing via helper to keep URL in sync.
      // We don't auto-push here to avoid double navigation; the program handler does it.
    }
  }, [selectedDepartmentId, selectedProgramId, filteredDepartments]);

  // Guard: if selected levelYear no longer in options, clear it (e.g. after program change)
  useEffect(() => {
    if (
      selectedLevelYear &&
      levelYearOptions.length > 0 &&
      !levelYearOptions.some((o) => o.value === selectedLevelYear)
    ) {
      // Don't auto-clear if options is empty (initial load before fetch)
      // Only clear if options loaded and value missing
      // Keep as-is if user wants independent filter; this is intentionally mild.
      // Commented out to keep Year/Level independent when no relation exists.
      // setSelectedLevelYear("");
    }
  }, [selectedLevelYear, levelYearOptions]);

  const pushFilters = useCallback(
    (next: { programId?: string; departmentId?: string; levelYear?: string }) => {
      const params = new URLSearchParams(searchParams.toString());
      // Determine effective values (undefined means keep current; string means set/clear)
      const effProgram = next.programId !== undefined ? next.programId : selectedProgramId;
      const effDept = next.departmentId !== undefined ? next.departmentId : selectedDepartmentId;
      const effLevel = next.levelYear !== undefined ? next.levelYear : selectedLevelYear;

      if (effProgram) params.set("programId", effProgram);
      else params.delete("programId");
      // Clean snake_case aliases if they exist from shared links
      params.delete("program_id");

      if (effDept) params.set("departmentId", effDept);
      else params.delete("departmentId");
      params.delete("department_id");

      if (effLevel) params.set("levelYear", effLevel);
      else params.delete("levelYear");
      params.delete("year_level");
      params.delete("yearLevel");
      params.delete("level_year");

      params.set("page", "1");
      params.delete("searchTerm");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams, selectedProgramId, selectedDepartmentId, selectedLevelYear]
  );

  const handleProgramChange = (value: string | null) => {
    const nextProgram = value === "__all__" || !value ? "" : value;
    // Cascading: changing program clears department and keeps levelYear only if still relevant
    const stillValidDept =
      nextProgram && selectedDepartmentId
        ? filteredDepartments.some((d) => d.id === selectedDepartmentId && d.program_id === nextProgram)
        : !nextProgram
          ? true
          : false;
    // If nextProgram is set and current dept doesn't belong, clear dept
    const nextDept = nextProgram === "" ? selectedDepartmentId : stillValidDept ? selectedDepartmentId : "";
    setSelectedProgramId(nextProgram);
    if (nextDept !== selectedDepartmentId) setSelectedDepartmentId(nextDept);
    // Keep levelYear independent per requirement, but push both
    const params = new URLSearchParams(searchParams.toString());
    if (nextProgram) params.set("programId", nextProgram);
    else params.delete("programId");
    params.delete("program_id");
    if (nextDept) params.set("departmentId", nextDept);
    else params.delete("departmentId");
    params.delete("department_id");
    // Don't auto-clear levelYear; keep it unless user clears
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleDepartmentChange = (value: string | null) => {
    const nextDept = value === "__all__" || !value ? "" : value;
    setSelectedDepartmentId(nextDept);
    const params = new URLSearchParams(searchParams.toString());
    if (nextDept) params.set("departmentId", nextDept);
    else params.delete("departmentId");
    params.delete("department_id");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleLevelYearChange = (value: string | null) => {
    const nextLevel = value === "__all__" || !value ? "" : value;
    setSelectedLevelYear(nextLevel);
    const params = new URLSearchParams(searchParams.toString());
    if (nextLevel) params.set("levelYear", nextLevel);
    else params.delete("levelYear");
    params.delete("year_level");
    params.delete("yearLevel");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSelectedProgramId("");
    setSelectedDepartmentId("");
    setSelectedLevelYear("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("programId");
    params.delete("program_id");
    params.delete("departmentId");
    params.delete("department_id");
    params.delete("levelYear");
    params.delete("year_level");
    params.delete("yearLevel");
    params.delete("level_year");
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  };

  const hasActiveFilters = Boolean(selectedProgramId || selectedDepartmentId || selectedLevelYear);

  const filteredSubjects = useMemo(() => {
    if (!searchQuery.trim()) return subjects;
    const query = searchQuery.toLowerCase();
    return subjects.filter(
      (subject) =>
        subject.name.toLowerCase().includes(query) ||
        subject.academicClass?.class_name.toLowerCase().includes(query)
    );
  }, [subjects, searchQuery]);

  const paginatedSubjects = filteredSubjects;
  const canGoNext = totalPages ? currentPage < totalPages : subjects.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleEditClick = (subject: TSubject) => {
    setSubjectToEdit(subject);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (subject: TSubject) => {
    setSubjectToDelete(subject);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!subjectToDelete) return;

    startTransition(async () => {
      const response = await deleteSubject(subjectToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete subject");
        return;
      }
      toast.success(response.message ?? "Subject deleted successfully");
      setDeleteDialogOpen(false);
      setSubjectToDelete(null);

      // Step back a page if the last row on this page was just removed
      if (paginatedSubjects.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
        return;
      }
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Subjects</CardTitle>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subjects..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
          </div>

          {/* Filters: Program / Department-Group / Year-Level — cascading, optional, URL-persisted */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Program</label>
              <Select value={selectedProgramId || "__all__"} onValueChange={handleProgramChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Programs">
                    {(val: string | null) => {
                      if (!val || val === "__all__") return "All Programs";
                      return programs.find((p) => p.id === val)?.program_name ?? val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Programs</SelectItem>
                  {programs.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.program_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department / Group</label>
              <Select
                value={selectedDepartmentId || "__all__"}
                onValueChange={handleDepartmentChange}
              >
                <SelectTrigger className="h-9">
                  <SelectValue
                    placeholder={selectedProgramId ? "All Departments" : "All Departments / Groups"}
                  >
                    {(val: string | null) => {
                      if (!val || val === "__all__") return "All Departments";
                      return departments.find((d) => d.id === val)?.department_name ?? val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Departments</SelectItem>
                  {filteredDepartments.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">
                      {selectedProgramId ? "No departments for this program" : "No departments"}
                    </div>
                  ) : (
                    filteredDepartments.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.department_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Year / Level</label>
              <Select value={selectedLevelYear || "__all__"} onValueChange={handleLevelYearChange}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="All Years">
                    {(val: string | null) => {
                      if (!val || val === "__all__") return "All Years";
                      return `Year ${val}`;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">All Years</SelectItem>
                  {levelYearOptions.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-muted-foreground">No levels found</div>
                  ) : (
                    levelYearOptions.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        Year {o.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Filtering by{" "}
                {[
                  selectedProgramId ? `Program = ${programs.find((p) => p.id === selectedProgramId)?.program_name ?? selectedProgramId}` : null,
                  selectedDepartmentId ? `Department = ${departments.find((d) => d.id === selectedDepartmentId)?.department_name ?? selectedDepartmentId}` : null,
                  selectedLevelYear ? `Year = ${selectedLevelYear}` : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
                {" — "}
                {totalItems} result{totalItems === 1 ? "" : "s"}
              </p>
              <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-7 text-xs">
                <X className="mr-1 h-3 w-3" />
                Clear filters
              </Button>
            </div>
          ) : null}
        </CardHeader>
        <CardContent className="p-0">
          {paginatedSubjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <BookText className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery || hasActiveFilters
                  ? "No subjects match your filters."
                  : "No subjects found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery || hasActiveFilters
                  ? "Try adjusting search or filters."
                  : "Add a subject to get started."}
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
                        Subject Name
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Level / Year
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSubjects.map((subject, index) => (
                    <TableRow
                      key={subject.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {subject.academicClass?.class_name ?? "—"}
                      </TableCell>
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {subject.academicClass?.class_level ??
                          subject.academicClass?.year_level ??
                          "—"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit subject"
                            onClick={() => handleEditClick(subject)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(subject)}
                            title="Delete subject"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? `Showing ${filteredSubjects.length} matching item${filteredSubjects.length === 1 ? "" : "s"}`
                    : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground">
                    Page {currentPage}
                    {totalPages ? ` of ${totalPages}` : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!canGoNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Subject"
        description={
          subjectToDelete
            ? `Are you sure you want to delete "${subjectToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this subject? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <EditSubjectDialog
        subject={subjectToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default SubjectTable;
