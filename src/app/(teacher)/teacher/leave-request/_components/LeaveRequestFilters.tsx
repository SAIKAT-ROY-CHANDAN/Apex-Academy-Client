"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { SearchForm } from "@/components/dashboard/SearchForm";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAVE_TYPE_OPTIONS as canonicalLeaveTypeOptions } from "@/constant/leave/leaveType";

const LEAVE_TYPE_OPTIONS = [
  { value: "", label: "All Types" },
  ...canonicalLeaveTypeOptions,
];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

const LeaveRequestFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("leave_type") ?? "";
  const currentStatus = searchParams.get("leave_status") ?? "";

  const [selectedType, setSelectedType] = useState(currentType);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const hasActiveFilters = !!(selectedType || selectedStatus);

  const handleFilter = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    const setParam = (key: string, value: string) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    };
    setParam("leave_type", selectedType);
    setParam("leave_status", selectedStatus);
    params.set("page", "1");
    router.push(`?${params.toString()}`);
  }, [router, selectedType, selectedStatus]);

  const clearFilters = () => {
    setSelectedType("");
    setSelectedStatus("");
    router.push("?");
  };

  return (
    <div className="space-y-4 rounded-lg border border-border/50 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-slate-900">Filters</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <Label className="text-xs font-medium text-slate-700">Search</Label>
          <SearchForm placeholder="Search by type/status..." className="h-9" />
        </div>

        {/* Leave Type */}
        <div className="space-y-2">
          <Label
            htmlFor="leave-type"
            className="text-xs font-medium text-slate-700"
          >
            Leave Type
          </Label>
          <Select
            value={selectedType}
            onValueChange={(value) => setSelectedType(value ?? "")}
            items={LEAVE_TYPE_OPTIONS}
          >
            <SelectTrigger id="leave-type" className="h-9 text-sm">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              {LEAVE_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label
            htmlFor="leave-status"
            className="text-xs font-medium text-slate-700"
          >
            Status
          </Label>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value ?? "")}
            items={STATUS_OPTIONS}
          >
            <SelectTrigger id="leave-status" className="h-9 text-sm">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.label} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex items-end gap-2">
          <Button onClick={handleFilter} className="h-9 px-5">
            Apply
          </Button>
          {hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="outline"
              className="h-9 px-4"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveRequestFilters;
