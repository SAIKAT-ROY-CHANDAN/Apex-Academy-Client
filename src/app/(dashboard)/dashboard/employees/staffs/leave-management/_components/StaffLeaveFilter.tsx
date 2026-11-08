"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
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
import { LEAVE_STATUS_OPTIONS, LEAVE_TYPE_OPTIONS } from "../_constants";

type Option = {
  id: string;
  name: string;
};

type StaffLeaveFilterProps = {
  staffs: Option[];
};

const StaffLeaveFilter = ({ staffs }: StaffLeaveFilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStaff = searchParams.get("staffFilter") ?? "";
  const currentType = searchParams.get("leave_type") ?? "";
  const currentStatus = searchParams.get("leave_status") ?? "";
  const currentSearch = searchParams.get("search") ?? "";

  const hasActiveFilters = !!(
    currentStaff ||
    currentType ||
    currentStatus ||
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
    [router],
  );

  const clearFilters = useCallback(() => {
    router.push("?");
  }, [router]);

  const selectedStaffName = currentStaff
    ? staffs.find((s) => s.id === currentStaff)?.name
    : undefined;
  const selectedTypeName = currentType
    ? LEAVE_TYPE_OPTIONS.find((t) => t.id === currentType)?.name
    : undefined;
  const selectedStatusName = currentStatus
    ? LEAVE_STATUS_OPTIONS.find((s) => s.id === currentStatus)?.name
    : undefined;

  return (
    <div className="rounded-lg border border-border/50 bg-card p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Filters</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="w-full sm:w-64">
          <SearchForm
            defaultValue={currentSearch}
            placeholder="Search by leave type / status..."
          />
        </div>

        {/* Staff Filter */}
        <div className="w-full sm:w-52">
          <Select
            value={currentStaff}
            onValueChange={(value) => updateFilter("staffFilter", value ?? "")}
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder="Staff Member">
                {selectedStaffName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Staff</SelectItem>
              {staffs.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Leave Type Filter */}
        <div className="w-full sm:w-44">
          <Select
            value={currentType}
            onValueChange={(value) => updateFilter("leave_type", value ?? "")}
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder="Leave Type">
                {selectedTypeName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {LEAVE_TYPE_OPTIONS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status Filter */}
        <div className="w-full sm:w-40">
          <Select
            value={currentStatus}
            onValueChange={(value) => updateFilter("leave_status", value ?? "")}
          >
            <SelectTrigger className="h-9 w-full text-sm">
              <SelectValue placeholder="Status">
                {selectedStatusName}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              {LEAVE_STATUS_OPTIONS.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
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

export default StaffLeaveFilter;
