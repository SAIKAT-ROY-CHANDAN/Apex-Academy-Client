"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import {
  ADMINISTRATIVE_POSITIONS,
  ADMINISTRATIVE_POSITION_LABELS,
  TEACHER_TYPES,
} from "../_constants";

type Option = {
  id: string;
  name: string;
};

type TeacherFilterProps = {
  designations: Option[];
  departments: Option[];
  shifts: Option[];
};

const TeacherFilter = ({ designations, departments, shifts }: TeacherFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDesignation = searchParams.get("designationFilter") ?? "";
  const currentDepartment = searchParams.get("departmentFilter") ?? "";
  const currentTeacherType = searchParams.get("teacherTypeFilter") ?? "";
  const currentShift = searchParams.get("shiftFilter") ?? "";
  const currentAdminPosition = searchParams.get("administrativePositionFilter") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const hasActiveFilters = !!(
    currentDesignation ||
    currentDepartment ||
    currentTeacherType ||
    currentShift ||
    currentAdminPosition ||
    currentSearch
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router]
  );

  const clearFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  const selectedDesignationName = currentDesignation
    ? designations.find((d) => d.id === currentDesignation)?.name
    : undefined;

  const selectedDepartmentName = currentDepartment
    ? departments.find((d) => d.id === currentDepartment)?.name
    : undefined;

  const selectedTeacherTypeName = currentTeacherType
    ? TEACHER_TYPES.find((t) => t.id === currentTeacherType)?.name
    : undefined;

  const selectedShiftName = currentShift
    ? shifts.find((s) => s.id === currentShift)?.name
    : undefined;

  const selectedAdminPositionName = currentAdminPosition
    ? ADMINISTRATIVE_POSITION_LABELS[currentAdminPosition]
    : undefined;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="w-full sm:w-64">
          <SearchForm
            defaultValue={currentSearch}
            placeholder="Search teachers..."
          />
        </div>

        {/* Designation Filter */}
        <div className="w-full sm:w-44">
          <Select
            value={currentDesignation}
            onValueChange={(value) =>
              updateFilter("designationFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Designation">
                {selectedDesignationName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Designations</SelectItem>
              {designations.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Department Filter */}
        <div className="w-full sm:w-44">
          <Select
            value={currentDepartment}
            onValueChange={(value) =>
              updateFilter("departmentFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Department">
                {selectedDepartmentName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Departments</SelectItem>
              {departments.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Teacher Type Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={currentTeacherType}
            onValueChange={(value) =>
              updateFilter("teacherTypeFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Teacher Type">
                {selectedTeacherTypeName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {TEACHER_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Administrative Position Filter */}
        <div className="w-full sm:w-48">
          <Select
            value={currentAdminPosition}
            onValueChange={(value) =>
              updateFilter("administrativePositionFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Administrative Position">
                {selectedAdminPositionName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Positions</SelectItem>
              {ADMINISTRATIVE_POSITIONS.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Shift Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={currentShift}
            onValueChange={(value) =>
              updateFilter("shiftFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Shift">
                {selectedShiftName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Shifts</SelectItem>
              {shifts.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeacherFilter;