"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Undo2, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import React from "react";
import { getDepartments } from "@/services/department";
import { getAcademicClassDetails } from "@/services/academicClass";

export type Option = {
  id: string;
  name: string;
};

export type FilterValues = {
  from_date: string;
  to_date: string;
  program_id: string;
  department_id: string;
  academic_class_id: string;
  searchTerm: string;
};

interface CollectionReportFiltersProps {
  mode: string;
  programs: Option[];
  departments: Option[];
  classes: Option[];
  initialFilters: FilterValues;
}

export function CollectionReportFilters({
  mode,
  programs,
  departments: initialDepartments,
  classes: initialClasses,
  initialFilters,
}: CollectionReportFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draft, setDraft] = useState<FilterValues>({ ...initialFilters });
  const [departments, setDepartments] = useState<Option[]>(initialDepartments);
  const [classes, setClasses] = useState<Option[]>(initialClasses);
  const [loadingDept, setLoadingDept] = useState(false);
  const [loadingClass, setLoadingClass] = useState(false);

  const isCollege = mode === "COLLEGE_UNIVERSITY";

  // Re-sync with server-provided data only when URL params actually change
  const filtersKey = JSON.stringify(initialFilters);
  useEffect(() => {
    setDraft({ ...initialFilters });
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
      setDraft((prev) => ({
        ...prev,
        program_id: value ?? "",
        department_id: "",
        academic_class_id: "",
      }));
      if (value && isCollege) {
        fetchDepartments(value);
      } else {
        setDepartments([]);
        setClasses([]);
      }
    },
    [isCollege, fetchDepartments],
  );

  const handleDepartmentChange = useCallback(
    (value: string | null) => {
      setDraft((prev) => ({
        ...prev,
        department_id: value ?? "",
        academic_class_id: "",
      }));
      if (value && isCollege) {
        fetchClasses(value);
      } else {
        setClasses([]);
      }
    },
    [isCollege, fetchClasses],
  );

  const handleChange = useCallback(
    (field: keyof FilterValues, value: string | null) => {
      setDraft((prev) => ({ ...prev, [field]: value ?? "" }));
    },
    [],
  );

  const hasActiveFilters =
    draft.from_date ||
    draft.to_date ||
    draft.program_id ||
    draft.department_id ||
    draft.academic_class_id ||
    draft.searchTerm;

  const handleClear = useCallback(() => {
    router.push(pathname);
    setDraft({
      from_date: "",
      to_date: "",
      program_id: "",
      department_id: "",
      academic_class_id: "",
      searchTerm: "",
    });
    setDepartments([]);
    setClasses([]);
  }, [router, pathname]);

  const handleApply = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");

    const setOrDelete = (key: string, value: string) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };

    setOrDelete("from_date", draft.from_date);
    setOrDelete("to_date", draft.to_date);
    setOrDelete("program_id", draft.program_id);
    setOrDelete("department_id", draft.department_id);
    setOrDelete("academic_class_id", draft.academic_class_id);
    setOrDelete("searchTerm", draft.searchTerm);

    const query = params.toString();
    router.push(`${pathname}${query ? `?${query}` : ""}`);
  }, [draft, router, pathname, searchParams]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleApply();
      }
    },
    [handleApply],
  );

  const deptDisabled = isCollege && !draft.program_id;
  const classDisabled = isCollege ? !draft.department_id : false;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Filters</span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* From Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">From Date</label>
          <Input
            type="date"
            value={draft.from_date}
            onChange={(e) => handleChange("from_date", e.target.value)}
            className="h-10"
          />
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">To Date</label>
          <Input
            type="date"
            value={draft.to_date}
            onChange={(e) => handleChange("to_date", e.target.value)}
            className="h-10"
          />
        </div>

        {/* Program (COLLEGE_UNIVERSITY only) */}
        {isCollege && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Program
            </label>
            <Select
              value={draft.program_id}
              onValueChange={handleProgramChange}
            >
              <SelectTrigger className="h-10">
                <SelectValue>
                  {programs.find((p) => p.id === draft.program_id)?.name ?? "All Programs"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Department (COLLEGE_UNIVERSITY only) */}
        {isCollege && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-500">
              Department
            </label>
            <Select
              value={draft.department_id}
              onValueChange={handleDepartmentChange}
              disabled={deptDisabled || loadingDept}
            >
              <SelectTrigger className="h-10">
                <SelectValue>
                  {loadingDept ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading...
                    </span>
                  ) : deptDisabled ? (
                    "Select program first"
                  ) : (
                    departments.find((d) => d.id === draft.department_id)?.name ?? "All Departments"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Academic Class */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">
            Academic Class/Year
          </label>
          <Select
            value={draft.academic_class_id}
            onValueChange={(v) => handleChange("academic_class_id", v)}
            disabled={classDisabled || loadingClass}
          >
            <SelectTrigger className="h-10">
              <SelectValue>
                {loadingClass ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Loading...
                  </span>
                ) : classDisabled ? (
                  isCollege ? (
                    "Select department first"
                  ) : (
                    "All Classes"
                  )
                ) : (
                  classes.find((c) => c.id === draft.academic_class_id)?.name ?? "All Classes"
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-500">
            Search Student
          </label>
          <Input
            value={draft.searchTerm}
            onChange={(e) => handleChange("searchTerm", e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name..."
            className="h-10"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClear}
              type="button"
            >
              <Undo2 className="h-4 w-4" />
              Clear Filters
            </Button>
          )}
          <Button size="sm" onClick={handleApply} type="button">
            <Search className="h-4 w-4" />
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
}
