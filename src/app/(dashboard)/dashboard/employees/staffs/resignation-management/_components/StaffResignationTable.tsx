"use client";

import { CalendarDays, Edit, Eye, Phone, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { deleteStaffResignation } from "@/services/staffResignation";
import type { TStaffResignation } from "@/types/modules/staff/staff-resignation.type";
import { formatDate, getInitials } from "../_constants";

type StaffResignationTableProps = {
  resignations: TStaffResignation[];
};

const StaffResignationTable = ({
  resignations,
}: StaffResignationTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toDelete, setToDelete] = useState<TStaffResignation | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteClick = (resignation: TStaffResignation) => {
    setToDelete(resignation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!toDelete) return;

    startTransition(async () => {
      const response = await deleteStaffResignation(toDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete resignation record");
        return;
      }
      toast.success(
        response.message ?? "Resignation record deleted successfully",
      );
      setDeleteDialogOpen(false);
      setToDelete(null);
      router.refresh();
    });
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Staff Resignations
          </CardTitle>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
            {resignations.length} record{resignations.length > 1 ? "s" : ""}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          {!resignations || resignations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No resignation records found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Try adjusting the filters or add a new resignation record.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SN
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Staff
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Designation
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Resignation Date
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reason
                  </TableHead>
                  <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resignations.map((resignation, index) => (
                  <TableRow key={resignation.id} className="hover:bg-muted/40">
                    <TableCell className="text-center text-sm text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                            {getInitials(resignation.staff?.full_name ?? "ST")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <span className="block truncate text-sm font-medium text-foreground">
                            {resignation.staff?.full_name ?? "Unknown Staff"}
                          </span>
                          {resignation.staff?.phone && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {resignation.staff.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {resignation.staff?.designation?.name ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {formatDate(resignation.resignation_date)}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[280px]">
                      <p className="truncate text-sm text-muted-foreground">
                        {resignation.reason || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/employees/staffs/resignation-management/${resignation.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="View resignation"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link
                          href={`/dashboard/employees/staffs/resignation-management/${resignation.id}/edit`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit resignation"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                          onClick={() => handleDeleteClick(resignation)}
                          title="Delete resignation"
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
        title="Delete Resignation Record"
        description={
          toDelete
            ? `Are you sure you want to delete the resignation record for ${
                toDelete.staff?.full_name ?? "this staff"
              }? This action cannot be undone.`
            : "Are you sure you want to delete this resignation record? This action cannot be undone."
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

export default StaffResignationTable;
