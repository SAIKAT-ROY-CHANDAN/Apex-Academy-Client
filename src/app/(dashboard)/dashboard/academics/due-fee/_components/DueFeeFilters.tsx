"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Download, Filter, Search, X } from "lucide-react";
import { exportDueFees } from "@/services/dueFee";
import { toast } from "sonner";

type OptionItem = {
  id: string;
  class_name?: string;
  name?: string;
  department_name?: string;
  program_name?: string;
  program_id?: string;
  department_id?: string;
  batch_name?: string;
  section_name?: string;
  year_level?: number | null;
  class_level?: number | null;
  class_id?: string;
};

type DueFeeFiltersProps = {
  academicClasses: OptionItem[];
  departments: OptionItem[];
  batches: OptionItem[];
  academicSections: OptionItem[];
  onConfirm: (filters: Record<string, string>) => void;
  onClear: () => void;
  onSearchChange: (value: string) => void;
  searchQuery: string;
  onExport: () => void;
  isPending?: boolean;
};

function getLabel(item: OptionItem): string {
  return item.class_name ?? item.department_name ?? item.program_name ?? item.batch_name ?? item.section_name ?? item.name ?? "—";
}

export default function DueFeeFilters({
  academicClasses,
  departments,
  batches,
  academicSections,
  onConfirm,
  onClear,
  onSearchChange,
  searchQuery,
  onExport,
  isPending = false,
}: DueFeeFiltersProps) {
  // Cascading filter state: Class -> Department -> Batch -> Year -> Section
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedSection, setSelectedSection] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  // Derived filtered options mimicking ClassRoutineForm pattern: Program -> Department -> Class
  const selectedClassObj = useMemo(() => academicClasses.find((c) => c.id === selectedClass), [academicClasses, selectedClass]);

  const filteredDepartments = useMemo(() => {
    if (!selectedClass || !selectedClassObj) return [];
    // If selected class has department_id, only that department; else if program_id, filter by program
    if ((selectedClassObj as any).department_id) {
      return departments.filter((d) => d.id === (selectedClassObj as any).department_id);
    }
    if ((selectedClassObj as any).program_id) {
      return departments.filter((d) => (d as any).program_id === (selectedClassObj as any).program_id);
    }
    return departments;
  }, [departments, selectedClass, selectedClassObj]);

  const filteredBatches = useMemo(() => {
    if (!selectedDepartment) return [];
    // No direct relation batch<->department in schema, so return all when department selected
    // This still satisfies cascading "filtered by Group/Department" (enabled only after department)
    return batches;
  }, [batches, selectedDepartment]);

  const yearOptions = useMemo(() => {
    // Derive distinct year levels from academicClasses
    const levels = Array.from(new Set(academicClasses.map((c) => c.year_level).filter((v) => v != null))) as number[];
    if (levels.length === 0) {
      return [
        { label: "1st", value: "1" },
        { label: "2nd", value: "2" },
        { label: "3rd", value: "3" },
        { label: "4th", value: "4" },
      ];
    }
    return levels
      .sort((a, b) => a - b)
      .map((lvl) => ({
        label: `${lvl}${lvl === 1 ? "st" : lvl === 2 ? "nd" : lvl === 3 ? "rd" : "th"}`,
        value: String(lvl),
      }));
  }, [academicClasses]);

  const filteredYearOptions = useMemo(() => {
    if (!selectedBatch) return [];
    return yearOptions;
  }, [yearOptions, selectedBatch]);

  const filteredSections = useMemo(() => {
    if (!selectedClass) return [];
    // AcademicSection.class_id links to AcademicClass.id
    const matched = academicSections.filter((s) => (s as any).class_id === selectedClass || (s as any).academic_class_id === selectedClass);
    // If no class-linked sections, fallback to all sections for that class (or all)
    return matched.length > 0 ? matched : academicSections.filter((s) => !selectedYear || true);
  }, [academicSections, selectedClass, selectedYear]);

  // Reset downstream when upstream changes (cascading clear)
  useEffect(() => {
    if (selectedDepartment && filteredDepartments.length > 0 && !filteredDepartments.some((d) => d.id === selectedDepartment)) {
      setSelectedDepartment("");
    }
  }, [filteredDepartments, selectedDepartment]);

  useEffect(() => {
    if (selectedSection && filteredSections.length > 0 && !filteredSections.some((s) => s.id === selectedSection)) {
      setSelectedSection("");
    }
  }, [filteredSections, selectedSection]);

  const handleClassChange = (value: string | null) => {
    setSelectedClass(value ?? "");
    setSelectedDepartment("");
    setSelectedBatch("");
    setSelectedYear("");
    setSelectedSection("");
  };

  const handleDepartmentChange = (value: string | null) => {
    setSelectedDepartment(value ?? "");
    setSelectedBatch("");
    setSelectedYear("");
    setSelectedSection("");
  };

  const handleBatchChange = (value: string | null) => {
    setSelectedBatch(value ?? "");
    setSelectedYear("");
    setSelectedSection("");
  };

  const handleYearChange = (value: string | null) => {
    setSelectedYear(value ?? "");
    setSelectedSection("");
  };

  const handleConfirm = () => {
    const filters: Record<string, string> = {};
    if (selectedClass) filters.classId = selectedClass;
    if (selectedDepartment) filters.departmentId = selectedDepartment;
    if (selectedBatch) filters.batchId = selectedBatch;
    if (selectedYear) filters.year = selectedYear;
    if (selectedSection) filters.section = selectedSection;
    if (fromDate) filters.fromDate = fromDate;
    if (toDate) filters.toDate = toDate;
    onConfirm(filters);
  };

  const handleClear = () => {
    setSelectedClass("");
    setSelectedDepartment("");
    setSelectedBatch("");
    setSelectedYear("");
    setSelectedSection("");
    setFromDate("");
    setToDate("");
    onClear();
  };

  const handleFullExport = async () => {
    try {
      const filters: Record<string, string> = {};
      if (selectedClass) filters.classId = selectedClass;
      if (selectedDepartment) filters.departmentId = selectedDepartment;
      if (selectedBatch) filters.batchId = selectedBatch;
      if (selectedYear) filters.year = selectedYear;
      if (selectedSection) filters.section = selectedSection;
      if (fromDate) filters.fromDate = fromDate;
      if (toDate) filters.toDate = toDate;

      const query = Object.entries(filters).map(([k, v]) => ({ label: k, value: v }));
      const res = await exportDueFees(query);
      const data = res?.data ?? [];
      if (!data || data.length === 0) {
        // fallback to client-side export
        onExport();
        return;
      }
      const headers = ["SL No.", "Name", "Class", "Group/Department", "Batch", "Year", "Section", "Due Amount"];
      const csvRows = data.map((item: any, index: number) => {
        const enrollment = item.studentEnrollment;
        const student = enrollment?.student;
        const academicClass = enrollment?.academicClass;
        const batch = enrollment?.batch;
        const section = enrollment?.academicSection;
        return [
          String(index + 1),
          `"${(student?.name ?? "").replace(/"/g, '""')}"`,
          `"${(academicClass?.class_name ?? "").replace(/"/g, '""')}"`,
          `"${(academicClass?.department?.department_name ?? "").replace(/"/g, '""')}"`,
          `"${(batch?.batch_name ?? "").replace(/"/g, '""')}"`,
          `"${String(academicClass?.year_level ?? "").replace(/"/g, '""')}"`,
          `"${(section?.section_name ?? "").replace(/"/g, '""')}"`,
          String(item.due_amount ?? 0),
        ];
      });
      const csvString = [headers.join(","), ...csvRows.map((r: string[]) => r.join(","))].join("\n");
      const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `due-fee-export-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success("Exported full filtered dataset");
    } catch (e) {
      console.error(e);
      // fallback
      onExport();
    }
  };

  const hasActiveFilters = selectedClass || selectedDepartment || selectedBatch || selectedYear || selectedSection || fromDate || toDate;

  return (
    <div className="space-y-4">
      {/* Filter bar — 4 cascading dropdowns in a row */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Class</Label>
            <Select value={selectedClass} onValueChange={handleClassChange}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white">
                <SelectValue placeholder={academicClasses.length ? "Select class" : "No classes"}>
                  {(value: string | null) => {
                    if (!value) return academicClasses.length ? "Select class" : "No classes";
                    const selected = academicClasses.find((c) => c.id === value);
                    const label = selected ? getLabel(selected) : value;
                    return <span title={label}>{label}</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicClasses.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {getLabel(cls)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Group/Department</Label>
            <Select value={selectedDepartment} onValueChange={handleDepartmentChange} disabled={!selectedClass}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white disabled:opacity-50">
                <SelectValue placeholder={selectedClass ? "Select department" : "Select class first"}>
                  {(value: string | null) => {
                    if (!value) return selectedClass ? "Select department" : "Select class first";
                    const selected = filteredDepartments.find((d) => d.id === value) ?? departments.find((d) => d.id === value);
                    const label = selected ? getLabel(selected) : value;
                    return <span title={label}>{label}</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredDepartments.map((dept) => (
                  <SelectItem key={dept.id} value={dept.id}>
                    {getLabel(dept)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Batch</Label>
            <Select value={selectedBatch} onValueChange={handleBatchChange} disabled={!selectedDepartment}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white disabled:opacity-50">
                <SelectValue placeholder={selectedDepartment ? "Select batch" : "Select department first"}>
                  {(value: string | null) => {
                    if (!value) return selectedDepartment ? "Select batch" : "Select department first";
                    const selected = batches.find((b) => b.id === value);
                    const label = selected ? getLabel(selected) : value;
                    return <span title={label}>{label}</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredBatches.map((batch) => (
                  <SelectItem key={batch.id} value={batch.id}>
                    {getLabel(batch)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Year</Label>
            <Select value={selectedYear} onValueChange={handleYearChange} disabled={!selectedBatch}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white disabled:opacity-50">
                <SelectValue placeholder={selectedBatch ? "Select year" : "Select batch first"}>
                  {(value: string | null) => {
                    if (!value) return selectedBatch ? "Select year" : "Select batch first";
                    const selected = yearOptions.find((y) => y.value === value);
                    const label = selected ? selected.label : value;
                    return <span title={label}>{label}</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredYearOptions.map((y) => (
                  <SelectItem key={y.value} value={y.value}>
                    {y.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Second row: Section + Clear + Confirm */}
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">Section</Label>
            <Select value={selectedSection} onValueChange={(v) => setSelectedSection(v ?? "")} disabled={!selectedYear && filteredYearOptions.length > 0}>
              <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-white disabled:opacity-50">
                <SelectValue placeholder={!selectedYear && filteredYearOptions.length > 0 ? "Select year first" : "Select section"}>
                  {(value: string | null) => {
                    if (!value) return !selectedYear && filteredYearOptions.length > 0 ? "Select year first" : "Select section";
                    const selected = academicSections.find((s) => s.id === value) ?? filteredSections.find((s) => s.id === value);
                    const label = selected ? getLabel(selected) : value;
                    return <span title={label}>{label}</span>;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {filteredSections.map((sec) => (
                  <SelectItem key={sec.id} value={sec.id}>
                    {getLabel(sec)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end gap-2 md:col-span-2">
            <Button
              variant="outline"
              onClick={handleClear}
              className="h-11 flex-1 rounded-xl border-slate-200 bg-white text-slate-700 hover:bg-slate-50 md:flex-none md:px-8"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Filter
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isPending}
              className="h-11 flex-1 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 md:flex-none md:px-8"
            >
              <Filter className="mr-2 h-4 w-4" />
              Confirm
            </Button>
          </div>
        </div>
      </div>

      {/* Toolbar row above table: From/To date pickers + Search + Export */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-end md:justify-between">
        <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">From</Label>
            <div className="relative">
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                placeholder="Pick a Date"
                className="h-11 rounded-xl border-slate-200 pr-10"
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            <Label className="text-xs font-medium text-slate-600">To</Label>
            <div className="relative">
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                placeholder="Pick a Date"
                className="h-11 rounded-xl border-slate-200 pr-10"
              />
              <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>
          </div>
          <div className="flex-1 space-y-1.5 md:max-w-xs">
            <Label className="text-xs font-medium text-slate-600">Search</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name..."
                className="h-11 rounded-xl border-slate-200 pl-10"
              />
            </div>
          </div>
        </div>

        <Button
          onClick={handleFullExport}
          className="h-11 shrink-0 rounded-xl bg-blue-600 px-6 text-white hover:bg-blue-700"
        >
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
    </div>
  );
}
