"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CollectionRecord } from "./types/collectionReport";

interface CollectionRecordsExportButtonProps {
  records: CollectionRecord[];
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

export function CollectionRecordsExportButton({
  records,
}: CollectionRecordsExportButtonProps) {
  const handleExport = () => {
    const headers = [
      "Student",
      "Class/Year",
      "Fee Item",
      "Collection Date",
      "Paid Amount",
      "Scholarship",
      "Fine",
      "Line Total",
    ];

    const rows = records.map((record) => [
      record.student_name,
      record.class_name,
      record.fee_item_name,
      record.collection_date,
      formatAmount(record.paid_amount),
      formatAmount(record.discount_amount),
      formatAmount(record.fine_amount),
      formatAmount(record.line_total_amount),
    ]);

    // Sum row at the bottom of the CSV
    const totalPaid = records.reduce((sum, r) => sum + r.paid_amount, 0);
    const totalScholarship = records.reduce(
      (sum, r) => sum + r.discount_amount,
      0,
    );
    const totalFine = records.reduce((sum, r) => sum + r.fine_amount, 0);
    const totalLine = records.reduce((sum, r) => sum + r.line_total_amount, 0);

    const totalRow = [
      "TOTAL",
      "",
      "",
      "",
      formatAmount(totalPaid),
      formatAmount(totalScholarship),
      formatAmount(totalFine),
      formatAmount(totalLine),
    ];

    const csvContent = [headers, ...rows, totalRow]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `collection-records-${new Date()
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
      disabled={records.length === 0}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
