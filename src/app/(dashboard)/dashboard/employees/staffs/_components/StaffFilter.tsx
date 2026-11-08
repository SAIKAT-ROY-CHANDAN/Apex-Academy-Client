"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { STAFF_TYPES } from "@/constant/staff/staffType";

type Option = {
  id: string;
  name: string;
};

type StaffFilterProps = {
  designations: Option[];
};

const StaffFilter = ({ designations }: StaffFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDesignation = searchParams.get("designationFilter") ?? "";
  const currentStaffType = searchParams.get("staffTypeFilter") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const hasActiveFilters = !!(
    currentDesignation ||
    currentStaffType ||
    currentSearch
  );

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(window.location.search);
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router]
  );

  const clearFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  const selectedDesignationName = currentDesignation
    ? designations.find((d) => d.id === currentDesignation)?.name
    : undefined;

  const selectedStaffTypeName = currentStaffType
    ? STAFF_TYPES.find((t) => t.id === currentStaffType)?.name
    : undefined;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="w-full sm:w-64">
          <SearchForm
            defaultValue={currentSearch}
            placeholder="Name, Email, or Phone"
          />
        </div>

        {/* Designation Filter */}
        <div className="w-full sm:w-44">
          <Select
            value={currentDesignation}
            onValueChange={(value) =>
              updateFilter("designationFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Designation">
                {selectedDesignationName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Designations</SelectItem>
              {designations.map((d) => (
                <SelectItem key={d.id} value={d.id}>
                  {d.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Staff Type Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={currentStaffType}
            onValueChange={(value) =>
              updateFilter("staffTypeFilter", value ?? "")
            }
          >
            <SelectTrigger className="w-full h-9 text-sm">
              <SelectValue placeholder="Staff Type">
                {selectedStaffTypeName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {STAFF_TYPES.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-9 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
};

export default StaffFilter;