"use client";

import {
  ArrowRightCircle,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Layers,
  ReceiptText,
  ShieldAlert,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import StudentBulkCollectDialog, {
  type BulkDueRow,
} from "./StudentBulkCollectDialog";

const MONTH_ENUMS = [
  "JANUARY",
  "FEBRUARY",
  "MARCH",
  "APRIL",
  "MAY",
  "JUNE",
  "JULY",
  "AUGUST",
  "SEPTEMBER",
  "OCTOBER",
  "NOVEMBER",
  "DECEMBER",
];

interface FeeItemGroup {
  feeItemId: string;
  feeItemName: string;
  feeTypeId: string;
  entries: BulkDueRow[];
  totalDue: number;
}

const buildDueRows = (
  student: any,
): {
  allRows: BulkDueRow[];
  groups: FeeItemGroup[];
  droppedUnbilledCount: number;
} => {
  const norm = (month?: string | null) =>
    (month ?? "").slice(0, 3).toUpperCase();

  const toEnum = (short: string) =>
    MONTH_ENUMS.find((m) => m.startsWith(short)) ?? "";

  const rows: BulkDueRow[] = [];

  // 1. Billed items with remaining due
  student.studentFeeCollections?.forEach((collection: any) => {
    collection.studentFeeCollectionItems?.forEach((item: any) => {
      const due = Math.max(
        0,
        item.line_total_amount +
          (item.fine_amount ?? 0) -
          item.paid_amount -
          item.discount_amount,
      );
      if (due <= 0 || !item.feeItem) return;

      const isMonthly = Boolean(item.fee_month && item.fee_year);
      const monthKey = norm(item.fee_month);
      const monthEnum = toEnum(monthKey);

      rows.push({
        key: `billed-${item.id}`,
        name: item.feeItem.name,
        label: isMonthly
          ? `${item.fee_month?.charAt(0)}${item.fee_month?.slice(1).toLowerCase()} ${item.fee_year}`
          : "One-time",
        max: due,
        billed: true,
        collectionItemId: item.id,
        feeItemId: item.feeItem.id,
        feeTypeId: collection.fee_type_id,
        monthEnum: isMonthly ? monthEnum : null,
        year: isMonthly ? item.fee_year : null,
      });
    });
  });

  // 2. Unbilled monthly expectations (from structure-derived breakdown).
  const feeTypeByItemId = new Map<string, string>();
  rows.forEach((row) => {
    if (row.billed && row.feeItemId && row.feeTypeId) {
      feeTypeByItemId.set(row.feeItemId, row.feeTypeId);
    }
  });

  const billedSlots = new Set(
    rows.map((row) => `${row.feeItemId}-${row.year}-${norm(row.monthEnum)}`),
  );
  let droppedUnbilledCount = 0;
  (student.feeSummary?.monthlyBreakdown ?? []).forEach((period: any) => {
    (period.items ?? []).forEach((pi: any) => {
      if (pi.dueAmount <= 0) return;
      const slot = `${pi.feeItemId}-${period.year}-${norm(period.month)}`;
      if (billedSlots.has(slot)) return;

      const resolvedFeeTypeId =
        pi.feeTypeId ?? feeTypeByItemId.get(pi.feeItemId);
      if (!resolvedFeeTypeId) {
        droppedUnbilledCount += 1;
        return;
      }

      rows.push({
        key: `unbilled-${pi.feeItemId}-${period.year}-${norm(period.month)}`,
        name: pi.feeItemName,
        label: `${period.month.charAt(0)}${period.month.slice(1).toLowerCase()} ${period.year}`,
        max: pi.amount,
        billed: false,
        feeItemId: pi.feeItemId,
        feeTypeId: resolvedFeeTypeId,
        monthEnum: toEnum(norm(period.month)),
        year: period.year,
      });
    });
  });

  // 3. Unbilled one-time fees
  (student.unbilledOneTimeFees ?? []).forEach((fee: any) => {
    rows.push({
      key: `unbilled-ot-${fee.id}`,
      name: fee.name,
      label: "One-time",
      max: fee.amount,
      billed: false,
      feeItemId: fee.id,
      feeTypeId: fee.fee_type_id,
      monthEnum: null,
      year: null,
    });
  });

  // Group by fee item
  const groupMap = new Map<string, FeeItemGroup>();
  rows.forEach((row) => {
    const { feeItemId, feeTypeId } = row;
    if (!feeItemId || !feeTypeId) return;
    const group = groupMap.get(feeItemId) ?? {
      feeItemId,
      feeItemName: row.name,
      feeTypeId,
      entries: [],
      totalDue: 0,
    };
    group.entries.push(row);
    group.totalDue += row.max;
    groupMap.set(feeItemId, group);
  });

  const groups = [...groupMap.values()].sort((a, b) => b.totalDue - a.totalDue);

  return { allRows: rows, groups, droppedUnbilledCount };
};

export default function FeeDueCards({ API_RESPONSE }: any) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRows, setDialogRows] = useState<BulkDueRow[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const taka = (amount: number) => {
    return `৳${new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(amount || 0)}`;
  };

  const { allRows, groups, droppedUnbilledCount } = useMemo(
    () => buildDueRows(API_RESPONSE ?? {}),
    [API_RESPONSE],
  );

  const totalDue = allRows.reduce((sum, row) => sum + row.max, 0);
  const billedDue = allRows
    .filter((row) => row.billed)
    .reduce((sum, row) => sum + row.max, 0);
  const unbilledDue = totalDue - billedDue;

  const openGlobalDialog = () => {
    setDialogTitle("Pay All Dues");
    setDialogDescription(
      "Pay all outstanding balances and unbilled cycles. You can adjust the payment amounts for each month inside the list below before confirming.",
    );
    setDialogRows(allRows);
    setDialogOpen(true);
  };

  const openGroupDialog = (group: FeeItemGroup) => {
    setDialogTitle(`Settle Dues — ${group.feeItemName}`);
    setDialogDescription(
      `Pay outstanding balances for this fee item across all pending cycles (${group.entries.length} pending entry/entries).`,
    );
    setDialogRows(group.entries);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Student Financial Account
          </p>
          <h2
            className="text-2xl font-black text-slate-900 mt-1"
            style={{
              fontFamily: "ui-serif, Georgia, 'Times New Roman', serif",
            }}
          >
            Fee Summary & Dues
          </h2>
          <p className="text-slate-500 text-xs mt-1">
            View details of all billed and unbilled monthly expectations. Select
            "Pay All" to settle dues in one simple pass.
          </p>
        </div>
        {totalDue > 0 && (
          <Button
            onClick={openGlobalDialog}
            className="w-full sm:w-auto gap-2 bg-rose-600 text-white hover:bg-rose-500 rounded-xl px-5 py-5 shadow-soft hover:shadow-glow transition-all duration-200"
          >
            <Banknote className="h-5 w-5" />
            <span className="font-semibold text-sm">
              Pay All Dues — {taka(totalDue)}
            </span>
          </Button>
        )}
      </div>

      {totalDue === 0 ? (
        <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-950">All Cleared!</p>
              <p className="text-sm text-slate-500 mt-1">
                No outstanding fees found. Your account is fully settled.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Total Outstanding */}
            <Card className="border-0 bg-gradient-to-br from-rose-500 to-red-600 text-white rounded-2xl shadow-soft">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white backdrop-blur-md">
                  <Wallet className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-rose-100 uppercase tracking-wide">
                    Total Outstanding
                  </p>
                  <p className="text-2xl font-black tabular-nums mt-0.5">
                    {taka(totalDue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Billed Dues */}
            <Card className="border border-slate-100 bg-white rounded-2xl shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <ReceiptText className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Billed Dues
                  </p>
                  <p className="text-xl font-bold tabular-nums text-slate-800 mt-0.5">
                    {taka(billedDue)}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Unbilled Dues */}
            <Card className="border border-slate-100 bg-white rounded-2xl shadow-sm">
              <CardContent className="flex items-center gap-4 p-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 border border-amber-100">
                  <Layers className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Unbilled Expectations
                  </p>
                  <p className="text-xl font-bold tabular-nums text-amber-600 mt-0.5">
                    {taka(unbilledDue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dues by Fee Item */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white overflow-hidden">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
              <CardTitle className="text-base font-bold text-slate-900">
                Outstanding Balance by Fee Item
              </CardTitle>
              <CardDescription className="text-xs">
                Review specific unbilled months or dues. One-click lets you
                settle all pending periods of that fee.
              </CardDescription>
            </CardHeader>
            {droppedUnbilledCount > 0 && (
              <div className="flex items-center gap-2 border-b border-amber-200 bg-amber-50 px-5 py-3 text-xs font-semibold text-amber-700">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {droppedUnbilledCount} unbilled cycle
                  {droppedUnbilledCount > 1 ? "s" : ""} could not be resolved to
                  class fee configurations.
                </span>
              </div>
            )}
            <CardContent className="divide-y divide-slate-100 p-0">
              {groups.map((group) => {
                const unbilledCount = group.entries.filter(
                  (e) => !e.billed,
                ).length;
                return (
                  <div
                    key={group.feeItemId}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between p-5 hover:bg-slate-50/30 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-slate-900">
                        {group.feeItemName}
                      </p>

                      {/* Render pending months as tags */}
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {group.entries.map((entry) => (
                          <span
                            key={entry.key}
                            className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              entry.billed
                                ? "bg-slate-50 text-slate-500 border-slate-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            <CalendarDays className="h-3 w-3" />
                            {entry.label}
                          </span>
                        ))}
                      </div>

                      <p className="mt-2 text-xs text-slate-400">
                        {group.entries.length} pending period
                        {group.entries.length > 1 ? "s" : ""}
                        {unbilledCount > 0 && (
                          <span className="ml-1.5 font-semibold text-amber-600">
                            (includes {unbilledCount} unbilled month
                            {unbilledCount > 1 ? "s" : ""})
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-5 mt-2 sm:mt-0 border-t border-slate-100 pt-3 sm:border-0 sm:pt-0">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">
                          Total Due
                        </p>
                        <p className="text-base font-black tabular-nums text-rose-600 mt-0.5">
                          {taka(group.totalDue)}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openGroupDialog(group)}
                        className="gap-1 border-rose-100 hover:border-rose-200 text-xs font-semibold text-rose-600 bg-rose-50/50 hover:bg-rose-50 hover:text-rose-700 rounded-lg h-9 px-4 transition-all duration-150"
                      >
                        <ArrowRightCircle className="h-4 w-4" />
                        Pay All
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </>
      )}

      {/* Bulk Payment Dialog */}
      <StudentBulkCollectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentId={API_RESPONSE?.id}
        title={dialogTitle}
        description={dialogDescription}
        rows={dialogRows}
        studentName={API_RESPONSE?.name}
        className={
          API_RESPONSE?.studentEnrollments?.[0]?.academicClass?.class_name ??
          undefined
        }
        studentPhone={API_RESPONSE?.student_phone}
      />
    </div>
  );
}
