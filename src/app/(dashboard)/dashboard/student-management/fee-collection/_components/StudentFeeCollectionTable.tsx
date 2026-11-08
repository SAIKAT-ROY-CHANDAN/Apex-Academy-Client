"use client";

import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MessageSquareText,
  Plus,
  Search,
  View,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type {
  TDepartment,
  TProgram,
} from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getClassesByDepartmentId } from "@/services/academicClass";
import { getDepartmentByProgramId } from "@/services/department";
import { getFeeManage } from "@/services/feeType";
import { getPrograms } from "@/services/program";
import type { QueryParams } from "@/types/shared/query.type";
import SendDueSmsDialog from "./SendDueSmsDialog";
import type {
  TStudentFeeCollectionMeta,
  TStudentWithFeeCollections,
} from "./types";

interface StudentFeeCollectionTableProps {
  students: TStudentWithFeeCollections[];
  meta?: TStudentFeeCollectionMeta;
  // Scopes the whole table to a session — pass this down from wherever
  // the session is selected (context, page param, etc.)
  academicSessionId?: string;
  mode?: string;
  classes?: TAcademicClass[];
}

const DEFAULT_LIMIT = 10;
const SEARCH_DEBOUNCE_MS = 400;

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const formatClassName = (cls?: TAcademicClass) => {
  if (!cls) return undefined;
  return `${cls.class_name}${cls.year_level ? ` - Year ${cls.year_level}` : ""}`;
};

