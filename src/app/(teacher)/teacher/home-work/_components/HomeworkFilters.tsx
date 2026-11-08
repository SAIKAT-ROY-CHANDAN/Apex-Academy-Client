"use client";

import { useState, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { TProgram, TDepartment } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import { RotateCcw, SlidersHorizontal } from "lucide-react";

interface HomeworkFiltersProps {
  mode: string;
  programs?: TProgram[];
  classes?: TAcademicClass[];
}

const HomeworkFilters = ({
  mode,
  programs = [],
  classes = [],
}: HomeworkFiltersProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isUniversity = mode === "COLLEGE_UNIVERSITY";

  const currentProgram = searchParams.get("program_id") ?? "";
  const currentDepartment = searchParams.get("department_id") ?? "";
  const currentClass = searchParams.get("class_id") ?? "";
  const currentSection = searchParams.get("section_id") ?? "";
  const currentSubject = searchParams.get("subject_id") ?? "";
  const currentFromDate = searchParams.get("from_date") ?? "";
  const currentToDate = searchParams.get("to_date") ?? "";

  const [selectedProgram, setSelectedProgram] = useState(currentProgram);
  const [selectedDepartment, setSelectedDepartment] = useState(currentDepartment);
  const [selectedClass, setSelectedClass] = useState(currentClass);
  const [selectedSection, setSelectedSection] = useState(currentSection);
  const [selectedSubject, setSelectedSubject] = useState(currentSubject);
  const [fromDate, setFromDate] = useState(currentFromDate);
  const [toDate, setToDate] = useState(currentToDate);

  // University Mode: Program → Departments → Classes → Sections/Subjects (nested)
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

  // Sections & Subjects are nested inside the selected class
  const sections = useMemo(() => selectedClassObj?.academicSections || [], [selectedClassObj]);
  const subjects = useMemo(() => selectedClassObj?.subjects || [], [selectedClassObj]);

  const hasActiveFilters = !!(
    selectedProgram ||
    selectedDepartment ||
    selectedClass ||
    selectedSection ||
    selectedSubject ||
    fromDate ||
    toDate
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
    setParam("subject_id", selectedSubject);
    setParam("from_date", fromDate);
    setParam("to_date", toDate);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [
    router,
    selectedProgram,
    selectedDepartment,
    selectedClass,
    selectedSection,
    selectedSubject,
    fromDate,
    toDate,
  ]);

  const clearFilters = () => {
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
    setFromDate("");
    setToDate("");
    router.push("?");
  };

  const handleProgramChange = (value: string) => {
    setSelectedProgram(value);
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
  };

  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value);
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
  };

  const handleClassChange = (value: string) => {
    setSelectedClass(value);
    setSelectedSection("");
    setSelectedSubject("");
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">Search</Label>
          <SearchForm placeholder="Search by title/description..." className="h-9" />
        </div>

        {/* Program - University only */}
        {isUniversity && (
          <div className="space-y-2">
            <Label htmlFor="program" className="text-xs font-medium text-slate-700">
              Program
            </Label>
            <Select value={selectedProgram} onValueChange={(value) => handleProgramChange(value ?? "")} items={[{ value: "", label: "All Programs" }, ...programs.map((p) => ({ value: p.id, label: p.program_name }))]}>
              <SelectTrigger id="program" className="h-9 text-sm">
                <SelectValue placeholder="All Programs" />
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
            <Label htmlFor="department" className="text-xs font-medium text-slate-700">
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={(value) => handleDepartmentChange(value ?? "")}
              disabled={!selectedProgram}
              items={[{ value: "", label: "All Departments" }, ...departments.map((d) => ({ value: d.id, label: d.department_name }))]}
            >
              <SelectTrigger id="department" className="h-9 text-sm">
                <SelectValue placeholder={selectedProgram ? "All Departments" : "Select program first"} />
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
            items={[{ value: "", label: "All Classes" }, ...availableClasses.map((cls) => ({ value: cls.id, label: cls.class_name }))]}
          >
            <SelectTrigger id="class" className="h-9 text-sm">
              <SelectValue placeholder={isUniversity && !selectedDepartment ? "Select department first" : "All Classes"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes</SelectItem>
              {availableClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {cls.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section */}
        <div className="space-y-2">
          <Label htmlFor="section" className="text-xs font-medium text-slate-700">
            Section
          </Label>
          <Select
            value={selectedSection}
            onValueChange={(value) => setSelectedSection(value ?? "")}
            disabled={!selectedClass}
            items={[{ value: "", label: "All Sections" }, ...sections.map((s) => ({ value: s.id, label: s.section_name }))]}
          >
            <SelectTrigger id="section" className="h-9 text-sm">
              <SelectValue placeholder={selectedClass ? "All Sections" : "Select class first"} />
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

        {/* Subject */}
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-xs font-medium text-slate-700">
            Course Code
          </Label>
          <Select
            value={selectedSubject}
            onValueChange={(value) => setSelectedSubject(value ?? "")}
            disabled={!selectedClass}
            items={[{ value: "", label: "All Subjects" }, ...subjects.map((s) => ({ value: s.id, label: s.name }))]}
          >
            <SelectTrigger id="subject" className="h-9 text-sm">
              <SelectValue placeholder={selectedClass ? "All Subjects" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Due Date From */}
        <div className="space-y-2">
          <Label htmlFor="from_date" className="text-xs font-medium text-slate-700">
            Due Date From
          </Label>
          <Input
            id="from_date"
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="h-9 text-sm"
          />
        </div>

        {/* Due Date To */}
        <div className="space-y-2">
          <Label htmlFor="to_date" className="text-xs font-medium text-slate-700">
            Due Date To
          </Label>
          <Input
            id="to_date"
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="h-9 text-sm"
          />
        </div>
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

export default HomeworkFilters;