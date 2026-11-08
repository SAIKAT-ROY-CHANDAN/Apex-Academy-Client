"use client";

import { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Calendar,
  Eye,
  FileText,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  getHostelFeeCollections,
  deleteHostelFeeCollection,
  type HostelFeeCollectionQueryParams,
} from "@/services/hostelFeeCollection";
import {
  formatAmount,
  PAGE_SIZE,
  buildCollectionDateFilter,
  parseHostelFeeCollectionsResponse,
  transformRecordsToRows,
  type InvoiceStatus,
  type SelectOption,
  type TableRow,
} from "./deposited.utils";
import type { HostelTreeBuilding } from "../page";
import DepositDetailDialog from "./DepositDetailDialog";
import { handleGenerateHostelInvoice } from "./hostel-invoice-print";

const STATUS_STYLES: Record<InvoiceStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-600 border-emerald-200",
  PARTIAL: "bg-amber-50 text-amber-600 border-amber-200",
  UNPAID: "bg-red-50 text-red-500 border-red-200",
};

interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "All",
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5 flex-1 min-w-27.5">
      <label className="text-xs font-medium text-slate-600">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <option value="">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>
    </div>
  );
}

interface FilterCardProps {
  title: string;
  children: React.ReactNode;
  onClear: () => void;
  onConfirm: () => void;
  confirming?: boolean;
}

function FilterCard({
  title,
  children,
  onClear,
  onConfirm,
  confirming,
}: FilterCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-[11px] font-semibold tracking-wide text-slate-500 whitespace-nowrap">
          {title}
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <div className="flex flex-wrap items-end gap-3">
        {children}
        <button
          type="button"
          onClick={onClear}
          disabled={confirming}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          Clear Filter
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={confirming}
          className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
        >
          {confirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading
            </>
          ) : (
            "Confirm"
          )}
        </button>
      </div>
    </div>
  );
}

interface DepositedPageClientProps {
  hostelTree: HostelTreeBuilding[];
  initialRows: TableRow[];
  initialTotalCount: number;
}

