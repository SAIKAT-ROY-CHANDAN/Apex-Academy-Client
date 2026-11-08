"use client";

import { Filter, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TDepartmentOption, TProgramOption } from "./types/result";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getSubjectDetails } from "@/services/subject";
import { getExamConfigs } from "@/services/examConfig";

export interface ResultsFilterValues {
  programId: string | null;
  departmentId: string | null;
  year: string | null;
  subjectId: string | null;
  examId: string | null;
}

interface ResultsFiltersProps {
  programs: TProgramOption[];
  departments: TDepartmentOption[];
  loading?: boolean;
  onFilterChange: (filters: ResultsFilterValues) => void;
}

type AcademicClassOption = {
  id: string;
  program_id: string | null;
  department_id: string | null;
  year_level: number | null;
  class_level: number | null;
};
type SubjectOption = {
  id: string;
  name: string;
  academicClass?: { program_id?: string | null; department_id?: string | null; year_level?: number | null; class_level?: number | null } | null;
};
type ExamOption = { id: string; exam_name: string };

const ResultsFilters = ({
  programs,
  departments,
  loading = false,
  onFilterChange,
}: ResultsFiltersProps) => {
  const [selectedProgram, setSelectedProgram] = useState<string | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedExam, setSelectedExam] = useState<string | null>(null);

  const [academicClasses, setAcademicClasses] = useState<AcademicClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [exams, setExams] = useState<ExamOption[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);

  useEffect(() => {
    const fetchExtra = async () => {
      try {
        const [classesRes, subjectsRes, examsRes] = await Promise.all([
          getAcademicClassDetails([{ label: "limit", value: "100" }]),
          getSubjectDetails([{ label: "limit", value: "100" }]),
          getExamConfigs(),
        ]);
        const classRaw = (classesRes as any)?.data ?? [];
        setAcademicClasses(Array.isArray(classRaw) ? (classRaw as AcademicClassOption[]) : []);
        setSubjects(((subjectsRes as any)?.data ?? []) as SubjectOption[]);
        setExams(((examsRes as any)?.data ?? []) as ExamOption[]);
      } catch (e) {
        console.error("Failed to load filter extra data", e);
      } finally {
        setInternalLoading(false);
      }
    };
    fetchExtra();
  }, []);

  const isLoading = loading || internalLoading;

  const filteredDepartments = useMemo(
    () =>
      selectedProgram
        ? departments.filter((d) => d.program_id === selectedProgram)
        : departments,
    [departments, selectedProgram]
  );

  const levelYearOptions = useMemo(() => {
    let pool = academicClasses;
    if (selectedProgram) pool = pool.filter((c) => c.program_id === selectedProgram);
    if (selectedDepartment) pool = pool.filter((c) => c.department_id === selectedDepartment);
    const distinct = new Map<number, string>();
    for (const cls of pool) {
      const lvl = cls.year_level ?? cls.class_level;
      if (lvl == null) continue;
      if (!distinct.has(lvl)) distinct.set(lvl, String(lvl));
    }
    return Array.from(distinct.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([value, label]) => ({ value: String(value), label }));
  }, [academicClasses, selectedProgram, selectedDepartment]);

  const filteredSubjects = useMemo(() => {
    if (!selectedProgram && !selectedDepartment && !selectedYear) return subjects;
    return subjects.filter((subject) => {
      const ac: any = (subject as any).academicClass;
      if (!ac) return false;
      if (selectedProgram && String(ac.program_id) !== String(selectedProgram)) return false;
      if (selectedDepartment && String(ac.department_id) !== String(selectedDepartment)) return false;
      if (selectedYear) {
        const lvl = ac.year_level ?? ac.class_level;
        if (String(lvl) !== String(selectedYear)) return false;
      }
      return true;
    });
  }, [subjects, selectedProgram, selectedDepartment, selectedYear]);

  // Guards: clear dependent fields when parent changes makes them invalid
  useEffect(() => {
    if (selectedDepartment && selectedProgram && !filteredDepartments.some((d) => d.id === selectedDepartment)) {
      setSelectedDepartment(null);
      setSelectedSubject(null);
    }
  }, [selectedDepartment, selectedProgram, filteredDepartments]);

  useEffect(() => {
    if (selectedSubject && !filteredSubjects.some((s) => s.id === selectedSubject)) {
      if (subjects.length > 0) setSelectedSubject(null);
    }
  }, [selectedSubject, filteredSubjects, subjects.length]);

  const handleProgramChange = (programId: string | null) => {
    const next = !programId || programId === "__all__" ? null : programId;
    setSelectedProgram(next);
    setSelectedDepartment(null);
    setSelectedSubject(null);
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const next = !departmentId || departmentId === "__all__" ? null : departmentId;
    setSelectedDepartment(next);
    setSelectedSubject(null);
  };

  const handleYearChange = (year: string | null) => {
    const next = !year || year === "__all__" ? null : year;
    setSelectedYear(next);
    setSelectedSubject(null);
  };

  const handleFilter = () => {
    onFilterChange({
      programId: selectedProgram,
      departmentId: selectedDepartment,
      year: selectedYear,
      subjectId: selectedSubject,
      examId: selectedExam,
    });
  };

  const handleClearFilters = () => {
    setSelectedProgram(null);
    setSelectedDepartment(null);
    setSelectedYear(null);
    setSelectedSubject(null);
    setSelectedExam(null);
    onFilterChange({ programId: null, departmentId: null, year: null, subjectId: null, examId: null });
  };

  const hasActiveFilters = Boolean(selectedProgram || selectedDepartment || selectedYear || selectedSubject || selectedExam);

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <div className="min-w-0 space-y-2">
          <Label htmlFor="program" className="text-xs font-medium text-slate-700">
            Program
          </Label>
          <Select
            value={selectedProgram ?? "__all__"}
            onValueChange={(v) => handleProgramChange(v)}
            disabled={isLoading || programs.length === 0}
          >
            <SelectTrigger id="program" className="h-9 w-full">
              <SelectValue placeholder={isLoading ? "Loading programs..." : "All Programs"}>
                {(value: string | null) => {
                  if (!value || value === "__all__") return isLoading ? "Loading programs..." : "All Programs";
                  const selected = programs.find((p) => String(p.id) === String(value));
                  const label = selected ? selected.program_name : value;
                  return <span title={label} className="truncate">{label}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Programs</SelectItem>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.program_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="department" className="text-xs font-medium text-slate-700">
            Department / Group
          </Label>
          <Select
            value={selectedDepartment ?? "__all__"}
            onValueChange={(v) => handleDepartmentChange(v)}
            disabled={isLoading}
          >
            <SelectTrigger id="department" className="h-9 w-full">
              <SelectValue placeholder={selectedProgram ? "All Departments" : "Select program first"}>
                {(value: string | null) => {
                  if (!value || value === "__all__") return selectedProgram ? "All Departments" : "Select program first";
                  const selected = departments.find((d) => String(d.id) === String(value)) ?? filteredDepartments.find((d) => String(d.id) === String(value));
                  const label = selected ? selected.department_name : value;
                  return <span title={label} className="truncate">{label}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Departments</SelectItem>
              {filteredDepartments.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {selectedProgram ? "No departments for this program" : "No departments"}
                </div>
              ) : (
                filteredDepartments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.department_name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="year" className="text-xs font-medium text-slate-700">
            Year / Level
          </Label>
          <Select
            value={selectedYear ?? "__all__"}
            onValueChange={(v) => handleYearChange(v === "__all__" ? null : v)}
            disabled={isLoading}
          >
            <SelectTrigger id="year" className="h-9 w-full">
              <SelectValue placeholder="All Years">
                {(value: string | null) => {
                  if (!value || value === "__all__") return "All Years";
                  return `Year ${value}`;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Years</SelectItem>
              {levelYearOptions.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">No levels</div>
              ) : (
                levelYearOptions.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    Year {o.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="subject" className="text-xs font-medium text-slate-700">
            Subject
          </Label>
          <Select
            value={selectedSubject ?? "__all__"}
            onValueChange={(v) => setSelectedSubject(v === "__all__" ? null : v)}
            disabled={isLoading}
          >
            <SelectTrigger id="subject" className="h-9 w-full">
              <SelectValue placeholder="All Subjects">
                {(value: string | null) => {
                  if (!value || value === "__all__") return "All Subjects";
                  const selected = filteredSubjects.find((s) => String(s.id) === String(value)) ?? subjects.find((s) => String(s.id) === String(value));
                  const label = selected ? (selected as any).name : value;
                  return <span title={label} className="truncate">{label}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Subjects</SelectItem>
              {filteredSubjects.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground">
                  {selectedProgram || selectedDepartment || selectedYear ? "No subjects for selected Program/Dept/Year" : "No subjects"}
                </div>
              ) : (
                filteredSubjects.map((subject: any) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="min-w-0 space-y-2">
          <Label htmlFor="exam" className="text-xs font-medium text-slate-700">
            Exam
          </Label>
          <Select
            value={selectedExam ?? "__all__"}
            onValueChange={(v) => setSelectedExam(v === "__all__" ? null : v)}
            disabled={isLoading}
          >
            <SelectTrigger id="exam" className="h-9 w-full">
              <SelectValue placeholder="All Exams">
                {(value: string | null) => {
                  if (!value || value === "__all__") return "All Exams";
                  const selected = exams.find((e) => String(e.id) === String(value));
                  const label = selected ? (selected as any).exam_name : value;
                  return <span title={label} className="truncate">{label}</span>;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All Exams</SelectItem>
              {exams.map((exam: any) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.exam_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleFilter} className="h-9 px-4 text-sm font-medium">
          <Filter className="mr-2 h-3.5 w-3.5" />
          Confirm
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="h-9 px-4 text-sm font-medium"
          >
            <X className="mr-2 h-3.5 w-3.5" />
            Clear Filter
          </Button>
        )}
      </div>
    </div>
  );
};

export default ResultsFilters;
