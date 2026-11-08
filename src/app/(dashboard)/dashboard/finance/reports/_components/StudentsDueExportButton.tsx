"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { StudentDue } from "./types/dueReport";

interface StudentsDueExportButtonProps {
  students: StudentDue[];
}

const escapeCsv = (value: string | number) => {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

export function StudentsDueExportButton({
  students,
}: StudentsDueExportButtonProps) {
  const handleExport = () => {
    const headers = [
      "Student",
      "Class/Year",
      "Session",
      "Registration",
      "Phone",
      "Total Amount",
      "Paid",
      "Scholarship",
      "Fine",
      "Due",
    ];

    const rows = students.map((student) => [
      student.student_name,
      student.class_name,
      student.session_name,
      student.registration_number,
      student.student_phone,
      formatAmount(student.totalLineAmount),
      formatAmount(student.totalPaidAmount),
      formatAmount(student.totalDiscountAmount),
      formatAmount(student.totalFineAmount),
      formatAmount(student.dueAmount),
    ]);

    // Sum row at the bottom of the CSV
    const totalLine = students.reduce((sum, s) => sum + s.totalLineAmount, 0);
    const totalPaid = students.reduce((sum, s) => sum + s.totalPaidAmount, 0);
    const totalDiscount = students.reduce(
      (sum, s) => sum + s.totalDiscountAmount,
      0,
    );
    const totalFine = students.reduce((sum, s) => sum + s.totalFineAmount, 0);
    const totalDue = students.reduce((sum, s) => sum + s.dueAmount, 0);

    const totalRow = [
      "TOTAL",
      "",
      "",
      "",
      "",
      formatAmount(totalLine),
      formatAmount(totalPaid),
      formatAmount(totalDiscount),
      formatAmount(totalFine),
      formatAmount(totalDue),
    ];

    const csvContent = [headers, ...rows, totalRow]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `student-due-${new Date()
      .toISOString()
      .split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={students.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
