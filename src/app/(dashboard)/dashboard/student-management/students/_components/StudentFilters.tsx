"use client";

import { useCallback, useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getClassesByDepartmentId } from "@/services/academicClass";
import { getDepartmentByProgramId } from "@/services/department";
import { getPrograms } from "@/services/program";
import type { TStudentFilterValues } from "./student-filters";

type Option = { id: string; label: string };

interface StudentFiltersProps {
  filters: TStudentFilterValues;
  onChange: (next: TStudentFilterValues) => void;
  disabled?: boolean;
}

const toOptions = (items: unknown, keys: string[]): Option[] => {
  const list = Array.isArray(items) ? items : [];
  return list
    .map((item) => {
      const row = item as Record<string, unknown>;
      const id = String(row.id ?? row._id ?? "");
      const label =
        keys
          .map((k) => row[k])
          .find(
            (v): v is string => typeof v === "string" && v.trim().length > 0,
          ) ?? "";
      return { id, label: label.trim() };
    })
    .filter((o) => o.id && o.label);
};

const ALL = "__all__";

const StudentFilters = ({
  filters,
  onChange,
  disabled,
}: StudentFiltersProps) => {
  const [programs, setPrograms] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [classes, setClasses] = useState<Option[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setLoadingPrograms(true);
      try {
        const res = await getPrograms([]);
        if (!cancelled)
          setPrograms(toOptions(res?.data, ["program_name", "name"]));
      } catch {
        if (!cancelled) setPrograms([]);
      } finally {
        if (!cancelled) setLoadingPrograms(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, []);

  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const res = await getDepartmentByProgramId(programId);
      setDepartments(toOptions(res?.data, ["department_name", "name"]));
    } catch {
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchClasses = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setClasses([]);
      return;
    }
    setLoadingClasses(true);
    try {
      const res = await getClassesByDepartmentId(departmentId);
      setClasses(toOptions(res?.data, ["class_name", "name"]));
    } catch {
      setClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  useEffect(() => {
    fetchDepartments(filters.program_id);
  }, [filters.program_id, fetchDepartments]);

  useEffect(() => {
    fetchClasses(filters.department_id);
  }, [filters.department_id, fetchClasses]);

  const programLabel =
    programs.find((p) => p.id === filters.program_id)?.label || "All Programs";
  const deptLabel =
    departments.find((d) => d.id === filters.department_id)?.label ||
    "All Departments";
  const classLabel =
    classes.find((c) => c.id === filters.academic_class_id)?.label ||
    "All Classes / Years";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Program</Label>
        <Select
          value={filters.program_id || ALL}
          onValueChange={(v) =>
            onChange({
              program_id: v === ALL ? "" : (v ?? ""),
              department_id: "",
              academic_class_id: "",
            })
          }
          disabled={disabled || loadingPrograms}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue>
              {loadingPrograms ? "Loading programs..." : programLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Programs</SelectItem>
            {programs.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Department</Label>
        <Select
          value={filters.department_id || ALL}
          onValueChange={(v) =>
            onChange({
              ...filters,
              department_id: v === ALL ? "" : (v ?? ""),
              academic_class_id: "",
            })
          }
          disabled={disabled || !filters.program_id || loadingDepartments}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue>
              {loadingDepartments
                ? "Loading departments..."
                : !filters.program_id
                  ? "Select program first"
                  : departments.length === 0
                    ? "No departments found"
                    : deptLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Departments</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs font-medium">Class / Year</Label>
        <Select
          value={filters.academic_class_id || ALL}
          onValueChange={(v) =>
            onChange({
              ...filters,
              academic_class_id: v === ALL ? "" : (v ?? ""),
            })
          }
          disabled={disabled || !filters.department_id || loadingClasses}
        >
          <SelectTrigger className="h-9 w-full text-sm">
            <SelectValue>
              {loadingClasses
                ? "Loading classes..."
                : !filters.department_id
                  ? "Select department first"
                  : classes.length === 0
                    ? "No classes found"
                    : classLabel}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All Classes / Years</SelectItem>
            {classes.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StudentFilters;
