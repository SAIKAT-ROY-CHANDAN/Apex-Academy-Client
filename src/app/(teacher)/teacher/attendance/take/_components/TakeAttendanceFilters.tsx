"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import type {
  TDepartment,
  TProgram,
} from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

const GROUPS = ["SCIENCE", "COMMERCE", "HUMANITIES"] as const;

// Always render the human-readable label in the closed trigger, never the raw id.
// Base UI's Select.Value prints the raw `value` when the matching option isn't
// mounted yet (e.g. on page reload / deep-link), so we resolve the label ourselves.
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
      className={`flex flex-1 items-center gap-1.5 text-left text-sm line-clamp-1 ${
        label ? "text-foreground" : "text-muted-foreground"
      }`}
    >
      {label || placeholder}
    </span>
  );
}

interface TakeAttendanceFiltersProps {
  mode: string;
  programs?: TProgram[];
  classes?: TAcademicClass[];
}

const TakeAttendanceFilters = ({
  mode,
  programs = [],
  classes = [],
}: TakeAttendanceFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUniversity = mode === "COLLEGE_UNIVERSITY";

  const currentProgram = searchParams.get("program_id") ?? "";
  const currentDepartment = searchParams.get("department_id") ?? "";
  const currentClass = searchParams.get("class_id") ?? "";
  const currentSection = searchParams.get("section_id") ?? "";
  const currentGroup = searchParams.get("group") ?? "";
  const currentSubject = searchParams.get("subject_id") ?? "";

  const [selectedProgram, setSelectedProgram] = useState(currentProgram);
  const [selectedDepartment, setSelectedDepartment] =
    useState(currentDepartment);
  const [selectedClass, setSelectedClass] = useState(currentClass);
  const [selectedSection, setSelectedSection] = useState(currentSection);
  const [selectedGroup, setSelectedGroup] = useState(currentGroup);
  const [selectedSubject, setSelectedSubject] = useState(currentSubject);

  // University Mode: Program → Departments → Classes (nested)
  const selectedProgramObj = useMemo(() => {
    if (!isUniversity || !selectedProgram) return null;
    return programs.find((p) => p.id === selectedProgram) || null;
  }, [isUniversity, programs, selectedProgram]);

  const departments = useMemo<TDepartment[]>(() => {
    if (!isUniversity) return [];
    return selectedProgramObj?.departments || [];
  }, [isUniversity, selectedProgramObj]);

  const selectedDepartmentObj = useMemo(() => {
    if (!selectedDepartment) return null;
    return departments.find((d) => d.id === selectedDepartment) || null;
  }, [departments, selectedDepartment]);

  // Classes for university come from selected department's academicClasses
  const universityClasses = useMemo<TAcademicClass[]>(() => {
    return selectedDepartmentObj?.academicClasses || [];
  }, [selectedDepartmentObj]);

  // Classes for school come from the classes array (flat list)
  const schoolClasses = useMemo<TAcademicClass[]>(() => {
    return classes;
  }, [classes]);

  const availableClasses = isUniversity ? universityClasses : schoolClasses;

  const selectedClassObj = useMemo(() => {
    if (!selectedClass) return null;
    return availableClasses.find((c) => c.id === selectedClass) || null;
  }, [availableClasses, selectedClass]);

  // Sections are nested inside the selected class (optional)
  const sections = useMemo(
    () => selectedClassObj?.academicSections || [],
    [selectedClassObj],
  );

  const hasActiveFilters = !!(
    selectedProgram ||
    selectedDepartment ||
    selectedClass ||
    selectedSection ||
    selectedGroup ||
    selectedSubject
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
    setParam("group", selectedGroup);
    setParam("subject_id", selectedSubject);
    router.push(`?${params.toString()}`);
  }, [
    router,
    selectedProgram,
    selectedDepartment,
    selectedClass,
    selectedSection,
    selectedGroup,
    selectedSubject,
  ]);

  const clearFilters = () => {
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedGroup("");
    setSelectedSubject("");
    router.push("?");
  };

  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedGroup("");
    setSelectedSubject("");
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedClass("");
    setSelectedSection("");
    setSelectedGroup("");
    setSelectedSubject("");
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedSection("");
    setSelectedSubject("");
    const cls = availableClasses.find((c) => c.id === value);
    setSelectedGroup(cls?.group ?? "");
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Program - University only */}
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
              onValueChange={(value) => handleProgramChange(value ?? "")}
            >
              <SelectTrigger id="program" className="h-9 text-sm">
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
          <div className="space-y-2">
            <Label
              htmlFor="department"
              className="text-xs font-medium text-slate-700"
            >
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={(value) => handleDepartmentChange(value ?? "")}
              disabled={!selectedProgram}
            >
              <SelectTrigger id="department" className="h-9 text-sm">
                <DisplayValue
                  value={selectedDepartment}
                  options={departments.map((d) => ({
                    value: d.id,
                    label: d.department_name,
                  }))}
                  placeholder={
                    selectedProgram ? "All Departments" : "Select program first"
                  }
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

        {/* Class */}
        <div className="space-y-2">
          <Label htmlFor="class" className="text-xs font-medium text-slate-700">
            Class/Year
          </Label>
          <Select
            value={selectedClass}
            onValueChange={(value) => handleClassChange(value ?? "")}
            disabled={isUniversity && !selectedDepartment}
          >
            <SelectTrigger id="class" className="h-9 text-sm">
              <DisplayValue
                value={selectedClass}
                options={availableClasses.map((cls) => ({
                  value: cls.id,
                  label: cls.class_name,
                }))}
                placeholder={
                  isUniversity && !selectedDepartment
                    ? "Select department first"
                    : "Select a class/year"
                }
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select a class/year</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section - optional, only if the selected class has sections */}
        {sections.length > 0 && (
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
                <DisplayValue
                  value={selectedSection}
                  options={sections.map((section) => ({
                    value: section.id,
                    label: section.section_name,
                  }))}
                  placeholder={
                    selectedClass ? "All Sections" : "Select class first"
                  }
                />
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
        )}

        {/* Group - School only, shown when the selected class belongs to a group */}
        {!isUniversity && selectedClassObj?.group && (
          <div className="space-y-2">
            <Label
              htmlFor="group"
              className="text-xs font-medium text-slate-700"
            >
              Group
            </Label>
            <Select
              value={selectedGroup}
              onValueChange={(value) => setSelectedGroup(value ?? "")}
              disabled={!selectedClass}
            >
              <SelectTrigger id="group" className="h-9 text-sm">
                <DisplayValue
                  value={selectedGroup}
                  options={GROUPS.map((g) => ({ value: g, label: g }))}
                  placeholder={
                    selectedClass ? "Select group" : "Select class first"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Groups</SelectItem>
                {GROUPS.map((g) => (
                  <SelectItem key={g} value={g}>
                    {g}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Subject - University only, shown when the selected class has subjects */}
        {isUniversity &&
          selectedClassObj?.subjects &&
          selectedClassObj.subjects.length > 0 && (
            <div className="space-y-2">
              <Label
                htmlFor="subject"
                className="text-xs font-medium text-slate-700"
              >
                Course Code
              </Label>
              <Select
                value={selectedSubject}
                onValueChange={(value) => setSelectedSubject(value ?? "")}
                disabled={!selectedClass}
              >
                <SelectTrigger id="subject" className="h-9 text-sm">
                  <DisplayValue
                    value={selectedSubject}
                    options={selectedClassObj.subjects.map((subject) => ({
                      value: subject.id,
                      label: subject.name,
                    }))}
                    placeholder={
                      selectedClass ? "Select course code" : "Select class first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {selectedClassObj.subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleFilter} className="h-9 px-4 text-sm font-medium">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
          Confirm
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

export default TakeAttendanceFilters;
