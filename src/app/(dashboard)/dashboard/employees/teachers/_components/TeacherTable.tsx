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

import { deleteTeacher } from "@/services/teacher";
import { TTeacher } from "@/types/modules/teacher/teacher.type";
import { Edit, Eye, Trash2, Users } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ADMINISTRATIVE_POSITION_LABELS } from "../_constants";
import { formatTeacherType } from "@/constant/teacher/teacherType";
import ExportTeachersButton from "./ExportTeachersButton";

type TeacherTableProps = {
  teachers: TTeacher[];
  filter?: Record<string, string>;
  search?: string;
};

const TeacherTable = ({ teachers, filter, search }: TeacherTableProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<TTeacher | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDeleteClick = (teacher: TTeacher) => {
    setTeacherToDelete(teacher);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!teacherToDelete) return;

    startTransition(async () => {
      const response = await deleteTeacher(teacherToDelete.id);

      if (!response.success) {
        toast.error(response.message ?? "Failed to delete teacher");
        return;
      }
      toast.success(response.message ?? "Teacher deleted successfully");
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
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

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">Teachers</CardTitle>
          <ExportTeachersButton filter={filter} search={search} />
        </CardHeader>
        <CardContent className="p-0">
          {!teachers || teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No teachers found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Add a teacher to get started.
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
                    Department
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Admin Position
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shift
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
                {teachers.map((teacher, index) => (
                  <TableRow
                    key={teacher.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={teacher.photo}
                            alt={teacher.full_name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(teacher.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {teacher.full_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {formatTeacherType(teacher.teacher_type)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.designation?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.department?.department_name ||
                        (teacher.department as any)?.name ||
                        "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.administrative_position
                        ? ADMINISTRATIVE_POSITION_LABELS[
                            teacher.administrative_position
                          ] ?? teacher.administrative_position
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.shift?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.phone}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/dashboard/employees/teachers/${teacher.id}/view`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="View teacher"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Link
                          href={`/dashboard/employees/teachers/${teacher.id}`}
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            title="Edit teacher"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:text-destructive hover:opacity-100"
                          onClick={() => handleDeleteClick(teacher)}
                          title="Delete teacher"
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
        title="Delete Teacher"
        description={
          teacherToDelete
            ? `Are you sure you want to delete "${teacherToDelete.full_name}"? This action cannot be undone.`
            : "Are you sure you want to delete this teacher? This action cannot be undone."
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

export default TeacherTable;
