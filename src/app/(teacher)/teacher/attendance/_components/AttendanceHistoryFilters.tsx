"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  TDepartment,
  TProgram,
} from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

// Always render the human-readable label in the closed trigger, never the raw id.
function DisplayValue({
  value,
  options,
  placeholder,
}: {
  value: string;
  options: { value: string; label: string }[];
  placeholder: string;
}) {
  const label = options.find((o) => o.value === value)?.label ?? "";
  return (
    <span
      className={`flex flex-1 items-center gap-1.5 text-left text-sm truncate ${
        label ? "text-foreground font-normal" : "text-muted-foreground"
      }`}
    >
      {label || placeholder}
    </span>
  );
}

interface AttendanceHistoryFiltersProps {
  mode: string;
  programs?: TProgram[];
  classes?: TAcademicClass[];
}

const AttendanceHistoryFilters = ({
  mode,
  programs = [],
  classes = [],
}: AttendanceHistoryFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUniversity = mode === "COLLEGE_UNIVERSITY" || programs.length > 0;

  const currentProgram = searchParams.get("program_id") ?? "";
  const currentDepartment = searchParams.get("department_id") ?? "";
  const currentClass =
    searchParams.get("academic_class_id") ??
    searchParams.get("class_id") ??
    "";
  const currentFromDate = searchParams.get("from_date") ?? "";
  const currentToDate = searchParams.get("to_date") ?? "";

  const [selectedProgram, setSelectedProgram] = useState(currentProgram);
  const [selectedDepartment, setSelectedDepartment] =
    useState(currentDepartment);
  const [selectedClass, setSelectedClass] = useState(currentClass);
  const [fromDate, setFromDate] = useState(currentFromDate);
  const [toDate, setToDate] = useState(currentToDate);

  useEffect(() => {
    setSelectedProgram(searchParams.get("program_id") ?? "");
    setSelectedDepartment(searchParams.get("department_id") ?? "");
    setSelectedClass(
      searchParams.get("academic_class_id") ??
        searchParams.get("class_id") ??
        "",
    );
    setFromDate(searchParams.get("from_date") ?? "");
    setToDate(searchParams.get("to_date") ?? "");
  }, [searchParams]);

  // University Mode: Program → Departments → Classes (nested)
  const selectedProgramObj = useMemo(() => {
    if (!isUniversity || !selectedProgram) return null;
    return programs.find((p) => p.id === selectedProgram) || null;
  }, [isUniversity, programs, selectedProgram]);

  const departments = useMemo<TDepartment[]>(() => {
    if (!isUniversity) return [];
    if (selectedProgramObj) return selectedProgramObj.departments || [];
    return programs.flatMap((p) => p.departments || []);
  }, [isUniversity, selectedProgramObj, programs]);

  const selectedDepartmentObj = useMemo(() => {
    if (!selectedDepartment) return null;
    return departments.find((d) => d.id === selectedDepartment) || null;
  }, [departments, selectedDepartment]);

  // Classes for university come from selected department's academicClasses
  const universityClasses = useMemo<TAcademicClass[]>(() => {
    if (selectedDepartmentObj?.academicClasses) {
      return selectedDepartmentObj.academicClasses;
    }
    if (selectedProgramObj) {
      return (selectedProgramObj.departments || []).flatMap(
        (d) => d.academicClasses || [],
      );
    }
    return classes;
  }, [selectedDepartmentObj, selectedProgramObj, classes]);

  const schoolClasses = useMemo<TAcademicClass[]>(() => {
    return classes;
  }, [classes]);

  const availableClasses = isUniversity ? universityClasses : schoolClasses;

  const hasActiveFilters = Boolean(
    selectedProgram ||
      selectedDepartment ||
      selectedClass ||
      fromDate ||
      toDate,
  );

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams();
    if (selectedProgram) params.set("program_id", selectedProgram);
    if (selectedDepartment) params.set("department_id", selectedDepartment);
    if (selectedClass) params.set("academic_class_id", selectedClass);
    if (fromDate) params.set("from_date", fromDate);
    if (toDate) params.set("to_date", toDate);
    router.push(
      `/teacher/attendance${params.toString() ? `?${params.toString()}` : ""}`,
    );
  }, [
    router,
    selectedProgram,
    selectedDepartment,
    selectedClass,
    fromDate,
    toDate,
  ]);

  const clearFilters = () => {
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setFromDate("");
    setToDate("");
    router.push("/teacher/attendance");
  };

  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    setSelectedDepartment("");
    setSelectedClass("");
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedClass("");
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
  };

  return (
    <div className="space-y-4 rounded-xl border border-border/60 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filter Attendance</h3>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          isUniversity ? "lg:grid-cols-3" : "lg:grid-cols-4"
        }`}
      >
        {/* Program - University only */}
        {isUniversity && (
          <div className="space-y-1.5 min-w-0">
            <Label
              htmlFor="program"
              className="text-xs font-medium text-slate-700"
            >
              Program
            </Label>
            <Select
              value={selectedProgram}
              onValueChange={(value) => handleProgramChange(value ?? "")}
            >
              <SelectTrigger id="program" className="h-9 w-full text-sm">
                <DisplayValue
                  value={selectedProgram}
                  options={programs.map((p) => ({
                    value: p.id,
                    label: p.program_name,
                  }))}
                  placeholder="All Programs"
                />
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
          </div>
        )}

        {/* Department - University only */}
        {isUniversity && (
          <div className="space-y-1.5 min-w-0">
            <Label
              htmlFor="department"
              className="text-xs font-medium text-slate-700"
            >
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={(value) => handleDepartmentChange(value ?? "")}
              disabled={!departments.length}
            >
              <SelectTrigger id="department" className="h-9 w-full text-sm">
                <DisplayValue
                  value={selectedDepartment}
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.department_name,
                  }))}
                  placeholder="All Departments"
                />
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
          </div>
        )}

        {/* Class/Year */}
        <div className="space-y-1.5 min-w-0">
          <Label htmlFor="class" className="text-xs font-medium text-slate-700">
            Class/Year
          </Label>
          <Select
            value={selectedClass}
            onValueChange={(value) => handleClassChange(value ?? "")}
          >
            <SelectTrigger id="class" className="h-9 w-full text-sm">
              <DisplayValue
                value={selectedClass}
                options={availableClasses.map((c) => ({
                  value: c.id,
                  label: c.class_name || (c as any).name,
                }))}
                placeholder={
                  availableClasses.length
                    ? "All classes/years"
                    : "No classes/years"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All classes/years</SelectItem>
              {availableClasses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.class_name || (c as any).name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* From Date */}
        <div className="space-y-1.5 min-w-0">
          <Label
            htmlFor="from-date"
            className="text-xs font-medium text-slate-700"
          >
            From Date
          </Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 w-full text-sm"
          />
        </div>

        {/* To Date */}
        <div className="space-y-1.5 min-w-0">
          <Label
            htmlFor="to-date"
            className="text-xs font-medium text-slate-700"
          >
            To Date
          </Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 w-full text-sm"
          />
        </div>

        {/* Actions Button Cell */}
        <div className="flex items-end gap-2 pt-1 sm:pt-0 min-w-0">
          <Button
            onClick={handleFilter}
            className="h-9 flex-1 text-sm font-medium shadow-sm transition-all"
          >
            <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
            Apply Filter
          </Button>
          {hasActiveFilters && (
            <Button
              variant="outline"
              onClick={clearFilters}
              className="h-9 px-3 text-sm font-medium transition-all"
              title="Clear all filters"
            >
              <RotateCcw className="h-3.5 w-3.5 sm:mr-1.5" />
              <span className="hidden sm:inline">Clear</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendanceHistoryFilters;
