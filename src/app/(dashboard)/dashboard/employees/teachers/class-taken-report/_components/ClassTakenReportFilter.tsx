"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
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
  SelectValue,
} from "@/components/ui/select";
import { ADMINISTRATIVE_POSITIONS } from "../../_constants";

type TeacherOption = { id: string; name: string };

interface ClassTakenReportFilterProps {
  mode: string;
  teachers: TeacherOption[];
  classes: TAcademicClass[];
  programs: TProgram[];
  currentTeacherId: string;
  currentClassId: string;
  currentProgramId: string;
  currentDepartmentId: string;
  currentSubjectId: string;
  currentAdminPosition: string;
  currentStartDate: string;
  currentEndDate: string;
}

const ClassTakenReportFilter = ({
  mode,
  teachers = [],
  classes = [],
  programs = [],
  currentTeacherId,
  currentClassId,
  currentProgramId,
  currentDepartmentId,
  currentSubjectId,
  currentAdminPosition,
  currentStartDate,
  currentEndDate,
}: ClassTakenReportFilterProps) => {
  const router = useRouter();
  const isUniversity = mode === "COLLEGE_UNIVERSITY";
  const [selectedTeacher, setSelectedTeacher] = useState(currentTeacherId);
  const [selectedProgram, setSelectedProgram] = useState(currentProgramId);
  const [selectedDepartment, setSelectedDepartment] =
    useState(currentDepartmentId);
  const [selectedClass, setSelectedClass] = useState(currentClassId);
  const [selectedSubject, setSelectedSubject] = useState(currentSubjectId);
  const [selectedAdminPosition, setSelectedAdminPosition] =
    useState(currentAdminPosition);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  const selectedProgramObj = programs.find(
    (program) => program.id === selectedProgram,
  );
  const departments = useMemo<TDepartment[]>(
    () => (isUniversity ? (selectedProgramObj?.departments ?? []) : []),
    [isUniversity, selectedProgramObj],
  );
  const selectedDepartmentObj = departments.find(
    (department) => department.id === selectedDepartment,
  );
  // Years are nested under the selected department — other departments' years never appear.
  const availableClasses = isUniversity
    ? (selectedDepartmentObj?.academicClasses ?? [])
    : classes;
  const selectedClassObj = availableClasses.find(
    (academicClass) => academicClass.id === selectedClass,
  );
  // Subjects are nested under the selected year — other years' subjects never appear.
  const subjects = selectedClassObj?.subjects ?? [];

  const hasActiveFilters = Boolean(
    selectedTeacher ||
    selectedProgram ||
    selectedDepartment ||
    selectedClass ||
    selectedSubject ||
    selectedAdminPosition ||
    startDate ||
    endDate,
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    const filterValues: Record<string, string> = {
      teacher_id: selectedTeacher,
      program_id: selectedProgram,
      department_id: selectedDepartment,
      academic_class_id: selectedClass,
      subject_id: selectedSubject,
      administrative_position: selectedAdminPosition,
      start_date: startDate,
      end_date: endDate,
    };
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    router.push(
      `/dashboard/employees/teachers/class-taken-report${query ? `?${query}` : ""}`,
    );
  };

  const clearFilters = () => {
    setSelectedTeacher("");
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSubject("");
    setSelectedAdminPosition("");
    setStartDate("");
    setEndDate("");
    router.push("/dashboard/employees/teachers/class-taken-report");
  };

  const label = (
    options: { id: string; label: string }[],
    value: string,
    placeholder: string,
  ) => options.find((option) => option.id === value)?.label ?? placeholder;

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label
            htmlFor="report-teacher"
            className="text-xs font-medium text-slate-700"
          >
            Teacher
          </Label>
          <Select
            value={selectedTeacher}
            onValueChange={(value) => setSelectedTeacher(value ?? "")}
          >
            <SelectTrigger id="report-teacher" className="h-9 text-sm">
              <SelectValue placeholder="All Teachers">
                {label(
                  teachers.map((teacher) => ({
                    id: teacher.id,
                    label: teacher.name,
                  })),
                  selectedTeacher,
                  "All Teachers",
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Teachers</SelectItem>
              {teachers.map((teacher) => (
                <SelectItem key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isUniversity && (
          <div className="space-y-2">
            <Label
              htmlFor="report-program"
              className="text-xs font-medium text-slate-700"
            >
              Program
            </Label>
            <Select
              value={selectedProgram}
              onValueChange={(value) => {
                setSelectedProgram(value ?? "");
                setSelectedDepartment("");
                setSelectedClass("");
                setSelectedSubject("");
              }}
            >
              <SelectTrigger id="report-program" className="h-9 text-sm">
                <SelectValue placeholder="All Programs">
                  {selectedProgramObj?.program_name ?? "All Programs"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((program) => (
                  <SelectItem key={program.id} value={program.id}>
                    {program.program_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {isUniversity && (
          <div className="space-y-2">
            <Label
              htmlFor="report-department"
              className="text-xs font-medium text-slate-700"
            >
              Department
            </Label>
            <Select
              value={selectedDepartment}
              disabled={!selectedProgram}
              onValueChange={(value) => {
                setSelectedDepartment(value ?? "");
                setSelectedClass("");
                setSelectedSubject("");
              }}
            >
              <SelectTrigger id="report-department" className="h-9 text-sm">
                <SelectValue
                  placeholder={
                    selectedProgram ? "All Departments" : "Select program first"
                  }
                >
                  {label(
                    departments.map((department) => ({
                      id: department.id,
                      label: department.department_name,
                    })),
                    selectedDepartment,
                    selectedProgram
                      ? "All Departments"
                      : "Select program first",
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((department) => (
                  <SelectItem key={department.id} value={department.id}>
                    {department.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label
            htmlFor="report-class"
            className="text-xs font-medium text-slate-700"
          >
            Year
          </Label>
          <Select
            value={selectedClass}
            disabled={isUniversity && !selectedDepartment}
            onValueChange={(value) => {
              setSelectedClass(value ?? "");
              setSelectedSubject("");
            }}
          >
            <SelectTrigger id="report-class" className="h-9 text-sm">
              <SelectValue
                placeholder={
                  isUniversity && !selectedDepartment
                    ? "Select department first"
                    : "All Years"
                }
              >
                {label(
                  availableClasses.map((academicClass) => ({
                    id: academicClass.id,
                    label: academicClass.class_name,
                  })),
                  selectedClass,
                  isUniversity && !selectedDepartment
                    ? "Select department first"
                    : "All Years",
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {availableClasses.map((academicClass) => (
                <SelectItem key={academicClass.id} value={academicClass.id}>
                  {academicClass.class_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="report-subject"
            className="text-xs font-medium text-slate-700"
          >
            Course Code
          </Label>
          <Select
            value={selectedSubject}
            disabled={!selectedClass}
            onValueChange={(value) => setSelectedSubject(value ?? "")}
          >
            <SelectTrigger id="report-subject" className="h-9 text-sm">
              <SelectValue
                placeholder={
                  selectedClass ? "All Course Codes" : "Select year first"
                }
              >
                {label(
                  subjects.map((subject) => ({
                    id: subject.id,
                    label: subject.name,
                  })),
                  selectedSubject,
                  selectedClass ? "All Subjects" : "Select year first",
                )}
              </SelectValue>
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

        <div className="space-y-2">
          <Label
            htmlFor="report-admin-position"
            className="text-xs font-medium text-slate-700"
          >
            Administrative Position
          </Label>
          <Select
            value={selectedAdminPosition}
            onValueChange={(value) => setSelectedAdminPosition(value ?? "")}
          >
            <SelectTrigger id="report-admin-position" className="h-9 text-sm">
              <SelectValue placeholder="All Positions">
                {label(
                  ADMINISTRATIVE_POSITIONS.map((position) => ({
                    id: position.id,
                    label: position.name,
                  })),
                  selectedAdminPosition,
                  "All Positions",
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Positions</SelectItem>
              {ADMINISTRATIVE_POSITIONS.map((position) => (
                <SelectItem key={position.id} value={position.id}>
                  {position.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="report-from"
            className="text-xs font-medium text-slate-700"
          >
            From Date
          </Label>
          <Input
            id="report-from"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="report-to"
            className="text-xs font-medium text-slate-700"
          >
            To Date
          </Label>
          <Input
            id="report-to"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={applyFilters} className="h-9 px-4 text-sm font-medium">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />
          Apply Filter
        </Button>
        {hasActiveFilters && (
          <Button
            variant="outline"
            onClick={clearFilters}
            className="h-9 px-4 text-sm font-medium"
          >
            <RotateCcw className="mr-2 h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default ClassTakenReportFilter;
