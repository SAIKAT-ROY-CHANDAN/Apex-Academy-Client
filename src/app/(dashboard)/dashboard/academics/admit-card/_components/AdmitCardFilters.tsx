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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TAdmitExam } from "./types";

interface AdmitCardFiltersProps {
  mode: string;
  sessions?: AcademicSession[];
  programs?: TProgram[];
  classes?: TAcademicClass[];
  exams?: TAdmitExam[];
}

const getExamYear = (exam: TAdmitExam): string => {
  const scheduleYear = exam.examSchedules?.find(
    (s) => s.examTakenYear != null,
  )?.examTakenYear;
  if (scheduleYear != null) return String(scheduleYear);
  if (exam.exam_date) {
    const d = new Date(exam.exam_date);
    if (!Number.isNaN(d.getTime())) return String(d.getFullYear());
  }
  return "";
};

const AdmitCardFilters = ({
  mode,
  sessions = [],
  programs = [],
  classes = [],
  exams = [],
}: AdmitCardFiltersProps) => {
  const router = useRouter();
  const currentParams = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  const isUniversity = mode === "COLLEGE_UNIVERSITY";

  const initialExamId = currentParams.get("exam_id") ?? "";
  const initialExam = exams.find((e) => e.id === initialExamId);

  const [selectedSession, setSelectedSession] = useState(
    currentParams.get("session_id") ?? "",
  );
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
  const [selectedExamType, setSelectedExamType] = useState(
    currentParams.get("exam_type") ?? initialExam?.exam_name ?? "",
  );
  const [selectedExamYear, setSelectedExamYear] = useState(
    currentParams.get("exam_year") ??
      (initialExam ? getExamYear(initialExam) : ""),
  );

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

  const universityClasses = useMemo<TAcademicClass[]>(
    () => selectedDepartmentObj?.academicClasses || [],
    [selectedDepartmentObj],
  );

  const availableClasses = isUniversity ? universityClasses : classes;

  const selectedClassObj = useMemo(() => {
    if (!selectedClass) return null;
    return availableClasses.find((c) => c.id === selectedClass) || null;
  }, [availableClasses, selectedClass]);

  const sections = useMemo(
    () => selectedClassObj?.academicSections || [],
    [selectedClassObj],
  );

  // Exams cascade from the selected class
  const classExams = useMemo(() => {
    if (!selectedClass) return [];
    return exams.filter((exam) => exam.academic_class_id === selectedClass);
  }, [exams, selectedClass]);

  const availableExamTypes = useMemo(() => {
    const types = new Set<string>();
    const examsToScan = selectedExamYear
      ? classExams.filter((e) => getExamYear(e) === selectedExamYear)
      : classExams;
    for (const e of examsToScan) {
      if (e.exam_name) types.add(e.exam_name);
    }
    return Array.from(types).sort((a, b) => a.localeCompare(b));
  }, [classExams, selectedExamYear]);

  const availableExamYears = useMemo(() => {
    const years = new Set<string>();
    const examsToScan = selectedExamType
      ? classExams.filter((e) => e.exam_name === selectedExamType)
      : classExams;
    for (const e of examsToScan) {
      const yr = getExamYear(e);
      if (yr) years.add(yr);
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a));
  }, [classExams, selectedExamType]);

  const matchedExam = useMemo(() => {
    if (!selectedClass || (!selectedExamType && !selectedExamYear)) return null;
    const candidates = classExams.filter((e) => {
      const matchesType = !selectedExamType || e.exam_name === selectedExamType;
      const matchesYear =
        !selectedExamYear || getExamYear(e) === selectedExamYear;
      return matchesType && matchesYear;
    });
    if (candidates.length === 1) return candidates[0];
    if (selectedExamType && selectedExamYear && candidates.length > 0) {
      return candidates[0];
    }
    return null;
  }, [classExams, selectedClass, selectedExamType, selectedExamYear]);

  const hasActiveFilters = () =>
    !!(
      selectedSession ||
      selectedProgram ||
      selectedDepartment ||
      selectedClass ||
      selectedSection ||
      selectedExamType ||
      selectedExamYear
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
    setParam("session_id", selectedSession);
    setParam("program_id", selectedProgram);
    setParam("department_id", selectedDepartment);
    setParam("class_id", selectedClass);
    setParam("section_id", selectedSection);
    setParam("exam_type", selectedExamType);
    setParam("exam_year", selectedExamYear);

    if (matchedExam) {
      setParam("exam_id", matchedExam.id);
    } else {
      params.delete("exam_id");
    }

    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [
    router,
    selectedSession,
    selectedProgram,
    selectedDepartment,
    selectedClass,
    selectedSection,
    selectedExamType,
    selectedExamYear,
    matchedExam,
  ]);

  const clearFilters = () => {
    setSelectedSession("");
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedExamType("");
    setSelectedExamYear("");
    router.push("?");
  };

  const resetDependentFilters = (level: "program" | "department" | "class") => {
    if (level === "program") {
      setSelectedProgram("");
      setSelectedDepartment("");
      setSelectedClass("");
      setSelectedSection("");
      setSelectedExamType("");
      setSelectedExamYear("");
    } else if (level === "department") {
      setSelectedDepartment("");
      setSelectedClass("");
      setSelectedSection("");
      setSelectedExamType("");
      setSelectedExamYear("");
    } else {
      setSelectedSection("");
      setSelectedExamType("");
      setSelectedExamYear("");
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div
        className={
          isUniversity
            ? "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-4"
            : "grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {/* Session */}
        <div className="space-y-1.5">
          <Label
            htmlFor="session"
            className="text-xs font-medium text-slate-700"
          >
            Academic Session
          </Label>
          <Select
            value={selectedSession}
            onValueChange={(value) => setSelectedSession(value ?? "")}
          >
            <SelectTrigger id="session" className="h-9 w-full text-sm">
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

        {/* Program - University only */}
        {isUniversity && (
          <div className="space-y-1.5">
            <Label
              htmlFor="program"
              className="text-xs font-medium text-slate-700"
            >
              Program
            </Label>
            <Select
              value={selectedProgram}
              onValueChange={(value) => {
                resetDependentFilters("program");
                setSelectedProgram(value ?? "");
              }}
            >
              <SelectTrigger id="program" className="h-9 w-full text-sm">
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
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Department - University only */}
        {isUniversity && (
          <div className="space-y-1.5">
            <Label
              htmlFor="department"
              className="text-xs font-medium text-slate-700"
            >
              Department
            </Label>
            <Select
              value={selectedDepartment}
              onValueChange={(value) => {
                resetDependentFilters("department");
                setSelectedDepartment(value ?? "");
              }}
              disabled={!selectedProgram}
            >
              <SelectTrigger id="department" className="h-9 w-full text-sm">
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
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Class */}
        <div className="space-y-1.5">
          <Label htmlFor="class" className="text-xs font-medium text-slate-700">
            Class/Year
          </Label>
          <Select
            value={selectedClass}
            onValueChange={(value) => {
              resetDependentFilters("class");
              setSelectedClass(value ?? "");
            }}
            disabled={isUniversity && !selectedDepartment}
          >
            <SelectTrigger id="class" className="h-9 w-full text-sm">
              <SelectValue>
                {selectedClass
                  ? availableClasses.find((c) => c.id === selectedClass)
                      ?.class_name || "All Classes/Years"
                  : isUniversity && !selectedDepartment
                    ? "Select department first"
                    : "All Classes/Years"}
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

        {/* Exam Type - cascades from class */}
        <div className="space-y-1.5">
          <Label htmlFor="exam-type" className="text-xs font-medium text-slate-700">
            Exam Type<span className="ml-0.5 text-red-500">*</span>
          </Label>
          <Select
            value={selectedExamType}
            onValueChange={(value) => {
              const nextType = value ?? "";
              setSelectedExamType(nextType);
              if (nextType && !selectedExamYear) {
                const matching = classExams.filter((e) => e.exam_name === nextType);
                const years = Array.from(
                  new Set(matching.map((e) => getExamYear(e)).filter(Boolean)),
                );
                if (years.length === 1) {
                  setSelectedExamYear(years[0]);
                }
              }
            }}
            disabled={!selectedClass || classExams.length === 0}
          >
            <SelectTrigger id="exam-type" className="h-9 w-full text-sm">
              <SelectValue>
                {selectedExamType
                  ? selectedExamType
                  : !selectedClass
                    ? "Select class first"
                    : classExams.length === 0
                      ? "No exams found"
                      : "All Exam Types"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Exam Types</SelectItem>
              {availableExamTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Exam Year - cascades from class */}
        <div className="space-y-1.5">
          <Label htmlFor="exam-year" className="text-xs font-medium text-slate-700">
            Exam Year
          </Label>
          <Select
            value={selectedExamYear}
            onValueChange={(value) => {
              const nextYear = value ?? "";
              setSelectedExamYear(nextYear);
              if (nextYear && !selectedExamType) {
                const matching = classExams.filter(
                  (e) => getExamYear(e) === nextYear,
                );
                const types = Array.from(
                  new Set(matching.map((e) => e.exam_name).filter(Boolean)),
                );
                if (types.length === 1) {
                  setSelectedExamType(types[0]);
                }
              }
            }}
            disabled={!selectedClass || classExams.length === 0}
          >
            <SelectTrigger id="exam-year" className="h-9 w-full text-sm">
              <SelectValue>
                {selectedExamYear
                  ? selectedExamYear
                  : !selectedClass
                    ? "Select class first"
                    : classExams.length === 0
                      ? "No exams found"
                      : "All Years"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {availableExamYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Section */}
        <div className="space-y-1.5">
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
            <SelectTrigger id="section" className="h-9 w-full text-sm">
              <SelectValue>
                {selectedSection
                  ? sections.find((s) => s.id === selectedSection)
                      ?.section_name || "All Sections"
                  : selectedClass
                    ? "All Sections"
                    : "Select class first"}
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

        {/* Actions */}
        <div className="flex flex-col justify-end space-y-1.5">
          <span className="hidden select-none text-xs font-medium text-transparent sm:block">
            &nbsp;
          </span>
          <div className="flex items-center gap-2">
            <Button onClick={handleFilter} className="h-9 flex-1 text-sm font-medium">
              <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
              Confirm
            </Button>
            {hasActiveFilters() && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-9 px-3 text-sm font-medium"
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmitCardFilters;
