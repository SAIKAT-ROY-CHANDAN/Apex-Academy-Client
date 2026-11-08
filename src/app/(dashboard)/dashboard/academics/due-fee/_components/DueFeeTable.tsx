"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";

export type DueFeeRow = {
  id: string;
  name: string;
  photo: string | null;
  className: string;
  departmentName: string;
  batchName: string;
  yearLabel: string;
  sectionName: string;
  dueAmount: number;
  created_at?: string;
};

type DueFeeTableProps = {
  rows: DueFeeRow[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

const PAGE_SIZE = 10;

function formatAmount(value: number): string {
  return new Intl.NumberFormat("en-BD").format(value);
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function buildPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [1];
  if (current > 3) pages.push("...");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("...");
  pages.push(total);
  return pages;
}

export default function DueFeeTable({ rows, loading, currentPage, totalPages, totalItems, onPageChange }: DueFeeTableProps) {
  if (loading) {
    return (
      <Card className="border-slate-200 shadow-sm">
        <CardContent className="p-0">
          <div className="py-16 text-center text-sm text-muted-foreground">Loading due fees…</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardContent className="p-0">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <FileText className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">No due fees found.</p>
            <p className="mt-1 text-xs text-muted-foreground/60">Try adjusting your filters or date range.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 hover:bg-slate-50">
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">SL No.</TableHead>
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">Name</TableHead>
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">Class</TableHead>
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">Group/Department</TableHead>
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">Batch</TableHead>
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">Year</TableHead>
                    <TableHead className="h-11 text-xs font-semibold uppercase tracking-wider text-slate-500">Section</TableHead>
                    <TableHead className="h-11 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Due Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => (
                    <TableRow key={row.id} className="hover:bg-slate-50/60">
                      <TableCell className="text-sm text-slate-600">{(currentPage - 1) * PAGE_SIZE + index + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {row.photo ? <AvatarImage src={row.photo} alt={row.name} /> : null}
                            <AvatarFallback className="bg-slate-100 text-xs font-semibold text-slate-600">
                              {getInitials(row.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-slate-800">{row.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{row.className}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.departmentName}</TableCell>
                      <TableCell className="text-sm text-slate-600">{row.batchName}</TableCell>
                      <TableCell className="text-sm text-slate-600">
                        {String(row.yearLabel).match(/^\d+$/) ? `${row.yearLabel}${Number(row.yearLabel) === 1 ? "st" : Number(row.yearLabel) === 2 ? "nd" : Number(row.yearLabel) === 3 ? "rd" : "th"}` : row.yearLabel}
                      </TableCell>
                      <TableCell className="text-sm text-slate-600">{row.sectionName}</TableCell>
                      <TableCell className="text-right text-sm font-semibold text-rose-600">৳ {formatAmount(row.dueAmount)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination at bottom: Previous / page numbers (with ellipsis) / Next */}
            <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-slate-500">Showing {Math.min((currentPage - 1) * PAGE_SIZE + 1, totalItems)}–{Math.min(currentPage * PAGE_SIZE, totalItems)} of {totalItems}</p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200" disabled={currentPage === 1} onClick={() => onPageChange(Math.max(1, currentPage - 1))}>
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {buildPageNumbers(currentPage, totalPages).map((p, idx) =>
                    p === "..." ? (
                      <span key={`ellipsis-${idx}`} className="px-2 text-xs text-slate-400">…</span>
                    ) : (
                      <Button
                        key={p}
                        variant={currentPage === p ? "default" : "outline"}
                        size="sm"
                        className={`h-8 w-8 rounded-lg p-0 ${currentPage === p ? "bg-blue-600 text-white hover:bg-blue-700" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"}`}
                        onClick={() => onPageChange(p as number)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)}>
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
