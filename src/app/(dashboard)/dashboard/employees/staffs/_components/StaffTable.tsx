"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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

import { deleteStaff } from "@/services/staff";
import { STAFF_TYPE_LABELS } from "@/constant/staff/staffType";
import { TStaff } from "@/types/modules/staff/staff.type";
import { Edit, Eye, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import ExportStaffsButton from "./ExportStaffsButton";

type StaffTableProps = {
  staffs: TStaff[];
  filter?: Record<string, string>;
  search?: string;
};

const StaffTable = ({ staffs, filter, search }: StaffTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<TStaff | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteClick = (staff: TStaff) => {
    setStaffToDelete(staff);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!staffToDelete) return;

    startTransition(async () => {
      const response = await deleteStaff(staffToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete staff");
        return;
      }
      toast.success(response.message ?? "Staff deleted successfully");
      setDeleteDialogOpen(false);
      setStaffToDelete(null);
      router.refresh();
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const labelMap: Record<string, string> = {
    ...STAFF_TYPE_LABELS,
  };

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Staffs</CardTitle>
          <ExportStaffsButton filter={filter} search={search} />
        </CardHeader>
        <CardContent className="p-0">
          {!staffs || staffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No staff found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Add a staff member to get started.
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
                    Name
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Designation
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Phone
                  </TableHead>
                  <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.map((staff, index) => (
                  <TableRow
                    key={staff.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={staff.photo}
                            alt={staff.full_name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(staff.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {staff.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                        {staff.staff_type
                          ? labelMap[staff.staff_type] ?? staff.staff_type
                          : "N/A"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {staff.designation?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {staff.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/employees/staffs/${staff.id}/view`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="View staff"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link
                          href={`/dashboard/employees/staffs/${staff.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit staff"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                          onClick={() => handleDeleteClick(staff)}
                          title="Delete staff"
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
        title="Delete Staff"
        description={
          staffToDelete
            ? `Are you sure you want to delete "${staffToDelete.full_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this staff member? This action cannot be undone."
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

export default StaffTable;