export default function DepositedPageClient({
  hostelTree,
  initialRows,
  initialTotalCount,
}: DepositedPageClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [locationFilters, setLocationFilters] = useState({
    building_id: "",
    floor_id: "",
    room_id: "",
  });

  const [monthFilters, setMonthFilters] = useState({
    fromMonth: "",
    toMonth: "",
  });

  const [appliedMonthFilters, setAppliedMonthFilters] = useState({
    fromMonth: "",
    toMonth: "",
  });

  const [confirming, setConfirming] = useState(false);

  const [rows, setRows] = useState<TableRow[]>(initialRows);
  const [loadingRows, setLoadingRows] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(initialTotalCount);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState<TableRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailRow, setDetailRow] = useState<TableRow | null>(null);
  const [generatingInvoiceId, setGeneratingInvoiceId] = useState<string | null>(
    null,
  );
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  // Derived, in-memory building/floor/room options from the tree fetched on the server.
  const buildingOptions: SelectOption[] = useMemo(
    () => hostelTree.map((b) => ({ value: b.id, label: b.label })),
    [hostelTree],
  );

  const selectedBuilding = useMemo(
    () => hostelTree.find((b) => b.id === locationFilters.building_id),
    [hostelTree, locationFilters.building_id],
  );

  const floorOptions: SelectOption[] = useMemo(
    () =>
      selectedBuilding?.floors.map((f) => ({ value: f.id, label: f.label })) ??
      [],
    [selectedBuilding],
  );

  const selectedFloor = useMemo(
    () =>
      selectedBuilding?.floors.find((f) => f.id === locationFilters.floor_id),
    [selectedBuilding, locationFilters.floor_id],
  );

  const roomOptions: SelectOption[] = useMemo(
    () =>
      selectedFloor?.rooms.map((r) => ({ value: r.id, label: r.label })) ?? [],
    [selectedFloor],
  );

  const handleBuildingChange = (value: string) =>
    setLocationFilters({ building_id: value, floor_id: "", room_id: "" });

  const handleFloorChange = (value: string) =>
    setLocationFilters((prev) => ({ ...prev, floor_id: value, room_id: "" }));

  const handleRoomChange = (value: string) =>
    setLocationFilters((prev) => ({ ...prev, room_id: value }));

  const fetchDeposits = async (
    pageNumber: number = 1,
    monthOverride?: { fromMonth: string; toMonth: string },
  ) => {
    setConfirming(true);
    setLoadingRows(true);
    try {
      const filter: Record<string, any> = {};
      const activeMonthFilters = monthOverride ?? appliedMonthFilters;

      const collectionDateFilter = buildCollectionDateFilter(
        activeMonthFilters.fromMonth,
        activeMonthFilters.toMonth,
      );
      if (collectionDateFilter) {
        filter.collection_date = collectionDateFilter;
      }

      if (locationFilters.room_id) {
        filter.student = filter.student ?? {};
        (filter.student as any).hostelAllocations = {
          some: { hostel_room_id: locationFilters.room_id },
        };
      } else if (locationFilters.floor_id) {
        filter.student = filter.student ?? {};
        (filter.student as any).hostelAllocations = {
          some: { hostelRoom: { hostel_floor_id: locationFilters.floor_id } },
        };
      } else if (locationFilters.building_id) {
        filter.student = filter.student ?? {};
        (filter.student as any).hostelAllocations = {
          some: {
            hostelRoom: {
              hostelFloor: {
                hostel_configuration_id: locationFilters.building_id,
              },
            },
          },
        };
      }

      const params: HostelFeeCollectionQueryParams = {
        page: pageNumber,
        limit: PAGE_SIZE,
        orderBy: { created_at: "desc" },
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      };

      const res = await getHostelFeeCollections(params);
      if (!res?.success) {
        toast.error(res?.message ?? "Failed to load hostel deposits");
        setRows([]);
        setTotalCount(0);
        return;
      }

      const { records, count } = parseHostelFeeCollectionsResponse(res);
      setRows(transformRecordsToRows(records));
      setTotalCount(count);
      setPage(pageNumber);
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
      toast.error("Failed to load hostel deposits");
      setRows([]);
      setTotalCount(0);
    } finally {
      setLoadingRows(false);
      setConfirming(false);
    }
  };

  const handleConfirmLocationFilter = () => fetchDeposits(1);
  const handleClearLocationFilter = () => {
    setLocationFilters({ building_id: "", floor_id: "", room_id: "" });
    fetchDeposits(1);
  };

  const handleApplyMonthFilter = () => {
    if (
      monthFilters.fromMonth &&
      monthFilters.toMonth &&
      monthFilters.fromMonth > monthFilters.toMonth
    ) {
      toast.error("From month cannot be later than to month");
      return;
    }

    setAppliedMonthFilters(monthFilters);
    fetchDeposits(1, monthFilters);
  };

  const handleClearMonthFilter = () => {
    const cleared = { fromMonth: "", toMonth: "" };
    setMonthFilters(cleared);
    setAppliedMonthFilters(cleared);
    fetchDeposits(1, cleared);
  };

  const handleDeleteClick = (row: TableRow) => {
    setRowToDelete(row);
    setDeleteDialogOpen(true);
  };

  const handleGenerateInvoice = async (row: TableRow) => {
    setGeneratingInvoiceId(row.id);
    try {
      const ok = await handleGenerateHostelInvoice(row.id);
      if (!ok) {
        toast.error("Failed to generate invoice for this record");
      }
    } finally {
      setGeneratingInvoiceId(null);
    }
  };

  const handleDeleteConfirm = () => {
    if (!rowToDelete) return;
    startTransition(async () => {
      try {
        const res = await deleteHostelFeeCollection(rowToDelete.id);
        if (!res?.success) {
          toast.error(res?.message ?? "Failed to delete deposit record");
          return;
        }
        toast.success("Deposit record deleted successfully");
        setDeleteDialogOpen(false);
        router.refresh();
        fetchDeposits(page);
      } catch (err) {
        console.error(err);
        toast.error("Failed to delete deposit record");
      }
    });
  };

  const pagedRows = useMemo(() => rows, [rows]);

  return (
    <div className="space-y-4 mt-4">
      <FilterCard
        title="BUILDING & ROOM WISE FILTER"
        onClear={handleClearLocationFilter}
        onConfirm={handleConfirmLocationFilter}
        confirming={confirming}
      >
        <SelectField
          label="Building"
          value={locationFilters.building_id}
          onChange={handleBuildingChange}
          options={buildingOptions}
        />
        <SelectField
          label="Floor No."
          value={locationFilters.floor_id}
          onChange={handleFloorChange}
          options={floorOptions}
        />
        <SelectField
          label="Room No."
          value={locationFilters.room_id}
          onChange={handleRoomChange}
          options={roomOptions}
        />
      </FilterCard>

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5 min-w-40">
            <label className="text-xs font-medium text-slate-600">
              From Month
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="month"
                value={monthFilters.fromMonth}
                onChange={(e) =>
                  setMonthFilters((prev) => ({
                    ...prev,
                    fromMonth: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 min-w-40">
            <label className="text-xs font-medium text-slate-600">
              To Month
            </label>
            <div className="relative">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="month"
                value={monthFilters.toMonth}
                onChange={(e) =>
                  setMonthFilters((prev) => ({
                    ...prev,
                    toMonth: e.target.value,
                  }))
                }
                className="h-11 w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleApplyMonthFilter}
            disabled={confirming}
            className="h-11 rounded-lg bg-blue-600 px-6 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed inline-flex items-center gap-2"
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading
              </>
            ) : (
              "Apply"
            )}
          </button>
          <button
            type="button"
            onClick={handleClearMonthFilter}
            disabled={confirming}
            className="h-11 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                <th className="px-4 py-3 whitespace-nowrap">Sl. No.</th>
                <th className="px-4 py-3 whitespace-nowrap">Name</th>
                <th className="px-4 py-3 whitespace-nowrap">Class / Year</th>
                <th className="px-4 py-3 whitespace-nowrap">
                  Group/Department
                </th>
                <th className="px-4 py-3 whitespace-nowrap">Batch</th>
                <th className="px-4 py-3 whitespace-nowrap">Year</th>
                <th className="px-4 py-3 whitespace-nowrap">Section</th>
                <th className="px-4 py-3 whitespace-nowrap">Invoice No.</th>
                <th className="px-4 py-3 whitespace-nowrap">Generated On</th>
                <th className="px-4 py-3 whitespace-nowrap">Due Date</th>
                <th className="px-4 py-3 whitespace-nowrap">Status</th>
                <th className="px-4 py-3 whitespace-nowrap">Total Amount</th>
                <th className="px-4 py-3 whitespace-nowrap">Scholarship</th>
                <th className="px-4 py-3 whitespace-nowrap">Paid Amount</th>
                <th className="px-4 py-3 whitespace-nowrap">Total Due</th>
                <th className="px-4 py-3 whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingRows ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-4 py-16 text-center text-sm text-slate-400"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                      Loading deposit records...
                    </div>
                  </td>
                </tr>
              ) : pagedRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={16}
                    className="px-4 py-16 text-center text-sm text-slate-400"
                  >
                    No deposit records found for the selected filters.
                  </td>
                </tr>
              ) : (
                pagedRows.map((student) => (
                  <tr
                    key={student.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.slNo}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        {student.avatarUrl ? (
                          <Image
                            src={student.avatarUrl}
                            alt={student.name}
                            width={32}
                            height={32}
                            className="h-8 w-8 rounded-full object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-semibold">
                            <UserRound className="h-4 w-4" />
                          </div>
                        )}
                        <span className="font-medium text-slate-700">
                          {student.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.className}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.department}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.batch}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.year}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.section}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap font-mono text-xs">
                      {student.invoiceNo}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.issuedAt}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {student.dueDate}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {student.invoiceStatus ? (
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${STATUS_STYLES[student.invoiceStatus]}`}
                        >
                          {student.invoiceStatus}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-blue-600 font-medium whitespace-nowrap">
                      {formatAmount(student.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-violet-600 font-medium whitespace-nowrap">
                      {formatAmount(student.scholarshipAmount)}
                    </td>
                    <td className="px-4 py-3 text-emerald-600 font-medium whitespace-nowrap">
                      {formatAmount(student.paidAmount)}
                    </td>
                    <td className="px-4 py-3 text-red-500 font-medium whitespace-nowrap">
                      {formatAmount(student.totalDue)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-slate-400">
                        <button
                          type="button"
                          onClick={() => {
                            setDetailRow(student);
                            setDetailOpen(true);
                          }}
                          className="hover:text-blue-600 transition-colors"
                          aria-label={`View ${student.name}`}
                          title="View history"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleGenerateInvoice(student)}
                          className="hover:text-emerald-600 transition-colors"
                          aria-label={`Generate invoice for ${student.name}`}
                          title="Generate Invoice"
                          disabled={generatingInvoiceId === student.id}
                        >
                          {generatingInvoiceId === student.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FileText className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(student)}
                          className="hover:text-red-500 transition-colors"
                          aria-label={`Delete ${student.name}`}
                          title="Delete"
                          disabled={isPending}
                        >
                          {isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <div className="text-xs text-slate-500">
            {totalCount > 0 ? (
              <>
                Showing {Math.min((page - 1) * PAGE_SIZE + 1, totalCount)}-
                {Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
              </>
            ) : (
              "No records"
            )}
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                const next = Math.max(1, page - 1);
                fetchDeposits(next);
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
              disabled={page === 1 || loadingRows}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <div className="flex items-center gap-1 text-sm">
              <span className="h-8 w-8 inline-flex items-center justify-center rounded-lg bg-blue-600 text-white font-medium">
                {page}
              </span>
              {totalPages > 1 && (
                <span className="px-1 text-slate-400">/ {totalPages}</span>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                const next = Math.min(totalPages, page + 1);
                fetchDeposits(next);
              }}
              className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40"
              disabled={page === totalPages || loadingRows}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="hidden sm:block w-16" />
        </div>
      </div>

      <DepositDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        collectionId={detailRow?.id ?? null}
        studentName={detailRow?.name ?? ""}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Deposit Record"
        description={
          rowToDelete
            ? `Are you sure you want to delete the fee collection for "${rowToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this deposit record? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

