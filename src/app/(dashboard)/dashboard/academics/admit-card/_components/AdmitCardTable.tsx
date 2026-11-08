"use client";

import { FileText, Users } from "lucide-react";
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
import { createAdmitCardLog } from "@/services/admitCardLog";
import AdmitCardPreview from "./AdmitCardPreview";
import { handleDownloadAdmitCardPdf } from "./admit-card-print";
import type { TAdmitEnrollment, TAdmitExam, TInstitutionInfo } from "./types";

interface AdmitCardTableProps {
  enrollments: TAdmitEnrollment[];
  currentPage: number;
  pageSize: number;
  exam: TAdmitExam | null;
  institution?: TInstitutionInfo | null;
}

const AdmitCardTable = ({
  enrollments,
  currentPage,
  pageSize,
  exam,
  institution,
}: AdmitCardTableProps) => {
  const handleDownload = (enrollment: TAdmitEnrollment) => {
    if (!exam) return;

    handleDownloadAdmitCardPdf({ enrollment, exam, institution });

    toast.success(
      `Admit card for ${enrollment.student?.name ?? "student"} sent to printer — choose "Save as PDF" to download.`,
    );

    // Fire-and-forget generation log (server keeps an audit trail)
    createAdmitCardLog({
      student_id: enrollment.student_id,
      exam_config_id: exam.id,
      status: "GIVEN",
    }).catch(() => {});
  };

  if (!exam) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-0">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              Select an exam to generate admit cards
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Choose a class, exam type, and exam year from the filters above.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  Admit Card Preview
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
                      <AdmitCardPreview
                        enrollment={enrollment}
                        exam={exam}
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
                    <span className="mt-1 block max-w-[140px] truncate rounded bg-blue-50 px-1.5 py-0.5 text-[11px] font-medium text-blue-700">
                      Exam: {exam.exam_name}
                    </span>
                  </TableCell>

                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full border-blue-200 bg-blue-50 px-3 text-xs text-blue-600 hover:bg-blue-100 hover:text-blue-700"
                      onClick={() => handleDownload(enrollment)}
                      type="button"
                      title="Download admit card as PDF (via print dialog)"
                    >
                      <FileText className="h-3.5 w-3.5" />
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

export default AdmitCardTable;