const StudentFeeCollectionTable = ({
  students: initialStudents,
  meta,
  academicSessionId,
  mode = "SCHOOL",
  classes = [],
}: StudentFeeCollectionTableProps) => {
  const isUniversity = mode === "COLLEGE_UNIVERSITY";

  const [students, setStudents] =
    useState<TStudentWithFeeCollections[]>(initialStudents);
  const [isLoading, setIsLoading] = useState(false);

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);
  const [totalPages, setTotalPages] = useState(meta?.totalPages ?? 1);
  const [total, setTotal] = useState(meta?.total ?? initialStudents.length);

  // Cascading filters: Program → Department → Class (each level fetched from
  // the backend when its parent is selected)
  const [programs, setPrograms] = useState<TProgram[]>([]);
  const [departments, setDepartments] = useState<TDepartment[]>([]);
  const [classesByDepartment, setClassesByDepartment] = useState<
    TAcademicClass[]
  >([]);
  const [loadingPrograms, setLoadingPrograms] = useState(isUniversity);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);

  // Load all programs on mount (university mode)
  useEffect(() => {
    if (!isUniversity) return;

    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const response = await getPrograms([]);
        setPrograms(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching programs:", error);
        setPrograms([]);
      } finally {
        setLoadingPrograms(false);
      }
    };

    fetchPrograms();
  }, [isUniversity]);

  // Fetch departments when a program is selected
  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      setDepartments(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  // Fetch classes when a department is selected
  const fetchClasses = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setClassesByDepartment([]);
      return;
    }

    setLoadingClasses(true);
    try {
      const response = await getClassesByDepartmentId(departmentId);
      setClassesByDepartment(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching classes:", error);
      setClassesByDepartment([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const handleProgramChange = (value: string) => {
    const id = value ?? "";
    setSelectedProgram(id);
    setSelectedDepartment("");
    setSelectedClass("");
    setDepartments([]);
    setClassesByDepartment([]);
    setPage(1);
    if (id) fetchDepartments(id);
  };

  const handleDepartmentChange = (value: string) => {
    const id = value ?? "";
    setSelectedDepartment(id);
    setSelectedClass("");
    setClassesByDepartment([]);
    setPage(1);
    if (id) fetchClasses(id);
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value ?? "");
    setPage(1);
  };

  const availableClasses: TAcademicClass[] = isUniversity
    ? classesByDepartment
    : classes;

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasMountedRef = useRef(false);

  useEffect(() => {
    setStudents(initialStudents);
    setTotal(meta?.total ?? initialStudents.length);
    setTotalPages(meta?.totalPages ?? 1);
  }, [initialStudents, meta]);

  // Debounce the search box — reset to page 1 whenever the term settles
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setPage(1);
      setSearchTerm(searchInput);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchInput]);

  // Fetch whenever any query param changes
  useEffect(() => {
    let cancelled = false;

    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return;
    }

    const fetchStudents = async () => {
      setIsLoading(true);

      const query: QueryParams[] = [
        { label: "page", value: page },
        { label: "limit", value: limit },
      ];

      if (searchTerm) {
        query.push({ label: "searchTerm", value: searchTerm });
      }

      if (academicSessionId) {
        query.push({ label: "academicSessionId", value: academicSessionId });
      }

      if (selectedClass) {
        query.push({ label: "class_id", value: selectedClass });
      }
      if (selectedProgram) {
        query.push({ label: "program_id", value: selectedProgram });
      }
      if (selectedDepartment) {
        query.push({ label: "department_id", value: selectedDepartment });
      }

      const response = await getFeeManage(query);

      if (cancelled) return;

      if (!response.success) {
        toast.error(response.message ?? "Failed to load fee collections");
        setIsLoading(false);
        return;
      }

      setStudents(response.data ?? []);
      setTotal(response.meta?.total ?? 0);
      setTotalPages(Math.max(1, response.meta?.totalPages ?? 1));
      setIsLoading(false);
    };

    fetchStudents();

    return () => {
      cancelled = true;
    };
  }, [
    searchTerm,
    page,
    limit,
    academicSessionId,
    selectedClass,
    selectedProgram,
    selectedDepartment,
  ]);

  const rangeStart = total === 0 ? 0 : (page - 1) * limit + 1;
  const rangeEnd = Math.min(page * limit, total);
  const pageDueTotal = students.reduce(
    (sum, s) => sum + (s.feeSummary?.dueAmount ?? 0),
    0,
  );

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="flex flex-col gap-3 pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            Student Fee Collections
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
              {total}
            </span>
          </CardTitle>
          <div className="flex w-full max-w-xs items-center gap-2">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, registration number..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 pl-8 text-sm"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-9 shrink-0 gap-1.5 text-xs"
              onClick={() => setSmsDialogOpen(true)}
              title="Send SMS to all students with unpaid dues (all pages)"
            >
              <MessageSquareText className="h-4 w-4" />
              SMS Due
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isUniversity && (
            <Select
              value={selectedProgram}
              onValueChange={(value) => handleProgramChange(value ?? "")}
              disabled={loadingPrograms}
            >
              <SelectTrigger className="h-9 w-[170px] text-sm">
                <SelectValue placeholder="All Programs">
                  {programs.find((p) => p.id === selectedProgram)
                    ?.program_name ??
                    (loadingPrograms ? "Loading programs..." : undefined)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.program_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          {isUniversity && (
            <Select
              value={selectedDepartment}
              onValueChange={(value) => handleDepartmentChange(value ?? "")}
              disabled={!selectedProgram || loadingDepartments}
            >
              <SelectTrigger className="h-9 w-[170px] text-sm">
                <SelectValue
                  placeholder={
                    !selectedProgram
                      ? "Select program first"
                      : loadingDepartments
                        ? "Loading departments..."
                        : "All Departments"
                  }
                >
                  {
                    departments.find((d) => d.id === selectedDepartment)
                      ?.department_name
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={selectedClass}
            onValueChange={(value) => handleClassChange(value ?? "")}
            disabled={isUniversity && (!selectedDepartment || loadingClasses)}
          >
            <SelectTrigger className="h-9 w-[170px] text-sm">
              <SelectValue
                placeholder={
                  isUniversity && !selectedDepartment
                    ? "Select department first"
                    : loadingClasses
                      ? "Loading classes..."
                      : "All Classes"
                }
              >
                {formatClassName(
                  availableClasses.find((c) => c.id === selectedClass),
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {formatClassName(cls)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(selectedClass || selectedProgram || selectedDepartment) && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 text-xs"
              onClick={() => {
                setSelectedProgram("");
                setSelectedDepartment("");
                setSelectedClass("");
                setDepartments([]);
                setClassesByDepartment([]);
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Loader2 className="mb-3 h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Loading...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              {searchTerm
                ? "No students match your search."
                : "No students found."}
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
                    Student
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Class /Year
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Billing
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Payable
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                   Late Fee
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Paid
                  </TableHead>
                  <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Due
                  </TableHead>
                  <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((student, index) => {
                  
                  const className =
                    student.studentEnrollments?.find((e) => e.is_primary)
                      ?.academicClass?.class_name ?? "—";

                  const summary = student.feeSummary;
                  const hasDue = (summary?.dueAmount ?? 0) > 0;

                  // Build billing period label, e.g. "Jan 2026 – Aug 2026"
                  let billingLabel = "—";
                  if (summary?.billingStartYear && summary?.billingStartMonth) {
                    const startMonth =
                      MONTH_NAMES[summary.billingStartMonth - 1] ?? "";
                    const now = new Date();
                    const currentMonth = MONTH_NAMES[now.getMonth()] ?? "";
                    const currentYear = now.getFullYear();
                    billingLabel = `${startMonth} ${summary.billingStartYear} – ${currentMonth} ${currentYear}`;
                  }

                  // Collection progress within this billing cycle
                  const collectedPct = summary
                    ? Math.min(
                        100,
                        Math.round(
                          ((summary.totalPaid + summary.totalDiscount) /
                            Math.max(1, summary.totalPayable)) *
                            100,
                        ),
                      )
                    : 0;

                  return (
                    <TableRow
                      key={student.id}
                      className={`group transition-colors ${
                        hasDue
                          ? "bg-red-500/[0.03] hover:bg-red-500/10"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      <TableCell className="relative text-center text-xs text-muted-foreground">
                        {hasDue && (
                          <span className="absolute left-0 top-1/2 h-7 w-[3px] -translate-y-1/2 rounded-r bg-red-500" />
                        )}
                        {(page - 1) * limit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar size="default">
                            {student.photo ? (
                              <AvatarImage
                                src={student.photo}
                                alt={student.name}
                              />
                            ) : null}
                            <AvatarFallback className="text-xs font-semibold">
                              {getInitials(student.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-foreground">
                              {student.name}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              Reg: {student.registration_number || "—"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {className}
                      </TableCell>
                      <TableCell className="text-right text-xs text-muted-foreground">
                        {summary ? (
                          <span title={billingLabel} className="tabular-nums">
                            {summary.billingMonths} mo
                          </span>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right text-xs font-medium tabular-nums text-foreground">
                        {summary ? formatAmount(summary.totalPayable) : "—"}
                      </TableCell>
                      <TableCell className="text-right text-xs tabular-nums">
                        <span
                          className={`font-medium ${
                            (summary?.totalFine ?? 0) > 0
                              ? "text-amber-700"
                              : "text-muted-foreground"
                          }`}
                        >
                          {summary ? formatAmount(summary.totalFine) : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        {summary ? (
                          <div className="inline-flex flex-col items-end gap-1">
                            <span className="text-xs font-medium tabular-nums text-green-600">
                              {formatAmount(summary.totalPaid)}
                            </span>
                            <span className="block h-1 w-16 overflow-hidden rounded-full bg-muted">
                              <span
                                className={`block h-full rounded-full transition-all ${
                                  collectedPct >= 100
                                    ? "bg-green-500"
                                    : "bg-amber-500"
                                }`}
                                style={{ width: `${collectedPct}%` }}
                                title={`${collectedPct}% collected`}
                              />
                            </span>
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!summary ? (
                          "—"
                        ) : hasDue ? (
                          <span className="inline-flex items-center gap-1 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold tabular-nums text-red-600">
                            <AlertTriangle className="h-3 w-3" />
                            {formatAmount(summary.dueAmount)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Cleared
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium ${
                            student.is_active
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              student.is_active ? "bg-green-500" : "bg-red-500"
                            }`}
                          />
                          {student.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="flex justify-center items-center gap-1 text-center">
                        <Link
                          href={`/dashboard/student-management/fee-collection/${student.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="View fee collection details"
                          >
                            <View className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link
                          href={`/dashboard/student-management/fee-collection/add-fee/${student.id}`}
                          className="hidden"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Add fee"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <p className="text-xs text-muted-foreground">
                  Showing {rangeStart}–{rangeEnd} of {total}
                </p>
                {pageDueTotal > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-semibold tabular-nums text-red-600">
                    <AlertTriangle className="h-3 w-3" />
                    Due on this page: {formatAmount(pageDueTotal)}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
      <SendDueSmsDialog
        open={smsDialogOpen}
        onOpenChange={setSmsDialogOpen}
        filters={{
          searchTerm,
          classId: selectedClass,
          programId: selectedProgram,
          departmentId: selectedDepartment,
          academicSessionId,
        }}
        currentPageStudents={students}
        totalStudents={total}
      />
    </Card>
  );
};

export default StudentFeeCollectionTable;
