"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import EditHolidayDialog from "./EditHolidayDialog";
import {
  CalendarDays,
  Edit,
  Search,
  ArrowUpDown,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { THoliday } from "./types";
import { deleteHoliday } from "@/services/holiday";

interface HolidayTableProps {
  holidays: THoliday[] | [];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
}

const PAGE_SIZE = 10;

const formatDate = (date: string | null) => {
  if (!date) return "Not Available";
  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const HolidayTable = ({ holidays, currentPage, totalItems, totalPages }: HolidayTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<THoliday | null>(
    null
  );

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [holidayToEdit, setHolidayToEdit] = useState<THoliday | null>(null);

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredHolidays = useMemo(() => {
    if (!searchQuery.trim()) return holidays;
    const query = searchQuery.toLowerCase();
    return holidays.filter(
      (holiday) =>
        holiday.title.toLowerCase().includes(query) ||
        holiday.holiday_type.toLowerCase().includes(query)
    );
  }, [holidays, searchQuery]);

  const paginatedHolidays = filteredHolidays;
  const canGoNext = totalPages ? currentPage < totalPages : holidays.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleEditClick = (holiday: THoliday) => {
    setHolidayToEdit(holiday);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (holiday: THoliday) => {
    setHolidayToDelete(holiday);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!holidayToDelete) return;

    startTransition(async () => {
      const response = await deleteHoliday(holidayToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete holiday");
        return;
      }
      toast.success(response.message ?? "Holiday deleted successfully");
      setDeleteDialogOpen(false);
      setHolidayToDelete(null);

      // Step back a page if the last row on this page was just removed
      if (paginatedHolidays.length === 1 && currentPage > 1) {
        handlePageChange(currentPage - 1);
        return;
      }
      router.refresh();
    });
  };
console.log(holidays,"holidays");

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Holidays</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search holidays..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {paginatedHolidays.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CalendarDays className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No holidays match your search."
                  : "No holidays found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Add a holiday to get started."}
              </p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      #
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        Title
                        <ArrowUpDown className="h-3 w-3" />
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Start Date
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        End Date
                      </span>
                    </TableHead>
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Type
                    </TableHead>
                    <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedHolidays.map((holiday, index) => (
                    <TableRow
                      key={holiday.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {(currentPage - 1) * PAGE_SIZE + index + 1}
                      </TableCell>
                      <TableCell className="font-medium">
                        {holiday.title}
                        {holiday.description && (
                          <div className="max-w-55 truncate text-xs font-normal text-muted-foreground">
                            {holiday.description}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(holiday.start_date)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {formatDate(holiday.end_date)}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {holiday.holiday_type}
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ${holiday.is_active
                              ? "bg-green-500/10 text-green-600"
                              : "bg-red-500/10 text-red-600"
                            }`}
                        >
                          {holiday.is_active ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit holiday"
                            onClick={() => handleEditClick(holiday)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                            onClick={() => handleDeleteClick(holiday)}
                            title="Delete holiday"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
                <p className="text-xs text-muted-foreground">
                  {searchQuery
                    ? `Showing ${filteredHolidays.length} matching item${filteredHolidays.length === 1 ? "" : "s"}`
                    : `Showing ${Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–${Math.min(currentPage * PAGE_SIZE, totalItems)} of ${totalItems}`}
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="px-2 text-xs text-muted-foreground">
                    Page {currentPage}
                    {totalPages ? ` of ${totalPages}` : ""}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    disabled={!canGoNext}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Holiday"
        description={
          holidayToDelete
            ? `Are you sure you want to delete "${holidayToDelete.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this holiday? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />

      <EditHolidayDialog
        holiday={holidayToEdit}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />
    </>
  );
};

export default HolidayTable;