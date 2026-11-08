"use client";

import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  CheckCircle2,
  Layers,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import BulkCollectDialog, { type BulkDueRow } from "./BulkCollectDialog";
import type { TStudentWithFeeCollections, TUnbilledOneTimeFee } from "./types";

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

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

interface FeeItemGroup {
  feeItemId: string;
  feeItemName: string;
  feeTypeId: string;
  entries: BulkDueRow[];
  totalDue: number;
}

const buildDueRows = (
  student: TStudentWithFeeCollections,
): {
  allRows: BulkDueRow[];
  groups: FeeItemGroup[];
  supplementaryGroups: FeeItemGroup[];
  droppedUnbilledCount: number;
} => {
  const norm = (month?: string | null) =>
    (month ?? "").slice(0, 3).toUpperCase();

  const toEnum = (short: string) =>
    MONTH_ENUMS.find((m) => m.startsWith(short)) ?? "";

  const rows: BulkDueRow[] = [];
  const supplementaryRows: BulkDueRow[] = [];

  // 1. Billed items with remaining due
  student.studentFeeCollections.forEach((collection) => {
    collection.studentFeeCollectionItems.forEach((item) => {
      const due = Math.max(
        0,
        item.line_total_amount +
          (item.fine_amount ?? 0) -
          item.paid_amount -
          item.discount_amount,
      );
      if (due <= 0 || !item.feeItem) return;
      // Skip supplementary fees - handled in separate table
      if (item.feeItem.fee_assign_for === "SUPPLEMENTARY") {
        supplementaryRows.push({
          key: `billed-${item.id}`,
          name: item.feeItem.name,
          label: `Supplementary${item.feeItem.subject_fail_count ? ` · ${item.feeItem.subject_fail_count} subject(s)` : ""}`,
          max: due,
          billed: true,
          collectionItemId: item.id,
          feeItemId: item.feeItem.id,
          feeTypeId: collection.fee_type_id,
          monthEnum: null,
          year: null,
          student_enrollment_id: item.student_enrollment_id ?? null,
          subject_fail_count: item.feeItem.subject_fail_count ?? null,
        });
        return;
      }

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
  // feeTypeId normally comes from the API; fall back to the fee item's own
  // billed records so nothing is silently dropped on older API payloads.
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
  (student.feeSummary?.monthlyBreakdown ?? []).forEach((period) => {
    (period.items ?? []).forEach((pi) => {
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

  // 3. Unbilled one-time fees (REGULAR only, supplementary handled separately)
  (student.unbilledOneTimeFees ?? []).forEach((fee: TUnbilledOneTimeFee) => {
    if (fee.fee_assign_for === "SUPPLEMENTARY") return;
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

  // 4. Unbilled supplementary fees - enrollment-aware composite key
  (student.unbilledOneTimeFees ?? []).forEach((fee: TUnbilledOneTimeFee) => {
    if (fee.fee_assign_for !== "SUPPLEMENTARY") return;
    const src = (fee as any).source_enrollment_id ?? null;
    const failCount = (fee as any).subject_fail_count ?? fee.subject_fail_count ?? null;
    const labelDetail = failCount ? `Supplementary · ${failCount} subject(s)${(fee as any).supplementary_class_name ? ` · ${(fee as any).supplementary_class_name}` : ""}` : `Supplementary${(fee as any).supplementary_class_name ? ` · ${(fee as any).supplementary_class_name}` : ""}`;
    supplementaryRows.push({
      key: `unbilled-ot-${fee.id}:${src ?? "null"}`,
      name: fee.name,
      label: labelDetail,
      max: fee.amount,
      billed: false,
      feeItemId: fee.id,
      feeTypeId: fee.fee_type_id,
      monthEnum: null,
      year: null,
      student_enrollment_id: src,
      subject_fail_count: failCount,
    });
  });

  // Group by fee item (regular)
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

  // Group supplementary fees - composite enrollment+feeItem to keep attempts separate
  const supplementaryGroupMap = new Map<string, FeeItemGroup>();
  supplementaryRows.forEach((row) => {
    const { feeItemId, feeTypeId } = row;
    if (!feeItemId || !feeTypeId) return;
    const composite = `${feeItemId}:${(row as any).student_enrollment_id ?? "null"}`;
    const group = supplementaryGroupMap.get(composite) ?? {
      feeItemId,
      feeItemName: row.name,
      feeTypeId,
      entries: [],
      totalDue: 0,
    };
    group.entries.push(row);
    group.totalDue += row.max;
    supplementaryGroupMap.set(composite, group);
  });

  const groups = [...groupMap.values()].sort((a, b) => b.totalDue - a.totalDue);
  const supplementaryGroups = [...supplementaryGroupMap.values()].sort((a, b) => b.totalDue - a.totalDue);

return { allRows: rows, groups, supplementaryGroups, droppedUnbilledCount };
};

const PayDuesView = ({ student }: { student: TStudentWithFeeCollections }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogRows, setDialogRows] = useState<BulkDueRow[]>([]);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogDescription, setDialogDescription] = useState("");

  const { allRows, groups, supplementaryGroups, droppedUnbilledCount } = useMemo(
    () => buildDueRows(student),
    [student],
  );
  const totalDue = allRows.reduce((sum, row) => sum + row.max, 0);
  const billedDue = allRows
    .filter((row) => row.billed)
    .reduce((sum, row) => sum + row.max, 0);
  const unbilledDue = totalDue - billedDue;

  const openGlobalDialog = () => {
    setDialogTitle("Pay All Dues");
    setDialogDescription(
      "Every outstanding amount will be distributed to its individual fee item — already-billed items get their dues paid, unbilled expectations are billed and collected in one pass.",
    );
    setDialogRows(allRows);
    setDialogOpen(true);
  };

  const openGroupDialog = (group: FeeItemGroup) => {
    setDialogTitle(`Pay All — ${group.feeItemName}`);
    setDialogDescription(
      `All pending amounts for this fee item (${group.entries.length} entr${group.entries.length > 1 ? "ies" : "y"}) will be settled together.`,
    );
    setDialogRows(group.entries);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/student-management/fee-collection/${student.id}`}
          >
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-semibold">Bulk Fee Collection</h1>
            <p className="text-sm text-muted-foreground">
              {student.name} &middot; settle multiple dues in one action
            </p>
          </div>
        </div>
        {totalDue > 0 && (
          <Button
            onClick={openGlobalDialog}
            className="border-red-500/40 bg-red-500/10 text-red-600 hover:bg-red-500/20 hover:text-red-700"
            variant="outline"
          >
            <Banknote className="mr-1.5 h-4 w-4" />
            Pay All — {formatAmount(totalDue)}
          </Button>
        )}
      </div>

      {totalDue === 0 ? (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium text-green-600">
              All cleared — nothing to collect for this student.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-border/50 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Due</p>
                  <p className="text-lg font-semibold tabular-nums text-red-600">
                    {formatAmount(totalDue)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    From billed items
                  </p>
                  <p className="text-lg font-semibold tabular-nums">
                    {formatAmount(billedDue)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                  <Layers className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Unbilled (will be created)
                  </p>
                  <p className="text-lg font-semibold tabular-nums text-amber-600">
                    {formatAmount(unbilledDue)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Per fee item groups */}
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="border-b border-border/50 pb-3">
              <CardTitle className="text-base font-semibold">
                Dues by fee item
              </CardTitle>
              <CardDescription>
                One click settles every pending month of that fee item.
              </CardDescription>
            </CardHeader>
            {droppedUnbilledCount > 0 && (
              <div className="flex items-center gap-2 border-b border-amber-500/30 bg-amber-500/[0.08] px-5 py-2.5 text-xs font-medium text-amber-700">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                {droppedUnbilledCount} unbilled month
                {droppedUnbilledCount > 1 ? "s" : ""} couldn&apos;t be matched
                to a fee type — update the API server and refresh, or bill via
                Add Fee.
              </div>
            )}
            <CardContent className="divide-y divide-border/50 p-0">
              {groups.map((group) => (
                <div
                  key={group.feeItemId}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {group.feeItemName}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {group.entries.length} pending
                      {group.entries.length > 1 ? " entries" : " entry"} ·{" "}
                      {group.entries.filter((e) => !e.billed).length > 0 && (
                        <span className="font-medium text-amber-600">
                          includes unbilled
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold tabular-nums text-red-600">
                      {formatAmount(group.totalDue)}
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                      onClick={() => openGroupDialog(group)}
                    >
                      <Banknote className="mr-1 h-3 w-3" />
                      Pay All
                    </Button>
                  </div>
                </div>
              ))}
              {/* Supplementary Fee Groups */}
              {supplementaryGroups.length > 0 && (
                <>
                  <div className="border-t border-amber-500/30" />
                  <div className="flex items-center gap-2 px-5 py-3 text-xs font-medium text-amber-700 bg-amber-500/[0.05]">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Supplementary Exam Fees
                  </div>
                  {supplementaryGroups.map((group) => (
                    <div
                      key={`${group.feeItemId}:${group.entries[0]?.student_enrollment_id ?? "null"}`}
                      className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {group.feeItemName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {group.entries.length} pending
                          {group.entries.length > 1 ? " entries" : " entry"} ·{" "}
                          {group.entries.filter((e) => !e.billed).length > 0 && (
                            <span className="font-medium text-amber-600">
                              includes unbilled
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-bold tabular-nums text-amber-600">
                          {formatAmount(group.totalDue)}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 border-amber-500/40 text-xs text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                          onClick={() => openGroupDialog(group)}
                        >
                          <Banknote className="mr-1 h-3 w-3" />
                          Pay All
                        </Button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <BulkCollectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        studentId={student.id}
        title={dialogTitle}
        description={dialogDescription}
        rows={dialogRows}
        studentName={student.name}
        className={
          student.studentEnrollments?.find(e => e.is_primary)?.academicClass?.class_name ??
          undefined
        }
        studentPhone={student.student_phone}
      />
    </div>
  );
};

export default PayDuesView;
