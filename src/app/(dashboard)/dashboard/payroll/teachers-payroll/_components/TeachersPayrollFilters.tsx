"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Undo2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  FilterValues,
  TeachersPayrollFiltersProps,
} from "@/types/modules/payroll";
import { TEACHER_TYPES as CANONICAL_TEACHER_TYPES } from "@/constant/teacher/teacherType";

const TEACHER_TYPES = [
  { id: "All", name: "All Types" },
  ...CANONICAL_TEACHER_TYPES.map((type) => ({ id: type.id, name: type.name })),
];

const TeachersPayrollFilters = ({
  currentFilters,
  designations,
  departments,
  shifts,
}: TeachersPayrollFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draftFilters, setDraftFilters] = useState<FilterValues>({
    teacherType: currentFilters.teacherType || "All",
    designation: currentFilters.designation || "All",
    department: currentFilters.department || "All",
    shift: currentFilters.shift || "All",
    search: currentFilters.search || "",
  });

  useEffect(() => {
    setDraftFilters({
      teacherType: currentFilters.teacherType || "All",
      designation: currentFilters.designation || "All",
      department: currentFilters.department || "All",
      shift: currentFilters.shift || "All",
      search: currentFilters.search || "",
    });
  }, [currentFilters]);

  const handleFilterChange = useCallback(
    (field: keyof FilterValues, value: string | null) => {
      setDraftFilters((current) => ({
        ...current,
        [field]: value ?? "",
      }));
    },
    [],
  );

  const preservePeriodParams = useCallback(
    (params: URLSearchParams) => {
      const month = searchParams.get("month");
      const year = searchParams.get("year");
      if (month) params.set("month", month);
      if (year) params.set("year", year);
    },
    [searchParams],
  );

  const handleClearFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    preservePeriodParams(newParams);
    router.push(
      newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname,
    );
    setDraftFilters({
      teacherType: "All",
      designation: "All",
      department: "All",
      shift: "All",
      search: "",
    });
  }, [router, pathname, preservePeriodParams]);

  const handleConfirmFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    preservePeriodParams(newParams);

    if (draftFilters.teacherType !== "All") {
      newParams.set("teacherType", draftFilters.teacherType);
    }

    if (draftFilters.designation !== "All") {
      newParams.set("designation", draftFilters.designation);
    }

    if (draftFilters.department !== "All") {
      newParams.set("department", draftFilters.department);
    }

    if (draftFilters.shift !== "All") {
      newParams.set("shift", draftFilters.shift);
    }

    if (draftFilters.search) {
      newParams.set("search", draftFilters.search);
    }

    newParams.delete("page");

    router.push(`${pathname}?${newParams.toString()}`);
  }, [draftFilters, router, pathname, preservePeriodParams]);

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

  const selectedDesignationName =
    draftFilters.designation !== "All"
      ? designations.find((d) => d.id === draftFilters.designation)?.name
      : undefined;

  const selectedDepartmentName =
    draftFilters.department !== "All"
      ? departments.find((d) => d.id === draftFilters.department)?.name
      : undefined;

  const selectedShiftName =
    draftFilters.shift !== "All"
      ? shifts.find((s) => s.id === draftFilters.shift)?.name
      : undefined;

  const selectedTeacherTypeName =
    draftFilters.teacherType !== "All"
      ? TEACHER_TYPES.find((t) => t.id === draftFilters.teacherType)?.name
      : undefined;

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Teacher Type
          </label>
          <Select
            value={draftFilters.teacherType}
            onValueChange={(value) => handleFilterChange("teacherType", value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue placeholder="Teacher Type">
                {selectedTeacherTypeName ?? "All Types"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {TEACHER_TYPES.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.id === "All" ? "All Types" : option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Designation
          </label>
          <Select
            value={draftFilters.designation}
            onValueChange={(value) => handleFilterChange("designation", value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue placeholder="Designation">
                {selectedDesignationName ?? "All Designations"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Designations</SelectItem>
              {designations.map((option) => (
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
            value={draftFilters.department}
            onValueChange={(value) => handleFilterChange("department", value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue placeholder="Department">
                {selectedDepartmentName ?? "All Departments"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Departments</SelectItem>
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
            Shift
          </label>
          <Select
            value={draftFilters.shift}
            onValueChange={(value) => handleFilterChange("shift", value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue placeholder="Shift">
                {selectedShiftName ?? "All Shifts"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Shifts</SelectItem>
              {shifts.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-65">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draftFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, phone, email..."
            className="h-11 rounded-xl border-border/70 bg-background pl-8 pr-4 text-sm shadow-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="h-11 rounded-xl px-4 font-medium w-full sm:w-auto"
            onClick={handleClearFilters}
            type="button"
          >
            <Undo2 className="h-4 w-4" />
            Clear Filter
          </Button>
          <Button
            className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground shadow-sm hover:bg-primary/80 w-full sm:w-auto"
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

export default TeachersPayrollFilters;
