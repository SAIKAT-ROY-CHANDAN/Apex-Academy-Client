"use client";

import { useState } from "react";
import { MoreHorizontalIcon, ChevronLeft, ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TStudentAttendance } from "@/types/students";
import { studentsData } from "@/constant/teacher/studentsData";
import { Input } from "@base-ui/react";

// Standard way to render an enum/status field: map each possible
// value to its label + style once, instead of dumping raw text in the cell.
const ATTENDANCE_STATUS_MAP: Record<
  NonNullable<TStudentAttendance["attendance"]> | "unmarked",
  { label: string; className: string }
> = {
  present: {
    label: "Present",
    className: "bg-blue-600 text-white hover:bg-blue-600",
  },
  absent: {
    label: "Absent",
    className: "bg-red-600 text-white hover:bg-red-600",
  },
  unmarked: {
    label: "Not marked",
    className: "bg-muted text-muted-foreground hover:bg-muted",
  },
};

function AttendanceBadge({
  status,
}: {
  status: TStudentAttendance["attendance"];
}) {
  const config = ATTENDANCE_STATUS_MAP[status ?? "unmarked"];

  return <Badge className={config.className}>{config.label}</Badge>;
}

// Builds the page-number list with ellipses, e.g. [1,2,3,"...",8,9,10]
function getPageList(
  currentPage: number,
  totalPages: number,
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const showRange = 1; // how many neighbours to show around current page

  for (let page = 1; page <= totalPages; page++) {
    const isFirst = page === 1;
    const isLast = page === totalPages;
    const isNearCurrent = Math.abs(page - currentPage) <= showRange;

    if (isFirst || isLast || isNearCurrent) {
      pages.push(page);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return pages;
}

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const pages = getPageList(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
      <Button
        variant="outline"
        className="h-8 rounded-md text-xs"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="size-4" />
        Previous
      </Button>

      <div className="flex items-center gap-1">
        {pages.map((page, idx) =>
          page === "..." ? (
            <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={
                page === currentPage
                  ? "size-8 rounded-md bg-blue-600 text-white text-sm font-medium"
                  : "size-8 rounded-md text-sm font-medium text-muted-foreground hover:bg-muted"
              }
            >
              {page}
            </button>
          ),
        )}
      </div>

      <Button
        variant="outline"
        className="h-8 rounded-md text-xs"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
        <ChevronRight className="size-4" />
      </Button>
    </div>
  );
}

const PAGE_SIZE = 10;

export function ResultTable() {
  const studentData: any = studentsData;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(studentData.length / PAGE_SIZE));
  const paginatedData = studentData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 hover:bg-muted/30">
            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Name</TableHead>
            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Student Id</TableHead>
            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Total Marks</TableHead>
            <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Obtained Marks</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.map((student: any) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">
                {student.studentName}
              </TableCell>
              <TableCell>{student.studentId}</TableCell>
              <TableCell>{student.totalMarks}</TableCell>
              <TableCell>
                <Input
                  type="number"
                  min="0"
                  max={student.totalMarks}
                  className="h-9 rounded-lg border border-input px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
      <div className="border-t border-border/50 p-4">
        <Input
          type="submit"
          value="Submit"
          className="h-10 w-full rounded-lg bg-blue-600 px-2 py-1 text-white hover:bg-blue-700"
        />
      </div>
    </div>
  );
}
