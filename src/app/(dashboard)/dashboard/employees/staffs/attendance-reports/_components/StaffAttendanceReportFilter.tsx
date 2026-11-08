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
import { STAFF_TYPES } from "@/constant/staff/staffType";

type Option = { id: string; name: string };

const staffTypeOptions: Option[] = [...STAFF_TYPES];

interface StaffAttendanceReportFilterProps {
  designations: Option[];
  currentStaffType: string;
  currentDesignationId: string;
  currentStartDate: string;
  currentEndDate: string;
}

const StaffAttendanceReportFilter = ({
  designations,
  currentStaffType,
  currentDesignationId,
  currentStartDate,
  currentEndDate,
}: StaffAttendanceReportFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [selectedStaffType, setSelectedStaffType] = useState(currentStaffType);
  const [selectedDesignation, setSelectedDesignation] =
    useState(currentDesignationId);
  const [startDate, setStartDate] = useState(currentStartDate);
  const [endDate, setEndDate] = useState(currentEndDate);

  const hasActiveFilters = !!(
    selectedStaffType ||
    selectedDesignation ||
    startDate ||
    endDate
  );

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    const setParam = (label: string, value: string) => {
      if (value) params.set(label, value);
      else params.delete(label);
    };

    setParam("staff_type", selectedStaffType);
    setParam("designation_id", selectedDesignation);
    setParam("start_date", startDate);
    setParam("end_date", endDate);

    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    setSelectedStaffType("");
    setSelectedDesignation("");
    setStartDate("");
    setEndDate("");
    router.push("?");
  };

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="space-y-2">
        <Label
          htmlFor="report-staff-type"
          className="text-xs font-medium text-slate-700"
        >
          Staff Type
        </Label>
        <Select
          value={selectedStaffType}
          onValueChange={(value) => setSelectedStaffType(value ?? "")}
        >
          <SelectTrigger id="report-staff-type" className="h-9 w-52 text-sm">
            <SelectValue>
              {staffTypeOptions.find((t) => t.id === selectedStaffType)?.name ??
                "All Types"}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Types</SelectItem>
            {staffTypeOptions.map((type) => (
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

export default StaffAttendanceReportFilter;
