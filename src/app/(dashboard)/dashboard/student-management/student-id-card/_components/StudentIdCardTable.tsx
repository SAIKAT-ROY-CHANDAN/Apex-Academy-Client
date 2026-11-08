"use client";

import { IdCard, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createIDCardGenerateLog } from "@/services/idCardGenerateLog";
import IdCardFrontPreview from "./IdCardFrontPreview";
import { handleDownloadIdCardPdf } from "./id-card-print";
import type { TIdCardEnrollment, TInstitutionInfo } from "./types";

interface StudentIdCardTableProps {
  enrollments: TIdCardEnrollment[];
  currentPage: number;
  pageSize: number;
  institution?: TInstitutionInfo | null;
}

const StudentIdCardTable = ({
  enrollments,
  currentPage,
  pageSize,
  institution,
}: StudentIdCardTableProps) => {
  const handleDownload = (enrollment: TIdCardEnrollment) => {
    handleDownloadIdCardPdf({ enrollment, institution });

    toast.success(
      `ID card for ${enrollment.student?.name ?? "student"} sent to printer — choose "Save as PDF" to download.`,
    );

    // Fire-and-forget generation log (server keeps an audit trail)
    createIDCardGenerateLog({
      student_id: enrollment.student_id,
      generate_type: "GIVEN",
    }).catch(() => {});
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-0">
        {enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No students found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Adjust your filters to see enrolled students.
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
                  ID Card (Front Preview)
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Student
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Roll & REG
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Class/Year
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Session
                </TableHead>
                <TableHead className="h-10 w-28 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment, index) => (
                <TableRow
                  key={enrollment.id}
                  className="group transition-colors hover:bg-muted/20"
                >
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {(currentPage - 1) * pageSize + index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="py-1">
                      <IdCardFrontPreview
                        enrollment={enrollment}
                        institution={institution}
                      />
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    {enrollment.student?.name}
                    <div className="text-xs font-normal text-muted-foreground">
                      {enrollment.student?.student_phone ||
                        enrollment.student?.email ||
                        "—"}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-xs font-normal text-muted-foreground">
                      Roll: {enrollment.roll_number || "N/A"}
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">
                      REG: {enrollment.registration_number || "N/A"}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs">
                    {enrollment.academicClass?.class_name || "N/A"}
                    {enrollment.academicSection?.section_name && (
                      <span className="block text-muted-foreground">
                        Section: {enrollment.academicSection.section_name}
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground">
                    {enrollment.academicSession?.session_name || "N/A"}
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      onClick={() => handleDownload(enrollment)}
                      type="button"
                      title="Download ID card as PDF (via print dialog)"
                    >
                      <IdCard className="h-3.5 w-3.5" />
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default StudentIdCardTable;
