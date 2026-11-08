"use client";

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  User,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { approveStudent, rejectStudent } from "@/services/student";

export type TPendingStudent = {
  id: string;
  name: string;
  father_name: string;
  mother_name: string;
  gender: string;
  nid_no: string | null;
  student_phone: string | null;
  father_phone: string;
  mother_phone: string | null;
  email: string | null;
  photo: string | null;
  village_road: string | null;
  post_office: string | null;
  sub_district: string;
  district: string;
  religion: string | null;
  created_at: string;
};

interface ApprovalTableProps {
  students: TPendingStudent[];
  currentPage: number;
  totalItems: number;
  totalPages?: number;
}

const PAGE_SIZE = 10;

const ApprovalTable = ({
  students,
  currentPage,
  totalItems,
  totalPages,
}: ApprovalTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionDialog, setActionDialog] = useState<{
    student: TPendingStudent;
    action: "approve" | "reject";
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const query = searchQuery.toLowerCase();
    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(query) ||
        student.email?.toLowerCase().includes(query) ||
        student.student_phone?.toLowerCase().includes(query) ||
        student.nid_no?.toLowerCase().includes(query),
    );
  }, [students, searchQuery]);

  const canGoNext = totalPages
    ? currentPage < totalPages
    : students.length === PAGE_SIZE;

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const handleConfirm = () => {
    if (!actionDialog) return;

    const { student, action } = actionDialog;

    startTransition(async () => {
      const response =
        action === "approve"
          ? await approveStudent(student.id)
          : await rejectStudent(student.id);

      if (!response.success) {
        toast.error(response.message ?? "Action failed");
        return;
      }

      toast.success(
        action === "approve" ? "Application approved" : "Application rejected",
      );
      setActionDialog(null);
      router.refresh();
    });
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            {totalItems} pending application(s) awaiting your review
          </p>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone..."
            className="w-full rounded-lg border border-slate-200 px-4 py-2 text-sm outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800 sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Father</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>NID No.</TableHead>
                <TableHead>Applied On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-12 text-center text-slate-400"
                  >
                    No pending applications.
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700">
                          <User className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">
                            {student.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {student.gender}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs text-slate-500">
                        <p className="flex items-center gap-1.5">
                          <Mail className="h-3 w-3" />
                          {student.email ?? "—"}
                        </p>
                        <p className="flex items-center gap-1.5">
                          <Phone className="h-3 w-3" />
                          {student.student_phone ?? student.father_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-slate-600">
                        {student.father_name}
                      </p>
                      <p className="text-xs text-slate-400">
                        {student.father_phone}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="flex items-center gap-1.5 text-xs text-slate-500">
                        <MapPin className="h-3 w-3" />
                        {student.sub_district}, {student.district}
                      </p>
                    </TableCell>
                    <TableCell className="text-sm text-slate-600">
                      {student.nid_no ?? "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {new Date(student.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setActionDialog({ student, action: "approve" })
                          }
                        >
                          <Check className="mr-1 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            setActionDialog({ student, action: "reject" })
                          }
                        >
                          <X className="mr-1 h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalItems > PAGE_SIZE && (
          <div className="flex items-center justify-between border-t px-4 py-3">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <ChevronLeft className="mr-1 h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-slate-500">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={!canGoNext}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!actionDialog}
        onOpenChange={(open) => !open && setActionDialog(null)}
        variant={actionDialog?.action === "reject" ? "destructive" : "default"}
        title={
          actionDialog?.action === "approve"
            ? "Approve application"
            : "Reject application"
        }
        description={
          actionDialog?.action === "approve"
            ? `Approve ${actionDialog?.student.name}'s registration? They will be able to log in immediately.`
            : `Reject ${actionDialog?.student.name}'s registration? They will not be able to log in.`
        }
        confirmLabel={actionDialog?.action === "approve" ? "Approve" : "Reject"}
        onConfirm={handleConfirm}
        isPending={isPending}
      />
    </Card>
  );
};

export default ApprovalTable;
