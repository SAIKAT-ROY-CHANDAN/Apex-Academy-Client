"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Receipt } from "lucide-react";
import Link from "next/link";
import { HostelExpense } from "./types/hostelExpense";

type HostelExpenseDetailsProps = {
  expense: HostelExpense;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const formatDate = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const formatDateTime = (date?: string) => {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const HostelExpenseDetails = ({ expense }: HostelExpenseDetailsProps) => {
  const items = expense.hostelExpenseItems ?? [];

  const infoItems = [
    { label: "Expense Date", value: formatDate(expense.expense_date) },
    { label: "Total Amount", value: formatAmount(Number(expense.total_amount)) },
    { label: "Expense By", value: "Admin" },
    { label: "Created At", value: formatDateTime(expense.created_at) },
    { label: "Last Updated", value: formatDateTime(expense.updated_at) },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Receipt className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">
                  Expense Details
                </CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  View hostel expense information and item breakdown.
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {infoItems.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border/50 bg-slate-50/50 p-4 dark:bg-slate-900/20"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Expense Items</CardTitle>
          <CardDescription>
            {items.length} item{items.length !== 1 ? "s" : ""} included in this
            expense
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">
              No items found for this expense.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-16 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SL No.
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Item Name
                  </TableHead>
                  <TableHead className="h-10 w-40 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item, index) => (
                  <TableRow key={item.id ?? `${item.item_name}-${index}`}>
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {item.item_name}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold text-primary">
                      {formatAmount(Number(item.item_amount))}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableCell
                    colSpan={2}
                    className="text-right text-sm font-semibold"
                  >
                    Total
                  </TableCell>
                  <TableCell className="text-right text-sm font-bold text-primary">
                    {formatAmount(Number(expense.total_amount))}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default HostelExpenseDetails;
