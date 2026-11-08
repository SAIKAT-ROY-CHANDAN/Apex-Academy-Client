"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
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
import {
  ADMINISTRATIVE_POSITIONS,
  ADMINISTRATIVE_POSITION_LABELS,
} from "../../_constants";
import { TEACHER_TYPES } from "@/constant/teacher/teacherType";

type Option = { id: string; name: string };

const teacherTypeOptions: Option[] = TEACHER_TYPES.map((type) => ({
  id: type.id,
  name: type.name,
}));

interface TeacherAttendanceReportFilterProps {
  designations: Option[];
  departments: Option[];
  currentTeacherType: string;
  currentDesignationId: string;
  currentDepartmentId: string;
  currentAdminPosition: string;
  currentStartDate: string;
  currentEndDate: string;
}

const TeacherAttendanceReportFilter = ({
  designations,
  departments,
  currentTeacherType,
  currentDesignationId,
  currentDepartmentId,
  currentAdminPosition,
  currentStartDate,
  currentEndDate,
}: TeacherAttendanceReportFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedTeacherType, setSelectedTeacherType] =
    useState(currentTeacherType);
  const [selectedDesignation, setSelectedDesignation] =
    useState(currentDesignationId);
  const [selectedDepartment, setSelectedDepartment] =
    useState(currentDepartmentId);
  const [selectedAdminPosition, setSelectedAdminPosition] =
    useState(currentAdminPosition);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  const hasActiveFilters = !!(
    selectedTeacherType ||
    selectedDesignation ||
    selectedDepartment ||
    selectedAdminPosition ||
    startDate ||
    endDate
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const setParam = (label: string, value: string) => {
      if (value) params.set(label, value);
      else params.delete(label);
    };

    setParam("teacher_type", selectedTeacherType);
    setParam("designation_id", selectedDesignation);
    setParam("department_id", selectedDepartment);
    setParam("administrative_position", selectedAdminPosition);
    setParam("start_date", startDate);
    setParam("end_date", endDate);

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedTeacherType("");
    setSelectedDesignation("");
    setSelectedDepartment("");
    setSelectedAdminPosition("");
    setStartDate("");
    setEndDate("");
    router.push("?");
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <Label
          htmlFor="report-teacher-type"
          className="text-xs font-medium text-slate-700"
        >
          Teacher Type
        </Label>
        <Select
          value={selectedTeacherType}
          onValueChange={(value) => setSelectedTeacherType(value ?? "")}
        >
          <SelectTrigger id="report-teacher-type" className="h-9 w-52 text-sm">
            <SelectValue>
              {teacherTypeOptions.find((t) => t.id === selectedTeacherType)
                ?.name ?? "All Types"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {teacherTypeOptions.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="report-designation"
          className="text-xs font-medium text-slate-700"
        >
          Designation
        </Label>
        <Select
          value={selectedDesignation}
          onValueChange={(value) => setSelectedDesignation(value ?? "")}
        >
          <SelectTrigger id="report-designation" className="h-9 w-52 text-sm">
            <SelectValue>
              {designations.find((d) => d.id === selectedDesignation)?.name ??
                "All Designations"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Designations</SelectItem>
            {designations.map((designation) => (
              <SelectItem key={designation.id} value={designation.id}>
                {designation.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label
          htmlFor="report-department"
          className="text-xs font-medium text-slate-700"
        >
          Department
        </Label>
        <Select
          value={selectedDepartment}
          onValueChange={(value) => setSelectedDepartment(value ?? "")}
        >
          <SelectTrigger id="report-department" className="h-9 w-52 text-sm">
            <SelectValue>
              {departments.find((d) => d.id === selectedDepartment)?.name ??
                "All Departments"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Departments</SelectItem>
            {departments.map((department) => (
              <SelectItem key={department.id} value={department.id}>
                {department.name}
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
          <SelectTrigger id="report-admin-position" className="h-9 w-52 text-sm">
            <SelectValue>
              {selectedAdminPosition
                ? ADMINISTRATIVE_POSITION_LABELS[selectedAdminPosition] ??
                  "All Positions"
                : "All Positions"}
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
          onChange={(e) => setStartDate(e.target.value)}
          className="h-9 w-44 text-sm"
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
          onChange={(e) => setEndDate(e.target.value)}
          className="h-9 w-44 text-sm"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={applyFilters} className="h-9 px-4 text-sm font-medium">
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
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceReportFilter;
