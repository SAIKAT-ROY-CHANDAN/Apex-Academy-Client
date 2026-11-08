"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Undo2, Search, SlidersHorizontal } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { getDepartments } from "@/services/department";
import { getAcademicClassDetails } from "@/services/academicClass";

export type ReportFilterValues = {
  startDate: string;
  endDate: string;
  programId: string;
  classId: string;
  batchId: string;
  sectionId: string;
  departmentId: string;
  search: string;
};

export type Option = {
  id: string;
  name: string;
};

type HostelStudentsDueReportFiltersProps = {
  initialFilters: ReportFilterValues;
  programs: Option[];
  classes: Option[];
  batches: Option[];
  sections: Option[];
  departments: Option[];
};

const HostelStudentsDueReportFilters = ({
  initialFilters,
  programs,
  classes: initialClasses,
  batches,
  sections,
  departments: initialDepartments,
}: HostelStudentsDueReportFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draftFilters, setDraftFilters] = useState<ReportFilterValues>({
    startDate: initialFilters.startDate ?? "",
    endDate: initialFilters.endDate ?? "",
    programId: initialFilters.programId ?? "",
    classId: initialFilters.classId ?? "",
    batchId: initialFilters.batchId ?? "",
    sectionId: initialFilters.sectionId ?? "",
    departmentId: initialFilters.departmentId ?? "",
    search: initialFilters.search ?? "",
  });

  const [departments, setDepartments] = useState<Option[]>(initialDepartments);
  const [classes, setClasses] = useState<Option[]>(initialClasses);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);

  const filtersKey = JSON.stringify(initialFilters);
  useEffect(() => {
    setDraftFilters({
      startDate: initialFilters.startDate ?? "",
      endDate: initialFilters.endDate ?? "",
      programId: initialFilters.programId ?? "",
      classId: initialFilters.classId ?? "",
      batchId: initialFilters.batchId ?? "",
      sectionId: initialFilters.sectionId ?? "",
      departmentId: initialFilters.departmentId ?? "",
      search: initialFilters.search ?? "",
    });
    setDepartments(initialDepartments);
    setClasses(initialClasses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  const fetchDepartments = useCallback(async (programId: string) => {
    setLoadingDept(true);
    try {
      const res = await getDepartments([
        { label: "filter", value: JSON.stringify({ program_id: programId }) },
        { label: "limit", value: "500" },
      ]);
      const data = Array.isArray(res?.data) ? res.data : [];
      setDepartments(
        data.map((d: any) => ({
          id: String(d.id),
          name: d.department_name ?? String(d.id),
        })),
      );
    } catch {
      setDepartments([]);
    } finally {
      setLoadingDept(false);
    }
  }, []);

  const fetchClasses = useCallback(async (departmentId: string) => {
    setLoadingClass(true);
    try {
      const res = await getAcademicClassDetails([
        { label: "filter", value: JSON.stringify({ department_id: departmentId }) },
        { label: "limit", value: "500" },
      ]);
      const data = Array.isArray(res?.data) ? res.data : [];
      setClasses(
        data.map((c: any) => ({
          id: String(c.id),
          name: c.class_name ?? String(c.id),
        })),
      );
    } catch {
      setClasses([]);
    } finally {
      setLoadingClass(false);
    }
  }, []);

  const handleProgramChange = useCallback(
    (value: string | null) => {
      const programId = value ?? "";
      setDraftFilters((current) => ({
        ...current,
        programId,
        departmentId: "",
        classId: "",
        batchId: "",
        sectionId: "",
      }));
      if (programId) {
        fetchDepartments(programId);
      } else {
        setDepartments([]);
        setClasses([]);
      }
    },
    [fetchDepartments],
  );

  const handleDepartmentChange = useCallback(
    (value: string | null) => {
      const departmentId = value ?? "";
      setDraftFilters((current) => ({
        ...current,
        departmentId,
        classId: "",
        batchId: "",
        sectionId: "",
      }));
      if (departmentId) {
        fetchClasses(departmentId);
      } else {
        setClasses([]);
      }
    },
    [fetchClasses],
  );

  const handleClassChange = useCallback((value: string | null) => {
    setDraftFilters((current) => ({
      ...current,
      classId: value ?? "",
      batchId: "",
      sectionId: "",
    }));
  }, []);

  const handleBatchChange = useCallback((value: string | null) => {
    setDraftFilters((current) => ({ ...current, batchId: value ?? "" }));
  }, []);

  const handleSectionChange = useCallback((value: string | null) => {
    setDraftFilters((current) => ({ ...current, sectionId: value ?? "" }));
  }, []);

  const handleFilterChange = useCallback(
    (field: keyof ReportFilterValues, value: string | null) => {
      setDraftFilters((current) => ({
        ...current,
        [field]: value ?? "",
      }));
    },
    [],
  );

  const hasActiveFilters =
    draftFilters.startDate ||
    draftFilters.endDate ||
    draftFilters.programId ||
    draftFilters.classId ||
    draftFilters.batchId ||
    draftFilters.sectionId ||
    draftFilters.departmentId ||
    draftFilters.search;

  const handleClearFilters = useCallback(() => {
    router.push(pathname);
    setDraftFilters({
      startDate: "",
      endDate: "",
      programId: "",
      classId: "",
      batchId: "",
      sectionId: "",
      departmentId: "",
      search: "",
    });
    setDepartments([]);
    setClasses([]);
  }, [router, pathname]);

  const handleConfirmFilters = useCallback(() => {
    const newParams = new URLSearchParams(searchParams.toString());

    newParams.delete("page");

    const setOrDelete = (key: string, value: string) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    };

    setOrDelete("startDate", draftFilters.startDate);
    setOrDelete("endDate", draftFilters.endDate);
    setOrDelete("programId", draftFilters.programId);
    setOrDelete("departmentId", draftFilters.departmentId);
    setOrDelete("classId", draftFilters.classId);
    setOrDelete("batchId", draftFilters.batchId);
    setOrDelete("sectionId", draftFilters.sectionId);
    setOrDelete("search", draftFilters.search);

    const query = newParams.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }, [draftFilters, router, pathname, searchParams]);

  const handleSearch = useCallback(() => {
    handleConfirmFilters();
  }, [handleConfirmFilters]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  const departmentDisabled = !draftFilters.programId;
  const classDisabled = !draftFilters.departmentId;

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            From Date
          </label>
          <Input
            type="date"
            value={draftFilters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            className="h-11 rounded-xl border-border/70 bg-background px-3 text-sm shadow-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            To Date
          </label>
          <Input
            type="date"
            value={draftFilters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            className="h-11 rounded-xl border-border/70 bg-background px-3 text-sm shadow-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Program
          </label>
          <Select
            value={draftFilters.programId}
            onValueChange={handleProgramChange}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue>
                {programs.find((p) => p.id === draftFilters.programId)?.name ??
                  "All Programs"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Programs</SelectItem>
              {programs.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Department
          </label>
          <Select
            value={draftFilters.departmentId}
            onValueChange={handleDepartmentChange}
            disabled={departmentDisabled || loadingDept}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue>
                {loadingDept ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </span>
                ) : departmentDisabled ? (
                  "Select program first"
                ) : (
                  departments.find((d) => d.id === draftFilters.departmentId)
                    ?.name ?? "All Departments"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Class
          </label>
          <Select
            value={draftFilters.classId}
            onValueChange={handleClassChange}
            disabled={classDisabled || loadingClass}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue>
                {loadingClass ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </span>
                ) : classDisabled ? (
                  "Select department first"
                ) : (
                  classes.find((c) => c.id === draftFilters.classId)?.name ??
                  "All Classes"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {classes.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Batch
          </label>
          <Select
            value={draftFilters.batchId}
            onValueChange={handleBatchChange}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue>
                {batches.find((b) => b.id === draftFilters.batchId)?.name ??
                  "All Batches"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Batches</SelectItem>
              {batches.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Section
          </label>
          <Select
            value={draftFilters.sectionId}
            onValueChange={handleSectionChange}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue>
                {sections.find((s) => s.id === draftFilters.sectionId)?.name ??
                  "All Sections"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sections</SelectItem>
              {sections.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 sm:col-span-2 lg:col-span-4">
          <label className="text-sm font-medium text-foreground/80">
            Search
          </label>
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={draftFilters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search by name, phone, email, registration no..."
              className="h-11 rounded-xl border-border/70 bg-background pl-8 pr-4 text-sm shadow-none"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasActiveFilters && (
            <Button
              variant="outline"
              className="h-11 rounded-xl px-4 font-medium w-full sm:w-auto"
              onClick={handleClearFilters}
              type="button"
            >
              <Undo2 className="h-4 w-4" />
              Clear Filter
            </Button>
          )}
          <Button
            className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground shadow-sm hover:bg-primary/90 w-full sm:w-auto"
            onClick={handleConfirmFilters}
            type="button"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HostelStudentsDueReportFilters;