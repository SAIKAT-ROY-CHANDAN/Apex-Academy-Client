"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import type { TDepartment, TProgram } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types";
import type { TAcademicClass } from "@/app/(dashboard)/dashboard/settings/system/subject-config/_components/types";
import type { AcademicSession } from "@/app/(dashboard)/dashboard/settings/system/session-config/_components/types/academic-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TeacherOption = { id: string; name: string };

interface AdminAttendanceFiltersProps {
  mode: string;
  teachers: TeacherOption[];
  classes: TAcademicClass[];
  programs: TProgram[];
  sessions: AcademicSession[];
  currentTeacherId: string;
  currentClassId: string;
  currentProgramId: string;
  currentDepartmentId: string;
  currentSectionId: string;
  currentSubjectId: string;
  currentSessionId: string;
  currentStartDate: string;
  currentEndDate: string;
}

const AdminAttendanceFilters = ({
  mode,
  teachers = [],
  classes = [],
  programs = [],
  sessions = [],
  currentTeacherId,
  currentClassId,
  currentProgramId,
  currentDepartmentId,
  currentSectionId,
  currentSubjectId,
  currentSessionId,
  currentStartDate,
  currentEndDate,
}: AdminAttendanceFiltersProps) => {
  const router = useRouter();
  const isUniversity = mode === "COLLEGE_UNIVERSITY";
  const [selectedTeacher, setSelectedTeacher] = useState(currentTeacherId);
  const [selectedProgram, setSelectedProgram] = useState(currentProgramId);
  const [selectedDepartment, setSelectedDepartment] = useState(currentDepartmentId);
  const [selectedClass, setSelectedClass] = useState(currentClassId);
  const [selectedSection, setSelectedSection] = useState(currentSectionId);
  const [selectedSubject, setSelectedSubject] = useState(currentSubjectId);
  const [selectedSession, setSelectedSession] = useState(currentSessionId);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  const selectedProgramObj = programs.find((program) => program.id === selectedProgram);
  const departments = useMemo<TDepartment[]>(
    () => (isUniversity ? selectedProgramObj?.departments ?? [] : []),
    [isUniversity, selectedProgramObj],
  );
  const selectedDepartmentObj = departments.find((department) => department.id === selectedDepartment);
  const availableClasses = isUniversity
    ? selectedDepartmentObj?.academicClasses ?? []
    : classes;
  const selectedClassObj = availableClasses.find((academicClass) => academicClass.id === selectedClass);
  const sections = selectedClassObj?.academicSections ?? [];
  // Subjects are nested under the selected class/year — only that year's subjects are offered.
  const subjects = selectedClassObj?.subjects ?? [];

  const hasActiveFilters = Boolean(
    selectedTeacher || selectedProgram || selectedDepartment || selectedClass ||
    selectedSection || selectedSubject || selectedSession || startDate || endDate,
  );

  const applyFilters = () => {
    const params = new URLSearchParams();
    const filterValues: Record<string, string> = {
      teacher_id: selectedTeacher,
      program_id: selectedProgram,
      department_id: selectedDepartment,
      academic_class_id: selectedClass,
      academic_section_id: selectedSection,
      subject_id: selectedSubject,
      session_id: selectedSession,
      start_date: startDate,
      end_date: endDate,
    };
    Object.entries(filterValues).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    const query = params.toString();
    router.push(`/dashboard/student-management/student-attendance${query ? `?${query}` : ""}`);
  };

  const clearFilters = () => {
    setSelectedTeacher("");
    setSelectedProgram("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedSubject("");
    setSelectedSession("");
    setStartDate("");
    setEndDate("");
    router.push("/dashboard/student-management/student-attendance");
  };

  const label = (options: { id: string; label: string }[], value: string, placeholder: string) =>
    options.find((option) => option.id === value)?.label ?? placeholder;

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="attendance-teacher" className="text-xs font-medium text-slate-700">Teacher</Label>
          <Select value={selectedTeacher} onValueChange={(value) => setSelectedTeacher(value ?? "")}>
            <SelectTrigger id="attendance-teacher" className="h-9 text-sm">
              <SelectValue placeholder="All Teachers">
                {label(teachers.map((teacher) => ({ id: teacher.id, label: teacher.name })), selectedTeacher, "All Teachers")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Teachers</SelectItem>
              {teachers.map((teacher) => <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isUniversity && (
          <div className="space-y-2">
            <Label htmlFor="attendance-program" className="text-xs font-medium text-slate-700">Program</Label>
            <Select value={selectedProgram} onValueChange={(value) => {
              setSelectedProgram(value ?? "");
              setSelectedDepartment("");
              setSelectedClass("");
              setSelectedSection("");
              setSelectedSubject("");
            }}>
              <SelectTrigger id="attendance-program" className="h-9 text-sm">
                <SelectValue placeholder="All Programs">{selectedProgramObj?.program_name ?? "All Programs"}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Programs</SelectItem>
                {programs.map((program) => <SelectItem key={program.id} value={program.id}>{program.program_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        {isUniversity && (
          <div className="space-y-2">
            <Label htmlFor="attendance-department" className="text-xs font-medium text-slate-700">Department</Label>
            <Select value={selectedDepartment} disabled={!selectedProgram} onValueChange={(value) => {
              setSelectedDepartment(value ?? "");
              setSelectedClass("");
              setSelectedSection("");
              setSelectedSubject("");
            }}>
              <SelectTrigger id="attendance-department" className="h-9 text-sm">
                <SelectValue placeholder={selectedProgram ? "All Departments" : "Select program first"}>
                  {label(departments.map((department) => ({ id: department.id, label: department.department_name })), selectedDepartment, selectedProgram ? "All Departments" : "Select program first")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Departments</SelectItem>
                {departments.map((department) => <SelectItem key={department.id} value={department.id}>{department.department_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="attendance-class" className="text-xs font-medium text-slate-700">Class/Year</Label>
          <Select value={selectedClass} disabled={isUniversity && !selectedDepartment} onValueChange={(value) => {
            setSelectedClass(value ?? "");
            setSelectedSection("");
            setSelectedSubject("");
          }}>
            <SelectTrigger id="attendance-class" className="h-9 text-sm">
              <SelectValue placeholder={isUniversity && !selectedDepartment ? "Select department first" : "All Classes/Years"}>
                {label(availableClasses.map((academicClass) => ({ id: academicClass.id, label: academicClass.class_name })), selectedClass, isUniversity && !selectedDepartment ? "Select department first" : "All Classes/Years")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Classes/Years</SelectItem>
              {availableClasses.map((academicClass) => <SelectItem key={academicClass.id} value={academicClass.id}>{academicClass.class_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance-section" className="text-xs font-medium text-slate-700">Section</Label>
          <Select value={selectedSection} disabled={!selectedClass} onValueChange={(value) => setSelectedSection(value ?? "")}>
            <SelectTrigger id="attendance-section" className="h-9 text-sm">
              <SelectValue placeholder={selectedClass ? "All Sections" : "Select class/year first"}>
                {label(sections.map((section) => ({ id: section.id, label: section.section_name })), selectedSection, selectedClass ? "All Sections" : "Select class/year first")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sections</SelectItem>
              {sections.map((section) => <SelectItem key={section.id} value={section.id}>{section.section_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance-subject" className="text-xs font-medium text-slate-700">Subject</Label>
          <Select value={selectedSubject} disabled={!selectedClass} onValueChange={(value) => setSelectedSubject(value ?? "")}>
            <SelectTrigger id="attendance-subject" className="h-9 text-sm">
              <SelectValue placeholder={selectedClass ? "All Subjects" : "Select class/year first"}>
                {label(subjects.map((subject) => ({ id: subject.id, label: subject.name })), selectedSubject, selectedClass ? "All Subjects" : "Select class/year first")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects.map((subject) => <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance-session" className="text-xs font-medium text-slate-700">Academic Session</Label>
          <Select value={selectedSession} onValueChange={(value) => setSelectedSession(value ?? "")}>
            <SelectTrigger id="attendance-session" className="h-9 text-sm">
              <SelectValue placeholder="All Sessions">{label(sessions.map((session) => ({ id: session.id, label: session.session_name })), selectedSession, "All Sessions")}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Sessions</SelectItem>
              {sessions.map((session) => <SelectItem key={session.id} value={session.id}>{session.session_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="attendance-from" className="text-xs font-medium text-slate-700">From Date</Label>
          <Input id="attendance-from" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="h-9 text-sm" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="attendance-to" className="text-xs font-medium text-slate-700">To Date</Label>
          <Input id="attendance-to" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="h-9 text-sm" />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={applyFilters} className="h-9 px-4 text-sm font-medium">
          <SlidersHorizontal className="mr-2 h-3.5 w-3.5" />Apply Filter
        </Button>
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="h-9 px-4 text-sm font-medium">
            <RotateCcw className="mr-2 h-3.5 w-3.5" />Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default AdminAttendanceFilters;
