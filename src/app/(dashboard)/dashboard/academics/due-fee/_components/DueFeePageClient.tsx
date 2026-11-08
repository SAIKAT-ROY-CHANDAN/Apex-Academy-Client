"use client";

import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import DueFeeFilters from "./DueFeeFilters";
import DueFeeTable, { DueFeeRow } from "./DueFeeTable";
import { getDueFees } from "@/services/dueFee";
import { QueryParams } from "@/types/shared/query.type";
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
  group?: string | null;
};

type DueFeePageClientProps = {
  academicClasses: OptionItem[];
  departments: OptionItem[];
  batches: OptionItem[];
  academicSections: OptionItem[];
};

export default function DueFeePageClient({
  academicClasses,
  departments,
  batches,
  academicSections,
}: DueFeePageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [rows, setRows] = useState<DueFeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters state is managed inside DueFeeFilters via Confirm/Clear,
  // but we need to persist applied filters here
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string>>({});

  const pageFromUrl = useMemo(() => {
    const p = searchParams.get("page");
    return p ? parseInt(p, 10) : 1;
  }, [searchParams]);

  const fetchDueFees = useCallback(
    async (filters: Record<string, string> = appliedFilters, page: number = pageFromUrl) => {
      setLoading(true);
      try {
        const query: QueryParams[] = [];
        Object.entries(filters).forEach(([key, value]) => {
          if (value) query.push({ label: key, value });
        });
        query.push({ label: "page", value: String(page) });
        query.push({ label: "limit", value: "10" });
        if (searchQuery.trim()) query.push({ label: "searchTerm", value: searchQuery.trim() });

        // date filters handled via appliedFilters fromDate/toDate
        const response = await getDueFees(query);
        if (response?.success) {
          const data = response.data ?? [];
          // Map backend StudentFee -> DueFeeRow shape for table
          const mapped: DueFeeRow[] = data.map((item: any) => {
            const enrollment = item.studentEnrollment;
            const student = enrollment?.student;
            const academicClass = enrollment?.academicClass;
            const academicSection = enrollment?.academicSection;
            const batch = enrollment?.batch;
            return {
              id: item.id,
              name: student?.name ?? "—",
              photo: student?.photo ?? null,
              className: academicClass?.class_name ?? "—",
              departmentName: academicClass?.department?.department_name ?? academicClass?.department_id ?? "—",
              batchName: batch?.batch_name ?? "—",
              yearLabel: academicClass?.year_level ? `${academicClass.year_level}` : academicClass?.year_level === 0 ? "—" : academicClass?.year_level ?? "—",
              sectionName: academicSection?.section_name ?? "—",
              dueAmount: item.due_amount ?? 0,
              created_at: item.created_at,
            };
          });
          setRows(mapped);
          setTotalItems(response.meta?.totalItems ?? mapped.length);
          setTotalPages(response.meta?.totalPages ?? 1);
          setCurrentPage(response.meta?.currentPage ?? page);
        } else {
          // Fallback: if API not yet available, show empty
          if (response?.message) toast.error(response.message);
        }
      } catch (error) {
        console.error("Error fetching due fees:", error);
        toast.error("Failed to fetch due fees");
      } finally {
        setLoading(false);
      }
    },
    [appliedFilters, pageFromUrl, searchQuery]
  );

  useEffect(() => {
    fetchDueFees(appliedFilters, pageFromUrl);
  }, [fetchDueFees, appliedFilters, pageFromUrl]);

  const handleFilterConfirm = (filters: Record<string, string>) => {
    setAppliedFilters(filters);
    // reset to page 1
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    router.push(`?${params.toString()}`);
    startTransition(() => {
      fetchDueFees(filters, 1);
    });
  };

  const handleClearFilter = () => {
    setAppliedFilters({});
    setSearchQuery("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    router.push(`?${params.toString()}`);
    startTransition(() => {
      fetchDueFees({}, 1);
    });
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleExport = () => {
    // Client-side CSV export of currently filtered data (paginated view)
    // For full export, call backend export endpoint via DueFeeFilters' export button directly
    if (rows.length === 0) {
      toast.error("No data to export");
      return;
    }
    const headers = ["SL No.", "Name", "Class", "Group/Department", "Batch", "Year", "Section", "Due Amount"];
    const csvRows = rows.map((row, index) => [
      String((currentPage - 1) * 10 + index + 1),
      `"${row.name.replace(/"/g, '""')}"`,
      `"${String(row.className).replace(/"/g, '""')}"`,
      `"${String(row.departmentName).replace(/"/g, '""')}"`,
      `"${String(row.batchName).replace(/"/g, '""')}"`,
      `"${String(row.yearLabel).replace(/"/g, '""')}"`,
      `"${String(row.sectionName).replace(/"/g, '""')}"`,
      String(row.dueAmount),
    ]);
    const csvString = [headers.join(","), ...csvRows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `due-fee-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    toast.success("Due fee exported successfully");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Due Fee" backHref="/dashboard/academics" />

      <DueFeeFilters
        academicClasses={academicClasses}
        departments={departments}
        batches={batches}
        academicSections={academicSections}
        onConfirm={handleFilterConfirm}
        onClear={handleClearFilter}
        onSearchChange={handleSearch}
        searchQuery={searchQuery}
        onExport={handleExport}
        isPending={isPending || loading}
      />

      <DueFeeTable
        rows={rows}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
