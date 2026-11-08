"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DashboardFilter } from "@/types/dashboard/overview.type";
import { formatTeacherType, TEACHER_TYPES } from "@/constant/teacher/teacherType";
import { STAFF_TYPES } from "@/constant/staff/staffType";

interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (filters: {
    startDate?: string;
    endDate?: string;
    filter: DashboardFilter;
  }) => void;
  classNames: string[];
  subjectNames: string[];
}

const GENDER_OPTIONS = ["MALE", "FEMALE", "OTHER"];
const RELIGION_OPTIONS = ["ISLAM", "HINDU", "CHRISTIAN", "BUDDHIST", "OTHER"];
const TEACHER_TYPE_OPTIONS = TEACHER_TYPES.map((t) => t.id);
const STAFF_TYPE_OPTIONS = STAFF_TYPES.map((t) => t.id);
const ATTENDANCE_STATUS_OPTIONS = ["PRESENT", "ABSENT"];
const LEAVE_STATUS_OPTIONS = ["APPROVED", "PENDING", "REJECTED"];

const formatLabel = (value: string) =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export function FilterDrawer({
  open,
  onOpenChange,
  onApply,
  classNames,
  subjectNames,
}: FilterDrawerProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [studentGender, setStudentGender] = useState("");
  const [studentReligion, setStudentReligion] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [teacherType, setTeacherType] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");
  const [staffType, setStaffType] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("");

  const handleApply = () => {
    const filter: DashboardFilter = {};

    if (studentGender) filter.student = { ...filter.student, gender: studentGender };
    if (studentReligion) filter.student = { ...filter.student, religion: studentReligion };
    if (studentClass) {
      filter.student = { ...filter.student, class_name: studentClass };
      filter.class = { class_name: studentClass };
    }
    if (teacherType) filter.teacher = { ...filter.teacher, teacher_type: teacherType };
    if (teacherSubject) {
      filter.teacher = { ...filter.teacher, subject: teacherSubject };
      filter.subject = { name: teacherSubject };
    }
    if (staffType) filter.staff = { staff_type: staffType };
    if (attendanceStatus) {
      filter.studentAttendance = { attendance_status: attendanceStatus };
      filter.teacherAttendance = { attendance_status: attendanceStatus };
      filter.staffAttendance = { attendance_status: attendanceStatus };
    }
    if (leaveStatus) {
      filter.teacherLeave = { leave_status: leaveStatus };
      filter.staffLeave = { leave_status: leaveStatus };
    }

    onApply({
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      filter,
    });
    onOpenChange(false);
  };

  const handleReset = () => {
    setStartDate("");
    setEndDate("");
    setStudentGender("");
    setStudentReligion("");
    setStudentClass("");
    setTeacherType("");
    setTeacherSubject("");
    setStaffType("");
    setAttendanceStatus("");
    setLeaveStatus("");
    onApply({ filter: {} });
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Dashboard Filters</SheetTitle>
          <SheetDescription>
            Apply filters to customize the dashboard data.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-4">
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Date Range</p>
            <div className="grid grid-cols-2 gap-3">
              <Field>
                <FieldLabel>Start Date</FieldLabel>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </Field>
              <Field>
                <FieldLabel>End Date</FieldLabel>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </Field>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Student Filters</p>
            <Field>
              <FieldLabel>Gender</FieldLabel>
              <Select value={studentGender || undefined} onValueChange={(v) => setStudentGender(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Genders" />
                </SelectTrigger>
                <SelectContent>
                  {GENDER_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Religion</FieldLabel>
              <Select value={studentReligion || undefined} onValueChange={(v) => setStudentReligion(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Religions" />
                </SelectTrigger>
                <SelectContent>
                  {RELIGION_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Class</FieldLabel>
              <Select value={studentClass || undefined} onValueChange={(v) => setStudentClass(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent>
                  {classNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Teacher Filters</p>
            <Field>
              <FieldLabel>Teacher Type</FieldLabel>
              <Select value={teacherType || undefined} onValueChange={(v) => setTeacherType(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {TEACHER_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatTeacherType(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Subject</FieldLabel>
              <Select value={teacherSubject || undefined} onValueChange={(v) => setTeacherSubject(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  {subjectNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Staff Filters</p>
            <Field>
              <FieldLabel>Staff Type</FieldLabel>
              <Select value={staffType || undefined} onValueChange={(v) => setStaffType(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  {STAFF_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Status Filters</p>
            <Field>
              <FieldLabel>Attendance Status</FieldLabel>
              <Select value={attendanceStatus || undefined} onValueChange={(v) => setAttendanceStatus(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel>Leave Status</FieldLabel>
              <Select value={leaveStatus || undefined} onValueChange={(v) => setLeaveStatus(v ?? "")}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  {LEAVE_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {formatLabel(opt)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>

        <SheetFooter>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}