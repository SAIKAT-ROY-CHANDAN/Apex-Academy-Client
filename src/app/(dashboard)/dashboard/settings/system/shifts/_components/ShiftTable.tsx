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

import { deleteShift } from "@/services/shift";
import { TShift } from "@/types/modules/shift/shift.type";
import { Clock, Edit, Search, ArrowUpDown, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";

interface ShiftTableProps {
  shifts: TShift[] | [];
}

const ShiftTable = ({ shifts }: ShiftTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<TShift | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredShifts = useMemo(() => {
    if (!searchQuery.trim()) return shifts;
    const query = searchQuery.toLowerCase();
    return shifts.filter((shift) => shift.name.toLowerCase().includes(query));
  }, [shifts, searchQuery]);

  const formatTime = (time: string) => {
    return new Date(time).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDeleteClick = (shift: TShift) => {
    setShiftToDelete(shift);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!shiftToDelete) return;

    startTransition(async () => {
      const response = await deleteShift(shiftToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete shift");
        return;
      }
      toast.success(response.message ?? "Shift deleted successfully");
      setDeleteDialogOpen(false);
      setShiftToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Shifts</CardTitle>
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search shifts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 pl-8 text-sm"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredShifts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                {searchQuery
                  ? "No shifts match your search."
                  : "No shifts found."}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                {searchQuery
                  ? "Try a different search term."
                  : "Add a shift to get started."}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    #
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      Shift Name
                      <ArrowUpDown className="h-3 w-3" />
                    </span>
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      Start Time
                    </span>
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      End Time
                    </span>
                  </TableHead>
                  <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.map((shift, index) => (
                  <TableRow
                    key={shift.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{shift.name}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(shift.start_time)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(shift.end_time)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/settings/system/shifts/${shift.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit shift"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                          onClick={() => handleDeleteClick(shift)}
                          title="Delete shift"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Shift"
        description={
          shiftToDelete
            ? `Are you sure you want to delete "${shiftToDelete.name}"? This action cannot be undone.`
            : "Are you sure you want to delete this shift? This action cannot be undone."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="destructive"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};

export default ShiftTable;