"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type {
  TDepartment,
  TProgram,
} from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { AcademicSession } from "@/app/(dashboard)/dashboard/settings/system/session-config/_components/types/academic-session";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PromotionFiltersProps {
  mode: string;
  sessions?: AcademicSession[];
  programs?: TProgram[];
  classes?: TAcademicClass[];
  batches?: Array<{ id: string; batch_name: string }>;
  shifts?: Array<{ id: string; name: string }>;
}

const PromotionFilters = ({
  mode,
  sessions = [],
  programs = [],
  classes = [],
  batches = [],
  shifts = [],
}: PromotionFiltersProps) => {
  const router = useRouter();
  const currentParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : new URLSearchParams();
  const isUniversity = mode === "COLLEGE_UNIVERSITY";

  // Hierarchy: program → department → class → section
  const [selectedProgram, setSelectedProgram] = useState(
    currentParams.get("program_id") ?? "",
  );
  const [selectedDepartment, setSelectedDepartment] = useState(
    currentParams.get("department_id") ?? "",
  );
  const [selectedClass, setSelectedClass] = useState(
    currentParams.get("class_id") ?? "",
  );
  const [selectedSection, setSelectedSection] = useState(
    currentParams.get("section_id") ?? "",
  );

  // Others: session / batch / shift
  const [selectedSession, setSelectedSession] = useState(
    currentParams.get("session_id") ?? "",
  );
  const [selectedBatch, setSelectedBatch] = useState(
    currentParams.get("batch_id") ?? "",
  );
  const [selectedShift, setSelectedShift] = useState(
    currentParams.get("shift_id") ?? "",
  );

  // Nested lookups: departments live inside the selected program,
  // classes live inside the selected department.
  const selectedProgramObj = useMemo(() => {
    if (!selectedProgram) return null;
    return programs.find((p) => p.id === selectedProgram) || null;
  }, [programs, selectedProgram]);

  const departments = useMemo<TDepartment[]>(
    () => selectedProgramObj?.departments || [],
    [selectedProgramObj],
  );

  const selectedDepartmentObj = useMemo(() => {
    if (!selectedDepartment) return null;
    return departments.find((d) => d.id === selectedDepartment) || null;
  }, [departments, selectedDepartment]);

  const hierarchyClasses = useMemo<TAcademicClass[]>(
    () => selectedDepartmentObj?.academicClasses || [],
    [selectedDepartmentObj],
  );

  // SCHOOL mode has no programs — fall back to the flat class list.
  const availableClasses = isUniversity ? hierarchyClasses : classes;

  const selectedClassObj = useMemo(() => {
    if (!selectedClass) return null;
    return availableClasses.find((c) => c.id === selectedClass) || null;
  }, [availableClasses, selectedClass]);

  const sections = useMemo(
    () => selectedClassObj?.academicSections || [],
    [selectedClassObj],
  );

  const hasActiveFilters = !!(
    selectedProgram ||
    selectedDepartment ||
    selectedClass ||
    selectedSection ||
    selectedSession ||
    selectedBatch ||
    selectedShift ||
    currentParams.get("search")
  );

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const setParam = (key: string, value: string) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };
    setParam("program_id", selectedProgram);
    setParam("department_id", selectedDepartment);
    setParam("class_id", selectedClass);
    setParam("section_id", selectedSection);
    setParam("session_id", selectedSession);
    setParam("batch_id", selectedBatch);
    setParam("shift_id", selectedShift);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [
    router,
    selectedProgram,
    selectedDepartment,
    selectedClass,
    selectedSection,
    selectedSession,
    selectedBatch,
    selectedShift,
  ]);

  const clearFilters = () => {
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSession("");
    setSelectedBatch("");
    setSelectedShift("");
    router.push("?");
  };

  const resetBelow = (level: "program" | "department" | "class") => {
    if (level === "program") {
      setSelectedDepartment("");
      setSelectedClass("");
      setSelectedSection("");
    } else if (level === "department") {
      setSelectedClass("");
      setSelectedSection("");
    } else {
      setSelectedSection("");
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">
          Find Students to Promote
        </h3>
      </div>

      {/* Hierarchy: program → department → class → section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isUniversity && (
          <div className="space-y-2">
            <Label
              htmlFor="program"
              className="text-xs font-medium text-slate-700"
            >
              Program
            </Label>
            <Select
              value={selectedProgram}
              onValueChange={(value) => {
                resetBelow("program");
                setSelectedProgram(value ?? "");
              }}
            >
              <SelectTrigger id="program" className="h-9 text-sm">
                <SelectValue>
                  {selectedProgram
                    ? programs.find((p) => p.id === selectedProgram)
                        ?.program_name || "All Programs"
                    : "All Programs"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.program_name}
                    {p.departments?.length
                      ? ` (${p.departments.length} dept.)`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isUniversity && (
          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="text-xs font-medium text-slate-700"
            >
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={(value) => {
                resetBelow("department");
                setSelectedDepartment(value ?? "");
              }}
              disabled={!selectedProgram}
            >
              <SelectTrigger id="department" className="h-9 text-sm">
                <SelectValue>
                  {selectedDepartment
                    ? departments.find((d) => d.id === selectedDepartment)
                        ?.department_name ||
                      (selectedProgram
                        ? "All Departments"
                        : "Select program first")
                    : selectedProgram
                      ? "All Departments"
                      : "Select program first"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.department_name}
                    {d.academicClasses?.length
                      ? ` (${d.academicClasses.length} classes)`
                      : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="class" className="text-xs font-medium text-slate-700">
            Class/Year
          </Label>
          <Select
            value={selectedClass}
            onValueChange={(value) => {
              resetBelow("class");
              setSelectedClass(value ?? "");
            }}
            disabled={isUniversity && !selectedDepartment}
          >
            <SelectTrigger id="class" className="h-9 text-sm">
              <SelectValue>
                {selectedClass
                  ? availableClasses.find((c) => c.id === selectedClass)
                      ?.class_name || "All Classes/Year"
                  : isUniversity && !selectedDepartment
                    ? "Select department first"
                    : "All Classes/Year"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes/Years</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="section"
            className="text-xs font-medium text-slate-700"
          >
            Section
          </Label>
          <Select
            value={selectedSection}
            onValueChange={(value) => setSelectedSection(value ?? "")}
            disabled={!selectedClass}
          >
            <SelectTrigger id="section" className="h-9 text-sm">
              <SelectValue>
                {selectedSection
                  ? sections.find((s) => s.id === selectedSection)
                      ?.section_name || "All Sections"
                  : selectedClass
                    ? "All Sections"
                    : "Select class/year first"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sections</SelectItem>
              {sections.map((section) => (
                <SelectItem key={section.id} value={section.id}>
                  {section.section_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Others: session / batch / shift / search */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label
            htmlFor="session"
            className="text-xs font-medium text-slate-700"
          >
            Current Session
          </Label>
          <Select
            value={selectedSession}
            onValueChange={(value) => setSelectedSession(value ?? "")}
          >
            <SelectTrigger id="session" className="h-9 text-sm">
              <SelectValue>
                {selectedSession
                  ? sessions.find((s) => s.id === selectedSession)
                      ?.session_name || "All Sessions"
                  : "All Sessions"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sessions</SelectItem>
              {sessions.map((session) => (
                <SelectItem key={session.id} value={session.id}>
                  {session.session_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="batch" className="text-xs font-medium text-slate-700">
            Batch
          </Label>
          <Select
            value={selectedBatch}
            onValueChange={(value) => setSelectedBatch(value ?? "")}
          >
            <SelectTrigger id="batch" className="h-9 text-sm">
              <SelectValue>
                {selectedBatch
                  ? batches.find((b) => b.id === selectedBatch)?.batch_name ||
                    "All Batches"
                  : "All Batches"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Batches</SelectItem>
              {batches.map((batch) => (
                <SelectItem key={batch.id} value={batch.id}>
                  {batch.batch_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="shift" className="text-xs font-medium text-slate-700">
            Shift
          </Label>
          <Select
            value={selectedShift}
            onValueChange={(value) => setSelectedShift(value ?? "")}
          >
            <SelectTrigger id="shift" className="h-9 text-sm">
              <SelectValue>
                {selectedShift
                  ? shifts.find((s) => s.id === selectedShift)?.name ||
                    "All Shifts"
                  : "All Shifts"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Shifts</SelectItem>
              {shifts.map((shift) => (
                <SelectItem key={shift.id} value={shift.id}>
                  {shift.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="search"
            className="text-xs font-medium text-slate-700"
          >
            Search
          </Label>
          <Input
            id="search"
            placeholder="Search by roll / registration..."
            defaultValue={currentParams.get("search") ?? ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const params = new URLSearchParams(window.location.search);
                const value = (e.target as HTMLInputElement).value.trim();
                if (value) {
                  params.set("search", value);
                } else {
                  params.delete("search");
                }
                params.set("page", "1");
                router.push(`?${params.toString()}`);
              }
            }}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleFilter} className="h-9 px-4 text-sm font-medium">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
          Find Students
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="h-9 px-4 text-sm font-medium"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Clear Filter
          </Button>
        )}
      </div>
    </div>
  );
};

export default PromotionFilters;
