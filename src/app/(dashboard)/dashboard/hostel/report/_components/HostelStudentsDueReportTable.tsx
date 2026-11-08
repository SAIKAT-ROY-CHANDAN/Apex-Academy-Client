"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HostelStudentsDueReportRow } from "@/services/hostel-report/hostel-report";
import {
  AlertCircle,
  ArrowUpDown,
  Banknote,
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import PayDueModal from "./PayDueModal";

type HostelStudentsDueReportTableProps = {
  rows: HostelStudentsDueReportRow[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
};

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 2,
});

const formatMoney = (amount: number) => currency.format(amount);

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const PAGE_SIZE = 10;

const HostelStudentsDueReportTable = ({
  rows,
  currentPage,
  totalItems,
  totalPages,
}: HostelStudentsDueReportTableProps) => {
  const router = useRouter();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [payRow, setPayRow] = useState<HostelStudentsDueReportRow | null>(
    null,
  );
  const [payModalOpen, setPayModalOpen] = useState(false);

  const toggleExpand = (id: string) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  const openPayModal = (
    row: HostelStudentsDueReportRow,
    totalDueAmount: number,
  ) => {
    if (totalDueAmount <= 0) {
      return;
    }
    setPayRow(row);
    setPayModalOpen(true);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set("page", String(page));
    router.push(`?${params.toString()}`);
  };

  const computeRowTotals = (row: HostelStudentsDueReportRow) => {
    const dueCollectionCount = row.due_collections?.length ?? 0;
    const totalDueAmount = row.due_collections?.reduce(
      (sum, dc) => sum + Number(dc.due_amount ?? 0),
      0,
    ) ?? 0;
    return {
      dueCollectionCount,
      totalDueAmount: Number(totalDueAmount.toFixed(2)),
    };
  };

  const totalDueOfStudents = rows.reduce(
    (sum, row) => sum + Number(computeRowTotals(row).totalDueAmount),
    0,
  );

  return (
    <div className="space-y-6 pb-4">
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Hostel Students Due Report
          </CardTitle>
          {rows.length > 0 && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 dark:border-red-800/40 dark:bg-red-950/30">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Total Due
              </span>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {formatMoney(totalDueOfStudents)}
              </span>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No students with due found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Try adjusting your filters to see results.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                      <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        #
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          Student Info
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Guardian
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Gender
                      </TableHead>
                      <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Hostel
                      </TableHead>
                      <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Due Collections
                      </TableHead>
                      <TableHead className="h-10 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <span className="inline-flex items-center justify-end gap-1">
                          Total Due
                          <ArrowUpDown className="h-3 w-3" />
                        </span>
                      </TableHead>
                      <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, index) => {
                      const hostelName =
                        row.current_hostel_allocation?.hostelRoom
                          ?.hostelFloor?.hostelConfiguration?.name ||
                        row.current_hostel_allocation?.hostelRoom
                          ?.hostelFloor?.hostelConfiguration
                          ?.building_name ||
                        "N/A";
                      const roomNumber =
                        row.current_hostel_allocation?.hostelRoom
                          ?.room_number || "N/A";
                      const floorName =
                        row.current_hostel_allocation?.hostelRoom
                          ?.hostelFloor?.floor_name || "N/A";
                      const isExpanded = expandedRow === row.id;
                      const { dueCollectionCount, totalDueAmount } =
                        computeRowTotals(row);

                      return (
                        <>
                          <TableRow
                            key={row.id}
                            className="cursor-pointer transition-colors hover:bg-muted/20"
                            onClick={() => toggleExpand(row.id)}
                          >
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {(currentPage - 1) * PAGE_SIZE + index + 1}
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium text-foreground">
                                  {row.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  {row.student_phone && (
                                    <span className="inline-flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      {row.student_phone}
                                    </span>
                                  )}
                                  {row.email && (
                                    <span className="inline-flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      {row.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-0.5 text-sm">
                                <div className="text-foreground">
                                  <span className="text-muted-foreground">
                                    Father:{" "}
                                  </span>
                                  {row.father_name || "N/A"}
                                </div>
                                <div className="text-foreground">
                                  <span className="text-muted-foreground">
                                    Mother:{" "}
                                  </span>
                                  {row.mother_name || "N/A"}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={
                                  row.gender === "MALE"
                                    ? "border-blue-200 bg-blue-50 text-blue-700"
                                    : row.gender === "FEMALE"
                                      ? "border-pink-200 bg-pink-50 text-pink-700"
                                      : "border-slate-200 bg-slate-50 text-slate-700"
                                }
                              >
                                {row.gender || "N/A"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {row.is_residential ? (
                                <div className="space-y-0.5 text-sm">
                                  <div className="inline-flex items-center gap-1 font-medium text-foreground">
                                    <Building2 className="h-3.5 w-3.5 text-primary" />
                                    {hostelName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {floorName} • Room {roomNumber}
                                  </div>
                                </div>
                              ) : (
                                <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-500">
                                  Non-Residential
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-50 text-amber-700"
                              >
                                {dueCollectionCount} record
                                {dueCollectionCount !== 1 ? "s" : ""}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="inline-flex items-center gap-1.5 text-lg font-bold text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                {formatMoney(totalDueAmount)}
                              </div>
                            </TableCell>
                            <TableCell
                              className="text-center"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Button
                                type="button"
                                size="sm"
                                onClick={() =>
                                  openPayModal(row, totalDueAmount)
                                }
                                className="h-8 gap-1 rounded-full bg-emerald-600 hover:bg-emerald-700"
                                title="Pay due"
                              >
                                <Banknote className="h-3.5 w-3.5" />
                                Pay Due
                              </Button>
                            </TableCell>
                          </TableRow>
                          {isExpanded && row.due_collections.length > 0 && (
                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                              <TableCell colSpan={8} className="p-0">
                                <div className="p-4 pl-12">
                                  <div className="mb-3 text-sm font-semibold text-foreground">
                                    Due Collection Details
                                  </div>
                                  <div className="overflow-hidden rounded-lg border border-border/50">
                                    <Table>
                                      <TableHeader>
                                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                                          <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Collection Date
                                          </TableHead>
                                          <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Total Amount
                                          </TableHead>
                                          <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Paid Amount
                                          </TableHead>
                                          <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                            Due Amount
                                          </TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {row.due_collections.map((dc) => (
                                          <TableRow
                                            key={dc.id}
                                            className="hover:bg-muted/20"
                                          >
                                            <TableCell className="text-sm text-foreground">
                                              {formatDate(dc.collection_date)}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-foreground">
                                              {formatMoney(dc.total_amount)}
                                            </TableCell>
                                            <TableCell className="text-right text-sm text-green-600">
                                              {formatMoney(dc.paid_amount)}
                                            </TableCell>
                                            <TableCell className="text-right text-sm font-semibold text-red-600">
                                              {formatMoney(dc.due_amount)}
                                            </TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-border/50 px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * PAGE_SIZE + 1} -{" "}
                  {Math.min(currentPage * PAGE_SIZE, totalItems)} of{" "}
                  {totalItems} students
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="h-8 gap-1"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="h-8 gap-1"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>

        <PayDueModal
          row={payRow}
          totalDue={
            payRow
              ? (payRow.due_collections?.reduce(
                  (sum, dc) => sum + Number(dc.due_amount ?? 0),
                  0,
                ) ?? 0)
              : 0
          }
          open={payModalOpen}
          onOpenChange={setPayModalOpen}
          onPaid={() => router.refresh()}
        />
      </Card>
    </div>
  );
};

export default HostelStudentsDueReportTable;
