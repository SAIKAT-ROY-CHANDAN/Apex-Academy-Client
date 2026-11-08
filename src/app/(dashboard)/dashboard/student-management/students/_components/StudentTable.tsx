"use client";

import {
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  Loader2,
  Mail,
  Phone,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStudent, getStudents } from "@/services/student";
import EditStudentDialog from "./EditStudentDialog";
import StudentFilters from "./StudentFilters";
import {
  downloadStudentsCsv,
  getEnrollmentValue,
  getPrimaryEnrollment,
} from "./student-export";
import {
  buildStudentEnrollmentFilter,
  emptyStudentFilters,
  hasStudentFilters,
  type TStudentFilterValues,
} from "./student-filters";
import type { TStudent } from "./types";

interface StudentTableProps {
  students: TStudent[] | [];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
  initialFilters?: TStudentFilterValues;
  initialSearchTerm?: string;
}

const PAGE_SIZE = 10;
const DOWNLOAD_PAGE_SIZE = 500;

const StudentTable = ({
  students: initialStudents,
  currentPage,
  totalItems,
  totalPages,
  initialFilters,
  initialSearchTerm,
}: StudentTableProps) => {
  const [students, setStudents] = useState<TStudent[]>(initialStudents);
  const [filters, setFilters] = useState<TStudentFilterValues>(
    initialFilters ?? emptyStudentFilters,
  );
  const [downloadMeta, setDownloadMeta] = useState<{
    departmentName?: string;
    className?: string;
  }>({});
  const [searchInput, setSearchInput] = useState(initialSearchTerm ?? "");
  const [isDownloading, setIsDownloading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<TStudent | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<TStudent | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const hasActiveFilters = hasStudentFilters(filters);
  const isFiltered = hasActiveFilters || searchInput.trim().length > 0;

  // Keep client state in sync with server (pagination / filter navigation).
  useEffect(() => {
    setStudents(initialStudents);
  }, [initialStudents]);
  // biome-ignore lint/correctness/useExhaustiveDependencies: sync only when URL filter ids change.
  useEffect(() => {
    if (initialFilters) setFilters(initialFilters);
  }, [
    initialFilters?.program_id,
    initialFilters?.department_id,
    initialFilters?.academic_class_id,
  ]);
  useEffect(() => {
    setSearchInput(initialSearchTerm ?? "");
  }, [initialSearchTerm]);

  const pushQuery = (params: URLSearchParams) => {
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const applyFiltersToUrl = (next: TStudentFilterValues, term?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const resolvedTerm = (term ?? searchInput).trim();
    if (next.program_id) params.set("program_id", next.program_id);
    else params.delete("program_id");
    if (next.department_id) params.set("department_id", next.department_id);
    else params.delete("department_id");
    if (next.academic_class_id)
      params.set("academic_class_id", next.academic_class_id);
    else {
      params.delete("academic_class_id");
      params.delete("class_id");
    }
    if (resolvedTerm) params.set("searchTerm", resolvedTerm);
    else {
      params.delete("searchTerm");
      params.delete("search");
    }
    params.set("page", "1");
    pushQuery(params);
  };

  const handleFilterChange = (next: TStudentFilterValues) => {
    setFilters(next);
    setDownloadMeta({});
    applyFiltersToUrl(next);
  };

  // Debounced search: update the URL so the server refetches page 1.
  // biome-ignore lint/correctness/useExhaustiveDependencies: pushQuery/searchParams are stable nav helpers.
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const urlTerm = (
        params.get("searchTerm") ??
        params.get("search") ??
        ""
      ).trim();
      const term = searchInput.trim();
      if (term === urlTerm) return;
      if (term) params.set("searchTerm", term);
      else {
        params.delete("searchTerm");
        params.delete("search");
      }
      params.set("page", "1");
      pushQuery(params);
    }, 400);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const handleEditClick = (student: TStudent) => {
    setStudentToEdit(student);
    setEditDialogOpen(true);
  };

  const filteredStudents = students;
  const paginatedStudents = filteredStudents;
  const canGoNext = totalPages
    ? currentPage < totalPages
    : students.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    pushQuery(params);
  };

  const handleClearFilters = () => {
    setFilters(emptyStudentFilters);
    setDownloadMeta({});
    setSearchInput("");
    router.push(pathname);
  };

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const filterObject = buildStudentEnrollmentFilter(filters);
      const term = searchInput.trim();
      const baseQuery = [];
      if (Object.keys(filterObject).length > 0) {
        baseQuery.push({
          label: "filter",
          value: JSON.stringify(filterObject),
        });
      }
      if (term) baseQuery.push({ label: "searchTerm", value: term });

      // Fetch ALL filtered students across every page (not just the 10 on screen).
      const allStudents: TStudent[] = [];
      let page = 1;
      let expectedTotal: number | null = null;
      for (let guard = 0; guard < 200; guard++) {
        const response = await getStudents([
          ...baseQuery,
          { label: "page", value: page },
          { label: "limit", value: DOWNLOAD_PAGE_SIZE },
        ]);
        if (response?.success === false) {
          toast.error(response?.message ?? "Download failed");
          return;
        }
        const batch: TStudent[] = response?.data ?? [];
        if (expectedTotal === null) {
          expectedTotal =
            response?.meta?.total ?? response?.meta?.totalItems ?? null;
        }
        allStudents.push(...batch);
        const totalPagesHint =
          response?.meta?.totalPages ?? response?.meta?.lastPage ?? null;
        if (
          totalPagesHint
            ? page >= totalPagesHint
            : batch.length < DOWNLOAD_PAGE_SIZE
        )
          break;
        if (expectedTotal !== null && allStudents.length >= expectedTotal)
          break;
        if (batch.length === 0) break;
        page += 1;
      }

      if (allStudents.length === 0) {
        toast.info("No students to download for the selected filters.");
        return;
      }
      const first = allStudents[0];
      const count = downloadStudentsCsv(allStudents, filters, {
        departmentName:
          downloadMeta.departmentName ??
          getEnrollmentValue(first, "department"),
        className: downloadMeta.className ?? getEnrollmentValue(first, "class"),
      });
      toast.success(`Downloaded ${count} student${count === 1 ? "" : "s"}.`);
    } catch (error) {
      console.error("Failed to download students:", error);
      toast.error("Failed to download students.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteClick = (student: TStudent) => {
    setStudentToDelete(student);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!studentToDelete) return;

    startTransition(async () => {
      const response = await deleteStudent(studentToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete student");
        return;
      }
      toast.success(response.message ?? "Student deleted successfully");
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
      router.refresh();
    });
  };
  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-col gap-4 pb-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="text-lg font-semibold">Students</CardTitle>
            <div className="flex items-center gap-2">
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9"
                  onClick={handleClearFilters}
                >
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className="h-9"
                onClick={handleDownload}
                disabled={isDownloading || filteredStudents.length === 0}
                title="Download all filtered students as CSV"
              >
                {isDownloading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Download className="mr-2 h-3.5 w-3.5" />
                )}
                {isDownloading ? "Preparing..." : "Download"}
              </Button>
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search all students by name, email, NID..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-9 pl-8 text-sm"
                />
              </div>
            </div>
          </div>
          <StudentFilters filters={filters} onChange={handleFilterChange} />
          {isFiltered && (
            <p className="text-xs text-muted-foreground">
              Showing {totalItems} filtered student{totalItems === 1 ? "" : "s"}
              {searchInput.trim() ? ` for "${searchInput.trim()}"` : ""}.
              Download exports every matching student, not just this page.
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {isFiltered
                  ? "No students match your filters."
                  : "No students found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {isFiltered
                  ? "Try a different search term or clear the filters."
                  : "Add a student to get started."}
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
                    <TableHead className="h-10 w-16 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Photo
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Name
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Roll & REG
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Program
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Department
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class/ Year
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Guardian
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Gender
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" />
                        Contact
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        Email
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedStudents.map((student, index) => (
                    <TableRow
                      key={student.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="relative mx-auto h-10 w-10 overflow-hidden rounded-full border border-border/60 bg-muted">
                          <span className="flex h-full w-full items-center justify-center text-xs font-semibold text-muted-foreground">
                            {student.name
                              .split(" ")
                              .filter(Boolean)
                              .slice(0, 2)
                              .map((part) => part[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                          {student.photo && (
                            <img
                              src={student.photo}
                              alt={`${student.name} photo`}
                              className="absolute inset-0 h-full w-full object-cover"
                              onError={(event) => {
                                event.currentTarget.style.display = "none";
                              }}
                            />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {student.name}
                        <div className="text-xs font-normal text-muted-foreground">
                          NID: {student.nid_no}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {(() => {
                          const enrollment = getPrimaryEnrollment(student);
                          return (
                            <>
                              <div className="text-xs font-normal text-muted-foreground">
                                Roll: {enrollment?.roll_number || "N/A"}
                              </div>
                              <div className="text-xs font-normal text-muted-foreground">
                                REG: {enrollment?.registration_number || "N/A"}
                              </div>
                            </>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="max-w-36 text-xs text-muted-foreground">
                        <span className="line-clamp-2">
                          {getEnrollmentValue(student, "program")}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-36 text-xs text-muted-foreground">
                        <span className="line-clamp-2">
                          {getEnrollmentValue(student, "department")}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-36 text-xs text-muted-foreground">
                        <span className="line-clamp-2">
                          {getEnrollmentValue(student, "class")}
                        </span>
                      </TableCell>

                      <TableCell className="text-xs">
                        <div>F: {student.father_name}</div>
                        <div className="text-muted-foreground">
                          M: {student.mother_name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          {student.gender}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {student.student_phone}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {student.email}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${
                            student.is_active
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          {student.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit student"
                            onClick={() => handleEditClick(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(student)}
                            title="Delete student"
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
                  {isFiltered
                    ? `Showing ${filteredStudents.length} matching item${filteredStudents.length === 1 ? "" : "s"} (page ${currentPage}${totalPages ? ` of ${totalPages}` : ""}, ${totalItems} total)`
                    : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() =>
                      handlePageChange(Math.max(1, currentPage - 1))
                    }
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground">
                    {`Page ${currentPage}`}
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
        title="Delete Student"
        description={
          studentToDelete
            ? `Are you sure you want to delete "${studentToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this student? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <EditStudentDialog
        student={studentToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default StudentTable;
