"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Undo2, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  StaffFilterValues,
  StaffPayrollFiltersProps,
} from "@/types/modules/payroll";
import { STAFF_TYPES as STAFF_TYPE_LIST } from "@/constant/staff/staffType";

const STAFF_TYPES = [
  { id: "All", name: "All" },
  ...STAFF_TYPE_LIST,
];

const StaffPayrollFilters = ({
  currentFilters,
  designations,
}: StaffPayrollFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [draftFilters, setDraftFilters] = useState<StaffFilterValues>({
    staffType: currentFilters.staffType || "All",
    designation: currentFilters.designation || "All",
    search: currentFilters.search || "",
  });

  useEffect(() => {
    setDraftFilters({
      staffType: currentFilters.staffType || "All",
      designation: currentFilters.designation || "All",
      search: currentFilters.search || "",
    });
  }, [currentFilters]);

  const handleFilterChange = useCallback(
    (field: keyof StaffFilterValues, value: string | null) => {
      setDraftFilters((current) => ({
        ...current,
        [field]: value ?? "",
      }));
    },
    [],
  );

  const preservePeriodParams = useCallback(
    (params: URLSearchParams) => {
      const month = searchParams.get("month");
      const year = searchParams.get("year");
      if (month) params.set("month", month);
      if (year) params.set("year", year);
    },
    [searchParams],
  );

  const handleClearFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    preservePeriodParams(newParams);
    router.push(
      newParams.toString()
        ? `${pathname}?${newParams.toString()}`
        : pathname,
    );
    setDraftFilters({
      staffType: "All",
      designation: "All",
      search: "",
    });
  }, [router, pathname, preservePeriodParams]);

  const handleConfirmFilters = useCallback(() => {
    const newParams = new URLSearchParams();
    preservePeriodParams(newParams);

    if (draftFilters.staffType !== "All") {
      newParams.set("staffType", draftFilters.staffType);
    }

    if (draftFilters.designation !== "All") {
      newParams.set("designation", draftFilters.designation);
    }

    if (draftFilters.search) {
      newParams.set("search", draftFilters.search);
    }

    newParams.delete("page");

    router.push(`${pathname}?${newParams.toString()}`);
  }, [draftFilters, router, pathname, preservePeriodParams]);

  const handleSearch = useCallback(() => {
    handleConfirmFilters();
  }, [handleConfirmFilters]);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSearch();
      }
    },
    [handleSearch],
  );

  const selectedDesignationName =
    draftFilters.designation !== "All"
      ? designations.find((d) => d.id === draftFilters.designation)?.name
      : undefined;

  const selectedStaffTypeName =
    draftFilters.staffType !== "All"
      ? STAFF_TYPES.find((t) => t.id === draftFilters.staffType)?.name
      : undefined;

  return (
    <div className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm backdrop-blur">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Staff Type
          </label>
          <Select
            value={draftFilters.staffType}
            onValueChange={(value) => handleFilterChange("staffType", value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue placeholder="Staff Type">
                {selectedStaffTypeName ?? "All Types"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {STAFF_TYPES.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.id === "All" ? "All Types" : option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/80">
            Designation
          </label>
          <Select
            value={draftFilters.designation}
            onValueChange={(value) => handleFilterChange("designation", value)}
          >
            <SelectTrigger className="h-11 w-full rounded-xl border-border/70 bg-background px-3 text-sm shadow-none">
              <SelectValue placeholder="Designation">
                {selectedDesignationName ?? "All Designations"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Designations</SelectItem>
              {designations.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-65">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={draftFilters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            onKeyDown={handleSearchKeyDown}
            placeholder="Search by name, phone, email..."
            className="h-11 rounded-xl border-border/70 bg-background pl-8 pr-4 text-sm shadow-none"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            className="h-11 rounded-xl px-4 font-medium w-full sm:w-auto"
            onClick={handleClearFilters}
            type="button"
          >
            <Undo2 className="h-4 w-4" />
            Clear Filter
          </Button>
          <Button
            className="h-11 rounded-xl bg-primary px-5 font-medium text-primary-foreground shadow-sm hover:bg-primary/80 w-full sm:w-auto"
            onClick={handleConfirmFilters}
            type="button"
          >
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StaffPayrollFilters;
