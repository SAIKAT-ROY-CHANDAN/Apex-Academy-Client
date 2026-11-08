"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NOTICE_TYPES = [
  "ALL",
  "UPDATE_NEWS",
  "GENERAL_NOTICE",
  "ADMISSION_NOTICE",
  "IMPROVEMENT_NOTICE",
  "HSC_NOTICE",
  "HONOURS_NOTICE",
  "MASTER_NOTICE",
] as const;

const label = (v: string) =>
  v === "ALL"
    ? "All Types"
    : v
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());

interface Props {
  defaultValue?: string;
}

export default function NoticeTypeFilter({ defaultValue = "ALL" }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "ALL") {
      params.delete("noticeType");
    } else {
      params.set("noticeType", value);
    }
    params.delete("page");
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="w-full sm:w-64">
      <Select value={defaultValue} onValueChange={handleChange}>
        <SelectTrigger className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm">
          <SelectValue placeholder="Filter by type" />
        </SelectTrigger>
        <SelectContent>
          {NOTICE_TYPES.map((t) => (
            <SelectItem key={t} value={t}>
              {label(t)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
