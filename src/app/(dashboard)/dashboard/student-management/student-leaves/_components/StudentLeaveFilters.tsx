"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STUDENT_LEAVE_TYPE_OPTIONS } from "@/constant/leave/studentLeaveType";

const LEAVE_TYPE_OPTIONS = [
  { label: "All Types", value: "all" },
  ...STUDENT_LEAVE_TYPE_OPTIONS,
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
];

const StudentLeaveFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchInput, setSearchInput] = useState(
    searchParams.get("searchTerm") ?? "",
  );

  const status: string = searchParams.get("status") ?? "all";
  const leaveType: string = searchParams.get("leave_type") ?? "all";

  useEffect(() => {
    const id = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchInput) params.set("searchTerm", searchInput);
      else params.delete("searchTerm");
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    }, 400);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") params.delete(key);
      else params.set(key, value);
      params.set("page", "1");
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by reason, type, status..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="h-9 pl-8"
        />
      </div>
      <div className="flex gap-2">
        <Select
          value={status}
          onValueChange={(v) => updateParam("status", (v as string) ?? "all")}
        >
          <SelectTrigger className="h-9 w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={leaveType}
          onValueChange={(v) =>
            updateParam("leave_type", (v as string) ?? "all")
          }
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="Leave Type" />
          </SelectTrigger>
          <SelectContent>
            {LEAVE_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default StudentLeaveFilters;
