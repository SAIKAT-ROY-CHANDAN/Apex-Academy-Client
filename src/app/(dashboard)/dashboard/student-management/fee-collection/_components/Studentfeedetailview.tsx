"use client";

import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Banknote,
  BookOpen,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Download,
  GraduationCap,
  Hash,
  Layers,
  Mail,
  MapPin,
  PackageMinus,
  Phone,
  Printer,
  Receipt,
  Wallet,
  Wallet2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import PaymentDateField, {
  getTodayDateString,
  isInvalidCreatedAtMessage,
  toCreatedAtISO,
} from "@/components/shared/payment-date-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { adminDuePayment } from "@/services/student";
import CollectMonthlyDueDialog from "./CollectMonthlyDueDialog";
import CollectUnbilledFeeDialog from "./CollectUnbilledFeeDialog";
import { printFeeCollectionReceipt } from "./feeCollectionInvoice";
import type {
  TCollectionInfo,
  TMonthlyBreakdownPeriod,
  TStudentFeeCollectionItem,
  TStudentWithFeeCollections,
  TUnbilledOneTimeFee,
} from "./types";

interface StudentFeeDetailViewProps {
  student: TStudentWithFeeCollections;
}

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type FeeStatus = "PAID" | "PARTIAL" | "UNPAID";

const STATUS_META: Record<
  FeeStatus,
  { label: string; className: string; Icon: React.ElementType }
> = {
  PAID: {
    label: "Paid",
    className: "border-green-500/30 bg-green-500/10 text-green-600",
    Icon: CheckCircle2,
  },
  PARTIAL: {
    label: "Partial",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-600",
    Icon: Clock3,
  },
  UNPAID: {
    label: "Unpaid",
    className: "border-red-500/30 bg-red-500/10 text-red-600",
    Icon: AlertTriangle,
  },
};

const StatusBadge = ({ status }: { status: FeeStatus }) => {
  const { label, className, Icon } = STATUS_META[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${className}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
};

const DueBadge = ({ amount }: { amount: number }) => (
  <span className="inline-flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2 py-0.5 text-xs font-bold tabular-nums text-red-600">
    <AlertTriangle className="h-3 w-3" />
    {formatAmount(amount)}
  </span>
);

// Use epsilon to handle floating-point precision issues
const EPSILON = 0.005; // 0.5 paisa tolerance for BDT

const itemStatus = (due: number, paid: number): FeeStatus =>
  due <= EPSILON ? "PAID" : paid > EPSILON ? "PARTIAL" : "UNPAID";

// Helper to get supplementary fee display info
const getSupplementaryFeeDisplay = (
  feeItem:
    | { amount_every_subject?: number | null; fee_assign_for?: string }
    | null
    | undefined,
  subjectFailCount?: number,
) => {
  if (!feeItem || feeItem.fee_assign_for !== "SUPPLEMENTARY") return null;
  const perSubject = feeItem.amount_every_subject ?? 0;
  const count = subjectFailCount ?? 1;
  return {
    perSubject,
    count,
    total: perSubject * count,
    label: `${count} subject${count > 1 ? "s" : ""} × ${formatAmount(perSubject)} = ${formatAmount(perSubject * count)}`,
  };
};

// Enrollment-aware helper: resolves subject_fail_count for a specific supplementary item via its student_enrollment_id
const getFailCountForItem = (
  student: TStudentWithFeeCollections,
  item: { student_enrollment_id?: string | null },
) => {
  if (item.student_enrollment_id) {
    const en = student.studentEnrollments.find(
      (e) => e.id === item.student_enrollment_id,
    );
    if (en?.subject_fail_count != null) return en.subject_fail_count;
  }
  // fallback to first WITH_BACKLOG supplementary (legacy) — not used when enrollment-aware backend is correct
  const fallback = student.studentEnrollments.find(
    (e) =>
      e.enrollment_type === "SUPPLEMENTARY" &&
      e.enrollment_status === "WITH_BACKLOG",
  );
  return fallback?.subject_fail_count ?? 1;
};

const getPrimaryEnrollment = (student: TStudentWithFeeCollections) =>
  student.studentEnrollments?.find((enrollment) => enrollment.is_primary);

const getPrimaryEnrollmentDetails = (student: TStudentWithFeeCollections) => {
  const enrollment = getPrimaryEnrollment(student);
  const academicClass = enrollment?.academicClass ?? enrollment?.academic_class;

  return {
    className:
      academicClass?.class_name ??
      academicClass?.name ??
      enrollment?.academic_class_name ??
      "—",
    departmentName:
      academicClass?.department?.department_name ??
      academicClass?.department?.name ??
      enrollment?.department_name ??
      enrollment?.department?.department_name ??
      enrollment?.department?.name ??
      "—",
    programName:
      academicClass?.program?.program_name ??
      academicClass?.program?.name ??
      enrollment?.program_name ??
      enrollment?.program?.program_name ??
      enrollment?.program?.name ??
      "—",
    batchName: enrollment?.batch?.batch_name ?? "—",
  };
};

const getFailCountForFee = (
  student: TStudentWithFeeCollections,
  fee: {
    source_enrollment_id?: string | null;
    subject_fail_count?: number | null;
  },
) => {
  if ((fee as any).source_enrollment_id) {
    const en = student.studentEnrollments.find(
      (e) => e.id === (fee as any).source_enrollment_id,
    );
    if (en?.subject_fail_count != null) return en.subject_fail_count;
  }
  return fee.subject_fail_count ?? 1;
};

/** Re-print the invoice letter for a stored payment (history entry). */
const PaymentHistoryPrintButton = ({
  student,
  className,
  itemName,
  period,
  ci,
}: {
  student: TStudentWithFeeCollections;
  className?: string;
  itemName: string;
  period: string;
  ci: TCollectionInfo;
}) => (
  <Button
    type="button"
    variant="ghost"
    size="icon"
    className="ml-1 h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
    title="Print invoice for this payment"
    onClick={() =>
      void printFeeCollectionReceipt({
        studentName: student.name,
        className,
        studentPhone: student.student_phone,
        method: ci.payment_method,
        collectedBy: ci.collectedBy,
        note: ci.payment_note,
        issuedAt: new Date(ci.created_at),
        entries: [
          {
            name: itemName,
            period,
            amount: ci.paid_amount,
            paid: ci.paid_amount,
          },
        ],
      })
    }
  >
    <Printer className="h-3.5 w-3.5" />
  </Button>
);

/** Generate and print/download full fee summary report as PDF. */
const downloadFeeSummary = (
  student: TStudentWithFeeCollections,
  summary: any,
  monthlyPeriods: any[],
  oneTimeItems: any[],
  unbilledOneTimeFees: any[],
) => {
  const className =
    student.studentEnrollments?.find((e) => e.is_primary)?.academicClass
      ?.class_name ?? "—";

  const escapeHtml = (value: unknown): string =>
    String(value ?? "")
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, '"');

  const formatMoney = (amount: number): string =>
    new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 2,
    }).format(Number.isFinite(amount) ? amount : 0);

  // Build billing period label (same logic as main component)
  let billingPeriodLabel = "—";
  if (summary?.billingStartYear && summary?.billingStartMonth) {
    const startMonth = MONTH_NAMES[summary.billingStartMonth - 1] ?? "";
    const now = new Date();
    const currentMonth = MONTH_NAMES[now.getMonth()] ?? "";
    const currentYear = now.getFullYear();
    billingPeriodLabel = `${startMonth} ${summary.billingStartYear} – ${currentMonth} ${currentYear}`;
  }

  const issuedAt = new Date();
  const stamp = [
    issuedAt.getFullYear(),
    String(issuedAt.getMonth() + 1).padStart(2, "0"),
    String(issuedAt.getDate()).padStart(2, "0"),
  ].join("");
  const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const reportNo = `SUM-${stamp}-${randomSuffix}`;

  // Monthly breakdown rows
  const monthlyRowsHtml = monthlyPeriods
    .map(
      (p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${escapeHtml(p.month)} ${p.year}</td>
        <td class="num">${formatMoney(p.totalAmount)}</td>
        <td class="num">${formatMoney(p.paidAmount)}</td>
        <td class="num">${formatMoney(p.discountAmount)}</td>
        <td class="num">${formatMoney(p.fineAmount)}</td>
        <td class="num">${formatMoney(p.dueAmount)}</td>
        <td class="center">${escapeHtml(p.status)}</td>
      </tr>
    `,
    )
    .join("");

  // One-time billed items
  const oneTimeBilledRowsHtml = oneTimeItems
    .map((item, i) => {
      const due = Math.max(
        0,
        item.line_total_amount +
          (item.fine_amount ?? 0) -
          item.paid_amount -
          item.discount_amount,
      );
      const status = itemStatus(due, item.paid_amount);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(item.feeItem?.name ?? "—")}</td>
          <td class="num">${formatMoney(item.line_total_amount + (item.fine_amount ?? 0))}</td>
          <td class="num">${formatMoney(item.paid_amount)}</td>
          <td class="num">${formatMoney(item.discount_amount)}</td>
          <td class="num">${formatMoney(item.fine_amount ?? 0)}</td>
          <td class="num">${formatMoney(due)}</td>
          <td class="center">${escapeHtml(status)}</td>
        </tr>
      `;
    })
    .join("");

  // Unbilled one-time fees
  const unbilledRowsHtml = unbilledOneTimeFees
    .map((fee, i) => {
      const isSupplementary = fee.fee_assign_for === "SUPPLEMENTARY";
      const perSubject = fee.amount_every_subject ?? 0;
      const count = fee.subject_fail_count ?? 1;
      const amountDisplay =
        isSupplementary && perSubject > 0
          ? `${formatMoney(perSubject)} × ${count} = ${formatMoney(perSubject * count)}`
          : formatMoney(fee.amount);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${escapeHtml(fee.name)}</td>
          <td class="num">${amountDisplay}</td>
          <td class="num">—</td>
          <td class="num">—</td>
          <td class="num">—</td>
          <td class="num">${formatMoney(fee.amount)}</td>
          <td class="center">UNPAID</td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Fee Summary Report — ${escapeHtml(student.name)}</title>
        <style>
          * { box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 0; padding: 20px; font-size: 12px; color: #1f2937; }
          .header { text-align: center; margin-bottom: 24px; border-bottom: 2px solid #1f2937; padding-bottom: 16px; }
          .header h1 { font-size: 20px; font-weight: 700; letter-spacing: 1px; margin: 0 0 8px; text-transform: uppercase; }
          .header p { margin: 4px 0; font-size: 11px; color: #6b7280; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
          .meta-block h4 { font-size: 10px; text-transform: uppercase; letter-spacing: 0.8px; color: #6b7280; margin: 0 0 6px; }
          .meta-block p { margin: 2px 0; font-size: 12px; line-height: 1.6; }
          .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
          .stat-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px; background: #fafafa; }
          .stat-card .label { font-size: 10px; text-transform: uppercase; color: #6b7280; margin-bottom: 4px; }
          .stat-card .value { font-size: 16px; font-weight: 700; font-variant-numeric: tabular-nums; }
          .stat-card.positive .value { color: #15803d; }
          .stat-card.negative .value { color: #b91c1c; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 11px; }
          th, td { border: 1px solid #e5e7eb; padding: 6px 8px; text-align: left; }
          th { background: #f3f4f6; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
          td.num { text-align: right; font-variant-numeric: tabular-nums; }
          td.center { text-align: center; }
          .section-title { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin: 16px 0 8px; color: #1f2937; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
          .footer { margin-top: 32px; text-align: center; font-size: 10px; color: #9ca3af; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Student Fee Summary Report</h1>
          <p>Report No: ${reportNo} &nbsp;•&nbsp; Generated: ${issuedAt.toLocaleString()}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-block">
            <h4>Student</h4>
            <p><strong>${escapeHtml(student.name)}</strong></p>
            <p>NID: ${escapeHtml(student.nid_no || "—")}</p>
            <p>Class: ${escapeHtml(className)}</p>
            <p>Phone: ${escapeHtml(student.student_phone || "—")}</p>
          </div>
          <div class="meta-block">
            <h4>Billing Period</h4>
            <p>${escapeHtml(billingPeriodLabel)}</p>
            <p>Months: ${summary.billingMonths}</p>
            <p>Monthly Fee: ${formatMoney(summary.monthlyFeeAmount)}</p>
          </div>
        </div>

        <div class="summary-grid">
          <div class="stat-card">
            <div class="label">Total Payable</div>
            <div class="value">${formatMoney(summary.totalPayable)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Billed</div>
            <div class="value">${formatMoney(summary.totalBilled)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Paid</div>
            <div class="value positive">${formatMoney(summary.totalPaid)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Scholarship</div>
            <div class="value">${formatMoney(summary.totalDiscount)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Total Late Fee</div>
            <div class="value ${summary.totalFine > 0 ? "negative" : ""}">${formatMoney(summary.totalFine)}</div>
          </div>
          <div class="stat-card">
            <div class="label">Due Amount</div>
            <div class="value ${summary.dueAmount > 0 ? "negative" : "positive"}">${formatMoney(summary.dueAmount)}</div>
          </div>
        </div>

        <div class="section-title">Monthly Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Month</th>
              <th class="num">Billed</th>
              <th class="num">Paid</th>
              <th class="num">Scholarship</th>
              <th class="num">Late Fee </th>
              <th class="num">Due</th>
              <th class="center">Status</th>
            </tr>
          </thead>
          <tbody>${monthlyRowsHtml}</tbody>
        </table>

        <div class="section-title">One-time Fees (Billed)</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th class="num">Amount</th>
              <th class="num">Paid</th>
              <th class="num">Scholarship</th>
              <th class="num">Late Fee </th>
              <th class="num">Due</th>
              <th class="center">Status</th>
            </tr>
          </thead>
          <tbody>${oneTimeBilledRowsHtml || '<tr><td colspan="8" class="center">No billed one-time fees</td></tr>'}</tbody>
        </table>

        <div class="section-title">One-time Fees (Unbilled / Expected)</div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Item</th>
              <th class="num">Amount</th>
              <th class="num">Paid</th>
              <th class="num">Scholarship</th>
              <th class="num">Late Fee </th>
              <th class="num">Due</th>
              <th class="center">Status</th>
            </tr>
          </thead>
          <tbody>${unbilledRowsHtml || '<tr><td colspan="8" class="center">No unbilled one-time fees</td></tr>'}</tbody>
        </table>

        <div class="footer">
          <p>EIMS — Education Institution Management System</p>
          <p>This is a system-generated report. No signature required.</p>
        </div>
      </body>
    </html>
  `;

  // Open in new window for print/download
  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    w.onload = () => {
      setTimeout(() => {
        w.focus();
        w.print();
      }, 300);
    };
  }
};

const toFeeStatus = (
  status: "PAID" | "PARTIAL" | "DUE" | "UNPAID",
): FeeStatus =>
  status === "PAID" ? "PAID" : status === "PARTIAL" ? "PARTIAL" : "UNPAID";

const PayFormRow = ({
  colSpan,
  itemDue,
  payAmount,
  onPayAmountChange,
  payDiscount,
  onPayDiscountChange,
  payMethod,
  onPayMethodChange,
  payNote,
  onPayNoteChange,
  payDate,
  onPayDateChange,
  submitting,
  onSubmit,
  onCancel,
}: {
  colSpan: number;
  itemDue: number;
  payAmount: string;
  onPayAmountChange: (value: string) => void;
  payDiscount: string;
  onPayDiscountChange: (value: string) => void;
  payMethod: string;
  onPayMethodChange: (value: string) => void;
  payNote: string;
  onPayNoteChange: (value: string) => void;
  payDate: string;
  onPayDateChange: (value: string) => void;
  submitting: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="bg-muted/20 p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label className="text-xs">
              Amount (max {formatAmount(itemDue)})
            </Label>
            <Input
              type="number"
              min="0.01"
              step="0.01"
              max={itemDue}
              value={payAmount}
              onChange={(e) => onPayAmountChange(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div className="w-36">
            <Label className="text-xs">Scholarship</Label>
            <Input
              type="number"
              min="0"
              step="0.01"
              max={itemDue}
              value={payDiscount}
              onChange={(e) => onPayDiscountChange(e.target.value)}
              className="mt-1 h-8 text-sm"
            />
          </div>
          <div className="w-36">
            <Label className="text-xs">Method</Label>
            <Select
              value={payMethod}
              onValueChange={(v) => v && onPayMethodChange(v)}
            >
              <SelectTrigger className="mt-1 h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="BANK">Bank</SelectItem>
                <SelectItem value="BKASH">bKash</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="text-xs">Note (optional)</Label>
            <Input
              value={payNote}
              onChange={(e) => onPayNoteChange(e.target.value)}
              className="mt-1 h-8 text-sm"
              placeholder="Payment note..."
            />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 text-xs"
              disabled={submitting}
              onClick={onSubmit}
            >
              {submitting ? "Saving..." : "Submit"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-8 text-xs"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </div>
        <div className="max-w-xs">
          <PaymentDateField
            id="inline-payment-date"
            value={payDate}
            onChange={onPayDateChange}
          />
        </div>
      </div>
    </TableCell>
  </TableRow>
);

const StatCard = ({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  tone?: "default" | "positive" | "negative";
}) => (
  <Card className="border-border/50 shadow-sm">
    <CardContent className="flex items-center gap-3 p-4">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
          tone === "positive"
            ? "bg-green-500/10 text-green-600"
            : tone === "negative"
              ? "bg-red-500/10 text-red-600"
              : "bg-muted text-muted-foreground"
        }`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const StudentFeeDetailView = ({ student }: StudentFeeDetailViewProps) => {
  const router = useRouter();
  const summary = student.feeSummary;
  const { className, departmentName, programName, batchName } =
    getPrimaryEnrollmentDetails(student);

  // Pay-form state: keyed by collection_item_id
  const [payingItemId, setPayingItemId] = useState<string | null>(null);
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null,
  );
  const [collectingUnbilledFee, setCollectingUnbilledFee] =
    useState<TUnbilledOneTimeFee | null>(null);
  const [monthlyPayTarget, setMonthlyPayTarget] = useState<{
    label: string;
    monthEnum: string;
    year: number;
    billedItems: {
      collectionItemId: string;
      name: string;
      due: number;
    }[];
    unbilledItems: {
      feeItemId: string;
      name: string;
      amount: number;
      feeTypeId: string;
    }[];
  } | null>(null);
  const [payAmount, setPayAmount] = useState<string>("");
  const [payDiscount, setPayDiscount] = useState<string>("");
  const [payMethod, setPayMethod] = useState<string>("CASH");
  const [payNote, setPayNote] = useState<string>("");
  const [payDate, setPayDate] = useState<string>(getTodayDateString());
  const [submitting, setSubmitting] = useState(false);
console.log(student,"studentstudent");

  const handlePay = async (itemId: string) => {
    if (!payAmount || Number(payAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    const itemDue = student.studentFeeCollections
      .flatMap((collection) => collection.studentFeeCollectionItems)
      .find((item) => item.id === itemId);
    const dueAmount = itemDue
      ? Math.max(
          0,
          itemDue.line_total_amount +
            (itemDue.fine_amount ?? 0) -
            itemDue.paid_amount -
            itemDue.discount_amount,
        )
      : 0;
    const discountAmount = Number(payDiscount) || 0;
    if (discountAmount < 0 || discountAmount > dueAmount) {
      toast.error("Scholarship must be between 0 and due amount");
      return;
    }
    if (Number(payAmount) + discountAmount > dueAmount) {
      toast.error("Pay + Scholarship cannot exceed due amount");
      return;
    }
    setSubmitting(true);
    try {
      const res = await adminDuePayment(student.id, {
        student_fee_collection_item_id: itemId,
        paid_amount: Number(payAmount),
        discount_amount: discountAmount,
        payment_method: payMethod,
        payment_note: payNote || null,
        created_at: toCreatedAtISO(payDate),
      });
      if (res.success) {
        toast.success(
          `Payment recorded successfully` +
            (discountAmount > 0
              ? ` + Scholarship ${formatAmount(discountAmount)}`
              : ""),
        );

        // Auto-print invoice for this payment
        const paidItem = student.studentFeeCollections
          .flatMap((collection) => collection.studentFeeCollectionItems)
          .find((collectionItem) => collectionItem.id === itemId);
        if (paidItem) {
          const dueBefore =
            paidItem.line_total_amount +
            (paidItem.fine_amount ?? 0) -
            paidItem.paid_amount -
            paidItem.discount_amount;
          void printFeeCollectionReceipt({
            studentName: student.name,
            className,
            studentPhone: student.student_phone,
            method: payMethod,
            note: payNote || null,
            entries: [
              {
                name: paidItem.feeItem?.name ?? "Fee item",
                period:
                  paidItem.fee_month && paidItem.fee_year
                    ? `${paidItem.fee_month.charAt(0)}${paidItem.fee_month
                        .slice(1)
                        .toLowerCase()} ${paidItem.fee_year}`
                    : "One-time",
                amount: dueBefore > 0 ? dueBefore : Number(payAmount),
                paid: Number(payAmount),
                discount: discountAmount,
              },
            ],
          });
        }

        setPayingItemId(null);
        setPayAmount("");
        setPayDiscount("");
        setPayNote("");
        setPayDate(getTodayDateString());
        router.refresh();
      } else {
        toast.error(
          isInvalidCreatedAtMessage(res.message)
            ? "Please select a valid payment date."
            : res.message || "Payment failed",
        );
      }
    } catch {
      toast.error("Payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  // Build billing period label
  let billingPeriodLabel = "—";
  if (summary?.billingStartYear && summary?.billingStartMonth) {
    const startMonth = MONTH_NAMES[summary.billingStartMonth - 1] ?? "";
    const now = new Date();
    const currentMonth = MONTH_NAMES[now.getMonth()] ?? "";
    const currentYear = now.getFullYear();
    billingPeriodLabel = `${startMonth} ${summary.billingStartYear} – ${currentMonth} ${currentYear}`;
  }

  // Open the monthly due dialog: split the month's dues into already-billed
  // items (pay via adminDuePayment) and structure-expected but unbilled items
  // (create + collect via studentFeeCollection)
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
  // Full item invoice: every recorded payment of one fee item, combined
  const printItemFullInvoice = (item: TStudentFeeCollectionItem) => {
    const infos = [...(item.collectionInfos ?? [])].sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const latest = infos[infos.length - 1];
    const period =
      item.feeItem?.FeeItemType === "Monthly" && item.fee_month && item.fee_year
        ? `${item.fee_month.charAt(0)}${item.fee_month
            .slice(1)
            .toLowerCase()} ${item.fee_year}`
        : "One-time";

    const outstandingDue = Math.max(
      0,
      item.line_total_amount +
        (item.fine_amount ?? 0) -
        item.paid_amount -
        item.discount_amount,
    );

    void printFeeCollectionReceipt({
      studentName: student.name,
      className,
      studentPhone: student.student_phone,
      method: latest?.payment_method ?? "CASH",
      collectedBy: latest?.collectedBy,
      note: latest?.payment_note ?? null,
      issuedAt: latest ? new Date(latest.created_at) : undefined,
      outstandingDue,
      entries: infos.map((ci) => ({
        name: item.feeItem?.name ?? "Fee item",
        period:
          infos.length > 1
            ? `${period} · ${new Date(ci.created_at).toLocaleDateString()}`
            : period,
        amount: ci.paid_amount,
        paid: ci.paid_amount,
      })),
    });
  };

  const openMonthlyDueDialog = (period: TMonthlyBreakdownPeriod) => {
    const monthKey = period.month.slice(0, 3).toUpperCase();

    const billedItems = student.studentFeeCollections
      .flatMap((collection) => collection.studentFeeCollectionItems)
      .filter(
        (item) =>
          item.fee_year === period.year &&
          (item.fee_month ?? "").slice(0, 3).toUpperCase() === monthKey,
      )
      .map((item) => ({
        collectionItemId: item.id,
        feeItemId: item.feeItem?.id ?? "",
        name: item.feeItem?.name ?? "—",
        due: Math.max(
          0,
          item.line_total_amount +
            (item.fine_amount ?? 0) -
            item.paid_amount -
            item.discount_amount,
        ),
      }))
      .filter((entry) => entry.due > 0);

    const billedFeeItemIds = new Set(
      billedItems.map((entry) => entry.feeItemId),
    );

    const unbilledItems = (period.items ?? [])
      .filter(
        (pi) =>
          pi.dueAmount > 0 &&
          pi.feeTypeId &&
          !billedFeeItemIds.has(pi.feeItemId),
      )
      .map((pi) => {
        const feeItem = period.items?.find(
          (fi) => fi.feeItemId === pi.feeItemId,
        );
        return {
          feeItemId: pi.feeItemId,
          name: pi.feeItemName,
          amount: pi.amount,
          feeTypeId: pi.feeTypeId as string,
          fee_assign_for: feeItem?.fee_assign_for,
          amount_every_subject: feeItem?.amount_every_subject,
        };
      });

    if (billedItems.length === 0 && unbilledItems.length === 0) {
      toast.error("Nothing collectable found for this month.");
      return;
    }

    setMonthlyPayTarget({
      label: `${period.month} ${period.year}`,
      monthEnum: MONTH_ENUMS.find((m) => m.startsWith(monthKey)) ?? "",
      year: period.year,
      billedItems: billedItems.map(({ collectionItemId, name, due }) => ({
        collectionItemId,
        name,
        due,
      })),
      unbilledItems,
    });
  };

  // Monthly breakdown aggregates
  const monthlyPeriods = summary?.monthlyBreakdown ?? [];
  const monthlyTotals = monthlyPeriods.reduce(
    (acc, p) => ({
      billed: acc.billed + p.totalAmount,
      paid: acc.paid + p.paidAmount,
      discount: acc.discount + p.discountAmount,
      fine: acc.fine + p.fineAmount,
      due: acc.due + p.dueAmount,
    }),
    { billed: 0, paid: 0, discount: 0, fine: 0, due: 0 },
  );
  const monthlySettled = Math.min(
    monthlyTotals.billed,
    monthlyTotals.paid + monthlyTotals.discount,
  );
  const monthlyPct =
    monthlyTotals.billed > 0
      ? Math.round((monthlySettled / monthlyTotals.billed) * 100)
      : 100;
  const currentMonthName = MONTH_NAMES[new Date().getMonth()] ?? "";
  const currentYear = new Date().getFullYear();

  // One-time fee aggregates (across all fee-type collections)
  const oneTimeItems = student.studentFeeCollections.flatMap((collection) =>
    collection.studentFeeCollectionItems.filter(
      (item) =>
        item.feeItem?.FeeItemType === "OneTime" &&
        item.feeItem?.fee_assign_for !== "SUPPLEMENTARY",
    ),
  );
  // Expected one-time fees from the class structure not yet billed to the
  // student — already counted in feeSummary due, shown here as virtual rows.
  const unbilledOneTimeFees = (student.unbilledOneTimeFees ?? []).filter(
    (fee) => fee.fee_assign_for !== "SUPPLEMENTARY",
  );

  // Supplementary fee aggregates
  const supplementaryItems = student.studentFeeCollections.flatMap(
    (collection) =>
      collection.studentFeeCollectionItems.filter(
        (item) =>
          item.feeItem?.FeeItemType === "OneTime" &&
          item.feeItem?.fee_assign_for === "SUPPLEMENTARY",
      ),
  );
  const unbilledSupplementaryFees = (student.unbilledOneTimeFees ?? []).filter(
    (fee) => fee.fee_assign_for === "SUPPLEMENTARY",
  );

  const supplementaryTotals = supplementaryItems.reduce(
    (acc, item) => {
      const lineWithFine = item.line_total_amount + (item.fine_amount ?? 0);
      const due = Math.max(
        0,
        lineWithFine - item.paid_amount - item.discount_amount,
      );
      return {
        total: acc.total + lineWithFine,
        paid: acc.paid + item.paid_amount,
        discount: acc.discount + item.discount_amount,
        fine: acc.fine + (item.fine_amount ?? 0),
        due: acc.due + due,
      };
    },
    { total: 0, paid: 0, discount: 0, fine: 0, due: 0 },
  );
  const unbilledSupplementaryTotal = unbilledSupplementaryFees.reduce(
    (sum, fee) => sum + fee.amount,
    0,
  );
  const supplementaryGrandTotal =
    supplementaryTotals.total + unbilledSupplementaryTotal;
  const supplementaryGrandDue =
    supplementaryTotals.due + unbilledSupplementaryTotal;
  const supplementarySettled = Math.min(
    supplementaryGrandTotal,
    supplementaryTotals.paid + supplementaryTotals.discount,
  );
  const supplementaryPct =
    supplementaryGrandTotal > 0
      ? Math.round((supplementarySettled / supplementaryGrandTotal) * 100)
      : 100;
  const supplementaryStatus: FeeStatus =
    supplementaryGrandDue <= EPSILON
      ? "PAID"
      : supplementaryTotals.paid > EPSILON || supplementaryPct > 0
        ? "PARTIAL"
        : "UNPAID";
  const supplementaryDueItemsCount =
    supplementaryItems.filter(
      (item) =>
        Math.max(
          0,
          item.line_total_amount +
            (item.fine_amount ?? 0) -
            item.paid_amount -
            item.discount_amount,
        ) > 0,
    ).length + unbilledSupplementaryFees.length;

  // Expected one-time fees from the class structure not yet billed to the
  // student — already counted in feeSummary due, shown here as virtual rows.
  // unbilledOneTimeFees already declared above
  const unbilledOneTimeTotal = unbilledOneTimeFees.reduce(
    (sum, fee) => sum + fee.amount,
    0,
  );
  const oneTimeTotals = oneTimeItems.reduce(
    (acc, item) => {
      const lineWithFine = item.line_total_amount + (item.fine_amount ?? 0);
      const due = Math.max(
        0,
        lineWithFine - item.paid_amount - item.discount_amount,
      );
      return {
        total: acc.total + lineWithFine,
        paid: acc.paid + item.paid_amount,
        discount: acc.discount + item.discount_amount,
        fine: acc.fine + (item.fine_amount ?? 0),
        due: acc.due + due,
      };
    },
    { total: 0, paid: 0, discount: 0, fine: 0, due: 0 },
  );
  const oneTimeGrandTotal = oneTimeTotals.total + unbilledOneTimeTotal;
  const oneTimeGrandDue = oneTimeTotals.due + unbilledOneTimeTotal;
  const oneTimeSettled = Math.min(
    oneTimeGrandTotal,
    oneTimeTotals.paid + oneTimeTotals.discount,
  );
  const oneTimePct =
    oneTimeGrandTotal > 0
      ? Math.round((oneTimeSettled / oneTimeGrandTotal) * 100)
      : 100;
  const oneTimeStatus: FeeStatus =
    oneTimeGrandDue <= EPSILON
      ? "PAID"
      : oneTimeTotals.paid > EPSILON || oneTimePct > 0
        ? "PARTIAL"
        : "UNPAID";
  const oneTimeDueItemsCount =
    oneTimeItems.filter(
      (item) =>
        Math.max(
          0,
          item.line_total_amount +
            (item.fine_amount ?? 0) -
            item.paid_amount -
            item.discount_amount,
        ) > 0,
    ).length + unbilledOneTimeFees.length;
  const studentLocation =
    [student.village_road, student.district].filter(Boolean).join(", ") || "—";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/student-management/fee-collection">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-xl font-semibold">Fee Collection Details</h1>
        </div>
        {summary && summary.dueAmount > 0 && (
          <Link
            href={`/dashboard/student-management/fee-collection/${student.id}/pay-dues`}
          >
            <Button
              size="sm"
              variant="outline"
              className="border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
            >
              <Banknote className="mr-1.5 h-3.5 w-3.5" />
              Pay All Dues — {formatAmount(summary.dueAmount)}
            </Button>
          </Link>
        )}
      </div>

      {/* Student overview */}
      <Card className="overflow-hidden border-border/60 shadow-sm">
        <div className="relative overflow-hidden border-b border-sky-200 bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 px-5 py-4 text-slate-800 sm:px-6 dark:border-sky-900/40 dark:from-sky-950/30 dark:via-blue-950/30 dark:to-indigo-950/30">
          <div className="absolute -right-8 -top-16 h-40 w-40 rounded-full bg-sky-200/40 dark:bg-sky-400/10" />
          <div className="absolute -bottom-24 right-24 h-36 w-36 rounded-full bg-indigo-200/30 dark:bg-indigo-400/10" />
          <div className="relative flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700 dark:text-sky-300">
                Student profile
              </p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                Fee collection account
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm dark:border-sky-800 dark:bg-slate-900/60 dark:text-slate-100">
              <span
                className={`h-2 w-2 rounded-full ${
                  student.is_active ? "bg-emerald-300" : "bg-red-300"
                }`}
              />
              {student.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
        <CardContent className="p-5 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="flex min-w-0 items-center gap-4">
              <div className="h-[76px] w-[76px] shrink-0 rounded-2xl border border-sky-200 bg-sky-50 p-1 shadow-sm dark:border-sky-900 dark:bg-sky-950/40">
                <div className="h-full w-full overflow-hidden rounded-[13px] border-2 border-background bg-muted">
                  {student.photo ? (
                    <img
                      src={student.photo}
                      alt={`${student.name} profile`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-sky-100 text-2xl font-bold text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                      {student.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-bold tracking-tight">
                  {student.name}
                </h2>
                <span className="mt-1 inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  Registration: {student.registration_number || "—"}
                </span>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Program", value: programName, Icon: GraduationCap },
                { label: "Department", value: departmentName, Icon: Building2 },
                { label: "Class", value: className, Icon: BookOpen },
                { label: "Batch", value: batchName, Icon: Layers },
              ].map(({ label, value, Icon }) => (
                <div
                  key={label}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                    {label}
                  </div>
                  <p className="mt-1.5 truncate text-sm font-semibold text-foreground">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50/70 px-3 py-1.5 dark:border-sky-900/70 dark:bg-sky-950/20">
                <Phone className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                {student.student_phone || "No phone"}
              </span>
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50/70 px-3 py-1.5 dark:border-sky-900/70 dark:bg-sky-950/20">
                <Mail className="h-3.5 w-3.5 shrink-0 text-sky-600 dark:text-sky-400" />
                <span className="truncate">{student.email || "No email"}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200/80 bg-sky-50/70 px-3 py-1.5 dark:border-sky-900/70 dark:bg-sky-950/20">
                <MapPin className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                {studentLocation}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing period info */}
      {summary && (
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              Billing period:
              <span className="font-medium text-foreground">
                {billingPeriodLabel}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4" />
              Months:
              <span className="font-medium text-foreground">
                {summary.billingMonths}
              </span>
            </span>
            <span className="inline-flex items-center gap-1.5 text-muted-foreground">
              Monthly fee:
              <span className="font-medium text-foreground">
                {formatAmount(summary.monthlyFeeAmount)}
              </span>
            </span>
            <div className="flex-1 sm:flex-none" />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() =>
                downloadFeeSummary(
                  student,
                  summary,
                  monthlyPeriods,
                  oneTimeItems,
                  unbilledOneTimeFees,
                )
              }
            >
              <Download className="h-3.5 w-3.5" />
              Download Summary
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Fee summary */}
      {summary && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={`Total Payable (${summary.billingMonths} months)`}
            value={formatAmount(summary.totalPayable)}
            icon={Wallet2}
          />
          <StatCard
            label="Total Billed"
            value={formatAmount(summary.totalBilled)}
            icon={CircleDollarSign}
          />
          <StatCard
            label="Total Paid"
            value={formatAmount(summary.totalPaid)}
            icon={Wallet}
            tone="positive"
          />
          <StatCard
            label="Total Scholarship"
            value={formatAmount(summary.totalDiscount)}
            icon={PackageMinus}
          />
          <StatCard
            label="Total Late Fee"
            value={formatAmount(summary.totalFine)}
            icon={AlertCircle}
            tone={summary.totalFine > 0 ? "negative" : "default"}
          />
          <StatCard
            label="Due Amount"
            value={formatAmount(summary.dueAmount)}
            icon={AlertCircle}
            tone={summary.dueAmount > 0 ? "negative" : "positive"}
          />
        </div>
      )}

      {/* Monthly breakdown */}
      {monthlyPeriods.length > 0 && (
        <div className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="space-y-3 border-b border-border/50 bg-muted/20 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    Monthly Breakdown
                  </CardTitle>
                  {monthlyTotals.due > 0 ? (
                    <DueBadge amount={monthlyTotals.due} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      All months cleared
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    Billed{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatAmount(monthlyTotals.billed)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Paid{" "}
                    <span className="font-semibold tabular-nums text-green-600">
                      {formatAmount(monthlySettled)}
                    </span>
                  </span>
                  {monthlyTotals.fine > 0 && (
                    <span className="font-medium tabular-nums text-amber-700">
                      Late Fee  {formatAmount(monthlyTotals.fine)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      monthlyPct >= 100 ? "bg-green-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${monthlyPct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {monthlyPct}%
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Item
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Academic Year
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Paid
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Scholarship
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Late Fee 
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Line Total
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-red-600/80">
                      Due
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyPeriods.map(
                    (period: TMonthlyBreakdownPeriod, idx: number) => (
                      <TableRow
                        key={`${period.year}-${period.month}-${idx}`}
                        className={
                          period.dueAmount > 0
                            ? "bg-red-500/[0.04] hover:bg-red-500/10"
                            : undefined
                        }
                      >
                        <TableCell className="relative text-sm">
                          {period.dueAmount > 0 && (
                            <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r bg-red-500" />
                          )}
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">
                              {period.month} {period.year}
                            </span>
                            {period.month === currentMonthName &&
                              period.year === currentYear && (
                                <span className="rounded bg-blue-500/10 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-blue-600">
                                  Current
                                </span>
                              )}
                          </div>
                          {period.paymentDueYear !== period.year && (
                            <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                              Payment due {period.paymentDueYear}
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center text-sm tabular-nums text-muted-foreground">
                          {summary?.sessionName ??
                            student.studentEnrollments?.find(
                              (e) => e.is_primary,
                            )?.academicSession?.session_name ??
                            "N/A"}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                          {formatAmount(period.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                          {formatAmount(period.paidAmount)}
                        </TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                          {formatAmount(period.discountAmount)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          <span
                            className={
                              period.fineAmount > 0
                                ? "font-medium text-amber-700"
                                : "text-muted-foreground"
                            }
                          >
                            {formatAmount(period.fineAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          {period.dueAmount > 0 ? (
                            <DueBadge amount={period.dueAmount} />
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-bold tabular-nums text-green-600">
                              0
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Tooltip>
                            <TooltipTrigger>
                              <span
                                className={`inline-flex cursor-default items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                                  period.paymentCount > 0
                                    ? "bg-blue-500/10 text-blue-600"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {period.paymentCount}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-[300px] flex-col items-start gap-2 bg-slate-900 px-3 py-2.5 text-slate-50">
                              {period.items?.length ? (
                                (() => {
                                  const pending = period.items.filter(
                                    (item) => item.dueAmount > 0,
                                  );
                                  return pending.length > 0 ? (
                                    <div className="w-full space-y-1.5">
                                      <p className="text-[11px] font-semibold uppercase tracking-wide text-amber-300">
                                        Pending — {pending.length} item
                                        {pending.length > 1 ? "s" : ""}
                                      </p>
                                      {pending.map((item) => (
                                        <div
                                          key={item.feeItemId}
                                          className="flex items-center justify-between gap-3 rounded bg-white/10 px-2 py-1.5"
                                        >
                                          <span className="truncate text-xs font-medium text-white">
                                            {item.feeItemName}
                                          </span>
                                          <span className="shrink-0 rounded bg-red-500/20 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-red-300">
                                            {formatAmount(item.dueAmount)}
                                          </span>
                                        </div>
                                      ))}
                                      {period.items.length > pending.length && (
                                        <p className="pt-1 text-[11px] text-slate-400">
                                          +{" "}
                                          {period.items.length - pending.length}{" "}
                                          item
                                          {period.items.length -
                                            pending.length >
                                          1
                                            ? "s"
                                            : ""}{" "}
                                          already cleared
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-1">
                                      <p className="text-xs font-semibold text-emerald-300">
                                        All items cleared
                                      </p>
                                      <div className="space-y-1">
                                        {period.items.map((item) => (
                                          <div
                                            key={item.feeItemId}
                                            className="flex items-center justify-between gap-3 text-[11px]"
                                          >
                                            <span className="text-slate-300">
                                              {item.feeItemName}
                                            </span>
                                            <span className="font-medium text-emerald-300">
                                              Paid
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })()
                              ) : (
                                <p className="text-xs text-slate-300">
                                  No fee items for this month.
                                </p>
                              )}
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status={toFeeStatus(period.status)} />
                        </TableCell>
                        <TableCell className="text-center">
                          {period.dueAmount > 0 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                              onClick={() => openMonthlyDueDialog(period)}
                            >
                              <Banknote className="mr-1 h-3 w-3" />
                              Pay
                            </Button>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              —
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CollectMonthlyDueDialog
              open={monthlyPayTarget !== null}
              onOpenChange={(open) => {
                if (!open) setMonthlyPayTarget(null);
              }}
              studentId={student.id}
              monthLabel={monthlyPayTarget?.label ?? ""}
              monthEnum={monthlyPayTarget?.monthEnum ?? ""}
              year={monthlyPayTarget?.year ?? new Date().getFullYear()}
              billedItems={monthlyPayTarget?.billedItems ?? []}
              unbilledItems={monthlyPayTarget?.unbilledItems ?? []}
              studentName={student.name}
              className={className}
              studentPhone={student.student_phone}
            />
          </Card>
        </div>
      )}

      {/* Supplementary fee breakdown */}
      {(supplementaryItems.length > 0 ||
        unbilledSupplementaryFees.length > 0) && (
        <div className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="space-y-3 border-b border-border/50 bg-muted/20 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    Supplementary Exam Fee Breakdown
                  </CardTitle>
                  <StatusBadge status={supplementaryStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    Total{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatAmount(supplementaryGrandTotal)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Paid{" "}
                    <span className="font-semibold tabular-nums text-green-600">
                      {formatAmount(supplementarySettled)}
                    </span>
                  </span>
                  {supplementaryGrandDue > 0 ? (
                    <DueBadge amount={supplementaryGrandDue} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Cleared
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      supplementaryPct >= 100 ? "bg-green-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${supplementaryPct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {supplementaryPct}%
                </span>
              </div>
            </CardHeader>
            {supplementaryGrandDue > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-xs font-medium text-red-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Outstanding due of
                <b className="tabular-nums">
                  {formatAmount(supplementaryGrandDue)}
                </b>
                across {supplementaryDueItemsCount} item
                {supplementaryDueItemsCount > 1 ? "s" : ""} — collect to clear
                the balance.
              </div>
            )}
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Item
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Late Fee 
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Paid
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Scholarship
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Line Total
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-red-600/80">
                      Due
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supplementaryItems.map((item) => {
                    const itemDue = Math.max(
                      0,
                      item.line_total_amount +
                        (item.fine_amount ?? 0) -
                        item.paid_amount -
                        item.discount_amount,
                    );
                    const isPaying = payingItemId === item.id;
                    const historyOpen = expandedHistoryId === item.id;
                    const paymentCount = item.collectionInfos?.length ?? 0;
                    const failCount =
                      item.feeItem?.fee_assign_for === "SUPPLEMENTARY"
                        ? getFailCountForItem(student, item)
                        : undefined;
                    const suppDisplay = getSupplementaryFeeDisplay(
                      item.feeItem,
                      failCount,
                    );
                    const failEn = item.student_enrollment_id
                      ? student.studentEnrollments.find(
                          (e) => e.id === item.student_enrollment_id,
                        )
                      : student.studentEnrollments.find(
                          (e) =>
                            e.enrollment_type === "SUPPLEMENTARY" &&
                            e.enrollment_status === "WITH_BACKLOG",
                        );
                    const yearLabel =
                      (failEn as any)?.academicSession?.session_name ??
                      failEn?.academicSession?.session_name ??
                      "N/A";
                    const attemptIdx = (() => {
                      const supps = student.studentEnrollments
                        .filter(
                          (e) =>
                            e.enrollment_type === "SUPPLEMENTARY" &&
                            e.enrollment_status === "WITH_BACKLOG",
                        )
                        .sort(
                          (a, b) =>
                            new Date((a as any).created_at ?? 0).getTime() -
                            new Date((b as any).created_at ?? 0).getTime(),
                        );
                      const idx = supps.findIndex(
                        (e) => e.id === item.student_enrollment_id,
                      );
                      return idx >= 0 ? idx + 1 : null;
                    })();

                    return (
                      <Fragment key={item.id}>
                        <TableRow
                          className={
                            itemDue > 0
                              ? "bg-red-500/[0.04] hover:bg-red-500/10"
                              : undefined
                          }
                        >
                          <TableCell className="relative text-sm">
                            {itemDue > 0 && (
                              <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r bg-red-500" />
                            )}
                            <div className="font-medium">
                              {item.feeItem?.name ?? "—"}
                              {attemptIdx ? (
                                <span className="ml-2 inline-flex items-center rounded bg-amber-500/10 px-1.5 py-px text-[10px] font-semibold text-amber-700">
                                  Attempt #{attemptIdx}
                                </span>
                              ) : null}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {failCount
                                ? `${failCount} subject${failCount > 1 ? "s" : ""} failed`
                                : "Supplementary"}{" "}
                              · Year: {yearLabel}
                            </div>
                            {paymentCount > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHistoryId(
                                    historyOpen ? null : item.id,
                                  )
                                }
                                className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:underline"
                              >
                                {paymentCount} payment
                                {paymentCount > 1 ? "s" : ""}
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${historyOpen ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                            {item.feeItem
                              ? item.feeItem.fee_assign_for ===
                                  "SUPPLEMENTARY" &&
                                item.feeItem.amount_every_subject
                                ? `${formatAmount(item.feeItem.amount_every_subject)} × ${failCount ?? 1} = ${formatAmount(item.line_total_amount)}`
                                : formatAmount(item.feeItem.amount)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            <span
                              className={
                                (item.fine_amount ?? 0) > 0
                                  ? "font-medium text-amber-700"
                                  : "text-muted-foreground"
                              }
                            >
                              {formatAmount(item.fine_amount ?? 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-green-600">
                            {formatAmount(item.paid_amount)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                            {formatAmount(item.discount_amount)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium tabular-nums">
                            {formatAmount(
                              item.line_total_amount + (item.fine_amount ?? 0),
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {itemDue > 0 ? (
                              <DueBadge amount={itemDue} />
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge
                              status={toFeeStatus(
                                itemDue > 0
                                  ? item.paid_amount > 0
                                    ? "PARTIAL"
                                    : "UNPAID"
                                  : "PAID",
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {paymentCount > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  title="Print full invoice (all payments of this item)"
                                  onClick={() => printItemFullInvoice(item)}
                                >
                                  <Printer className="mr-1 h-3 w-3" />
                                  Invoice
                                </Button>
                              )}
                              {itemDue > 0 ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                                  onClick={() => setPayingItemId(item.id)}
                                >
                                  <Banknote className="mr-1 h-3 w-3" />
                                  Pay
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    );
                  })}
                  {/* Unbilled supplementary fees - enrollment-aware, each attempt separate */}
                  {unbilledSupplementaryFees.map((fee) => {
                    const feeDue = fee.amount;
                    const failCount = getFailCountForFee(student, fee as any);
                    const suppDisplay = getSupplementaryFeeDisplay(
                      {
                        amount_every_subject: fee.amount_every_subject,
                        fee_assign_for: fee.fee_assign_for,
                      },
                      failCount,
                    );
                    const attemptIdx = (() => {
                      const supps = student.studentEnrollments
                        .filter(
                          (e) =>
                            e.enrollment_type === "SUPPLEMENTARY" &&
                            e.enrollment_status === "WITH_BACKLOG",
                        )
                        .sort(
                          (a, b) =>
                            new Date((a as any).created_at ?? 0).getTime() -
                            new Date((b as any).created_at ?? 0).getTime(),
                        );
                      const idx = supps.findIndex(
                        (e) => e.id === (fee as any).source_enrollment_id,
                      );
                      return idx >= 0 ? idx + 1 : null;
                    })();

                    return (
                      <TableRow
                        key={`${fee.id}:${(fee as any).source_enrollment_id ?? ""}`}
                        className="bg-amber-500/[0.04] hover:bg-amber-500/10"
                      >
                        <TableCell className="relative text-sm">
                          <div className="font-medium">
                            {fee.name}{" "}
                            {attemptIdx ? (
                              <span className="ml-1 inline-flex items-center rounded bg-amber-500/10 px-1.5 py-px text-[10px] font-semibold text-amber-700">
                                Attempt #{attemptIdx}
                              </span>
                            ) : null}
                          </div>
                          {suppDisplay && (
                            <div className="mt-0.5 text-xs text-amber-600 font-medium">
                              {suppDisplay.label}
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          {suppDisplay
                            ? suppDisplay.label
                            : formatAmount(fee.amount)}
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums">
                          <span className="text-muted-foreground">—</span>
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-green-600">
                          —
                        </TableCell>
                        <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                          —
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium tabular-nums">
                          {formatAmount(fee.amount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DueBadge amount={feeDue} />
                        </TableCell>
                        <TableCell className="text-center">
                          <StatusBadge status="UNPAID" />
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              title="Print full invoice (all payments of this item)"
                              onClick={() =>
                                printItemFullInvoice({
                                  id: fee.id,
                                  paid_amount: 0,
                                  discount_amount: 0,
                                  line_total_amount: fee.amount,
                                  fine_amount: 0,
                                  fee_month: null,
                                  fee_year: null,
                                  feeItem: {
                                    id: fee.id,
                                    name: fee.name,
                                    amount: fee.amount,
                                    amount_every_subject:
                                      fee.amount_every_subject,
                                    fee_assign_for: fee.fee_assign_for,
                                    subject_fail_count: fee.subject_fail_count,
                                    fee_type_id: fee.fee_type_id,
                                    fee_type_name: fee.fee_type_name,
                                    academic_class: fee.academic_class,
                                    academic_session: fee.academic_session,
                                    FeeItemType: "OneTime" as const,
                                  },
                                  collectionInfos: [],
                                })
                              }
                            >
                              <Printer className="mr-1 h-3 w-3" />
                              Invoice
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 border-amber-500/40 text-xs text-amber-600 hover:bg-amber-500/10 hover:text-amber-700"
                              onClick={() => setCollectingUnbilledFee(fee)}
                            >
                              <Banknote className="mr-1 h-3 w-3" />
                              Collect
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <CollectMonthlyDueDialog
                open={monthlyPayTarget !== null}
                onOpenChange={(open) => {
                  if (!open) setMonthlyPayTarget(null);
                }}
                studentId={student.id}
                monthLabel={monthlyPayTarget?.label ?? ""}
                monthEnum={monthlyPayTarget?.monthEnum ?? ""}
                year={monthlyPayTarget?.year ?? new Date().getFullYear()}
                billedItems={monthlyPayTarget?.billedItems ?? []}
                unbilledItems={monthlyPayTarget?.unbilledItems ?? []}
                studentName={student.name}
                className={className}
                studentPhone={student.student_phone}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* One-time fee breakdown */}
      {(oneTimeItems.length > 0 || unbilledOneTimeFees.length > 0) && (
        <div className="space-y-4">
          <Card className="border-border/50 shadow-sm">
            <CardHeader className="space-y-3 border-b border-border/50 bg-muted/20 pb-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-semibold">
                    One-time Fee Breakdown
                  </CardTitle>
                  <StatusBadge status={oneTimeStatus} />
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                  <span className="text-muted-foreground">
                    Total{" "}
                    <span className="font-semibold tabular-nums text-foreground">
                      {formatAmount(oneTimeGrandTotal)}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Paid{" "}
                    <span className="font-semibold tabular-nums text-green-600">
                      {formatAmount(oneTimeSettled)}
                    </span>
                  </span>
                  {oneTimeGrandDue > 0 ? (
                    <DueBadge amount={oneTimeGrandDue} />
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      Cleared
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-all ${
                      oneTimePct >= 100 ? "bg-green-500" : "bg-amber-500"
                    }`}
                    style={{ width: `${oneTimePct}%` }}
                  />
                </div>
                <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                  {oneTimePct}%
                </span>
              </div>
            </CardHeader>
            {oneTimeGrandDue > 0 && (
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-xs font-medium text-red-600">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                Outstanding due of
                <b className="tabular-nums">{formatAmount(oneTimeGrandDue)}</b>
                across {oneTimeDueItemsCount} item
                {oneTimeDueItemsCount > 1 ? "s" : ""} — collect to clear the
                balance.
              </div>
            )}
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Item
                    </TableHead>
                    {/* <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Academic Year
                    </TableHead> */}
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Late Fee 
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Paid
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Scholarship
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Line Total
                    </TableHead>
                    <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-red-600/80">
                      Due
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {oneTimeItems.map((item) => {
                    const itemDue = Math.max(
                      0,
                      item.line_total_amount +
                        (item.fine_amount ?? 0) -
                        item.paid_amount -
                        item.discount_amount,
                    );
                    const isPaying = payingItemId === item.id;
                    const historyOpen = expandedHistoryId === item.id;
                    const paymentCount = item.collectionInfos?.length ?? 0;
                    const suppDisplay = getSupplementaryFeeDisplay(
                      item.feeItem,
                      item.feeItem?.fee_assign_for === "SUPPLEMENTARY"
                        ? getFailCountForItem(student, item)
                        : undefined,
                    );

                    return (
                      <Fragment key={item.id}>
                        <TableRow
                          className={
                            itemDue > 0
                              ? "bg-red-500/[0.04] hover:bg-red-500/10"
                              : undefined
                          }
                        >
                          <TableCell className="relative text-sm">
                            {itemDue > 0 && (
                              <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r bg-red-500" />
                            )}
                            <div className="font-medium">
                              {item.feeItem?.name ?? "—"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {summary?.sessionName ??
                                student.studentEnrollments?.find(
                                  (e) => e.is_primary,
                                )?.academicSession?.session_name ??
                                "N/A"}
                            </div>
                            {paymentCount > 0 && (
                              <button
                                type="button"
                                onClick={() =>
                                  setExpandedHistoryId(
                                    historyOpen ? null : item.id,
                                  )
                                }
                                className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:underline"
                              >
                                {paymentCount} payment
                                {paymentCount > 1 ? "s" : ""}
                                <ChevronDown
                                  className={`h-3 w-3 transition-transform ${historyOpen ? "rotate-180" : ""}`}
                                />
                              </button>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                            {item.feeItem
                              ? item.feeItem.fee_assign_for ===
                                  "SUPPLEMENTARY" &&
                                item.feeItem.amount_every_subject
                                ? `${formatAmount(item.feeItem.amount_every_subject)} × ${getFailCountForItem(student, item) ?? 1} = ${formatAmount(item.line_total_amount)}`
                                : formatAmount(item.feeItem.amount)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums">
                            <span
                              className={
                                (item.fine_amount ?? 0) > 0
                                  ? "font-medium text-amber-700"
                                  : "text-muted-foreground"
                              }
                            >
                              {formatAmount(item.fine_amount ?? 0)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-green-600">
                            {formatAmount(item.paid_amount)}
                          </TableCell>
                          <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                            {formatAmount(item.discount_amount)}
                          </TableCell>
                          <TableCell className="text-right text-sm font-medium tabular-nums">
                            {formatAmount(
                              item.line_total_amount + (item.fine_amount ?? 0),
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {itemDue > 0 ? (
                              <DueBadge amount={itemDue} />
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                —
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <StatusBadge
                              status={itemStatus(itemDue, item.paid_amount)}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              {paymentCount > 0 && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 text-xs"
                                  title="Print full invoice (all payments of this item)"
                                  onClick={() => printItemFullInvoice(item)}
                                >
                                  <Printer className="mr-1 h-3 w-3" />
                                  Invoice
                                </Button>
                              )}
                              {itemDue > 0 && !isPaying && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-7 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                                  onClick={() => {
                                    setPayingItemId(item.id);
                                    setPayAmount(itemDue.toFixed(2));
                                    setPayMethod("CASH");
                                    setPayNote("");
                                  }}
                                >
                                  <Banknote className="mr-1 h-3 w-3" />
                                  Pay
                                </Button>
                              )}
                              {isPaying && (
                                <span className="text-xs font-medium text-muted-foreground">
                                  Cancel to edit
                                </span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Payment history sub-row (collapsible) */}
                        {historyOpen && paymentCount > 0 && (
                          <TableRow key={`${item.id}-history`}>
                            <TableCell
                              colSpan={9}
                              className="bg-muted/10 px-6 py-2"
                            >
                              <div className="space-y-1">
                                {item.collectionInfos.map((ci) => (
                                  <div
                                    key={ci.id}
                                    className="flex items-center gap-3 text-xs text-muted-foreground"
                                  >
                                    <span className="font-medium text-green-600">
                                      {formatAmount(ci.paid_amount)}
                                    </span>
                                    <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600">
                                      {ci.payment_method}
                                    </span>
                                    <span className="truncate">
                                      by {ci.collectedBy}
                                    </span>
                                    {ci.payment_note && (
                                      <span className="truncate italic text-muted-foreground/70">
                                        &quot;{ci.payment_note}&quot;
                                      </span>
                                    )}
                                    <span className="ml-auto shrink-0">
                                      {new Date(
                                        ci.created_at,
                                      ).toLocaleDateString()}
                                    </span>
                                    <PaymentHistoryPrintButton
                                      student={student}
                                      className={className}
                                      itemName={
                                        item.feeItem?.name ?? "Fee item"
                                      }
                                      period={
                                        item.feeItem?.FeeItemType ===
                                          "Monthly" &&
                                        item.fee_month &&
                                        item.fee_year
                                          ? `${item.fee_month.charAt(0)}${item.fee_month.slice(1).toLowerCase()} ${item.fee_year}`
                                          : "One-time"
                                      }
                                      ci={ci}
                                    />
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                        {/* Inline payment form row */}
                        {isPaying && (
                          <PayFormRow
                            key={`${item.id}-payform`}
                            colSpan={9}
                            itemDue={itemDue}
                            payAmount={payAmount}
                            onPayAmountChange={setPayAmount}
                            payDiscount={payDiscount}
                            onPayDiscountChange={setPayDiscount}
                            payMethod={payMethod}
                            onPayMethodChange={setPayMethod}
                            payNote={payNote}
                            onPayNoteChange={setPayNote}
                            payDate={payDate}
                            onPayDateChange={setPayDate}
                            submitting={submitting}
                            onSubmit={() => handlePay(item.id)}
                            onCancel={() => {
                              setPayingItemId(null);
                              setPayDiscount("");
                            }}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                  {/* Unbilled one-time fees (expected from class structure, not yet billed) */}
                  {unbilledOneTimeFees.map((fee) => (
                    <TableRow
                      key={`unbilled-${fee.id}:${(fee as any).source_enrollment_id ?? ""}`}
                      className="bg-red-500/[0.04] hover:bg-red-500/10"
                    >
                      <TableCell className="relative text-sm">
                        <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r bg-red-500" />
                        <div className="font-medium">{fee.name}</div>
                        <span className="mt-0.5 inline-block rounded bg-amber-500/15 px-1.5 py-px text-[10px] font-semibold uppercase tracking-wide text-amber-600">
                          Not billed yet
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm tabular-nums text-muted-foreground">
                        {summary?.sessionName ??
                          student.studentEnrollments?.find((e) => e.is_primary)
                            ?.academicSession?.session_name ??
                          "N/A"}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {formatAmount(fee.amount)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {formatAmount(0)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {formatAmount(0)}
                      </TableCell>
                      <TableCell className="text-right text-sm tabular-nums text-muted-foreground">
                        {formatAmount(0)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium tabular-nums">
                        {formatAmount(fee.amount)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DueBadge amount={fee.amount} />
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status="UNPAID" />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                          onClick={() => setCollectingUnbilledFee(fee)}
                        >
                          <Banknote className="mr-1 h-3 w-3" />
                          Pay
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 border-t border-border/50 px-4 py-3 text-xs text-muted-foreground">
                <span>
                  Collected: <b className="tabular-nums">{oneTimePct}%</b>
                </span>
                <span>Paid: {formatAmount(oneTimeTotals.paid)}</span>
                <span>Scholarship: {formatAmount(oneTimeTotals.discount)}</span>
                {oneTimeTotals.fine > 0 && (
                  <span className="text-amber-700">
                    Fine: {formatAmount(oneTimeTotals.fine)}
                  </span>
                )}
                <span className="font-medium text-foreground">
                  Total: {formatAmount(oneTimeGrandTotal)}
                </span>
                {oneTimeGrandDue > 0 ? (
                  <DueBadge amount={oneTimeGrandDue} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-semibold text-green-600">
                    <CheckCircle2 className="h-3 w-3" />
                    Fully cleared
                  </span>
                )}
              </div>
            </CardContent>
            <CollectUnbilledFeeDialog
              fee={collectingUnbilledFee}
              studentId={student.id}
              open={collectingUnbilledFee !== null}
              onOpenChange={(open) => {
                if (!open) setCollectingUnbilledFee(null);
              }}
              studentName={student.name}
              className={className}
              studentPhone={student.student_phone}
            />
          </Card>
        </div>
      )}

      {/* Itemized breakdown, grouped by fee type */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-muted-foreground">
          Fee Breakdown
        </h3>

        {student.studentFeeCollections.length === 0 ? (
          <Card className="border-border/50 shadow-sm">
            <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">
                No fee collections recorded for this student yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          student.studentFeeCollections.map((collection) => {
            const collectionTotal = collection.studentFeeCollectionItems.reduce(
              (sum, item) =>
                sum + item.line_total_amount + (item.fine_amount ?? 0),
              0,
            );
            const collectionPaid = collection.studentFeeCollectionItems.reduce(
              (sum, item) => sum + item.paid_amount,
              0,
            );
            const collectionDiscount =
              collection.studentFeeCollectionItems.reduce(
                (sum, item) => sum + item.discount_amount,
                0,
              );
            const collectionFine = collection.studentFeeCollectionItems.reduce(
              (sum, item) => sum + (item.fine_amount ?? 0),
              0,
            );
            const collectionDue = collection.studentFeeCollectionItems.reduce(
              (sum, item) =>
                sum +
                Math.max(
                  0,
                  item.line_total_amount +
                    (item.fine_amount ?? 0) -
                    item.paid_amount -
                    item.discount_amount,
                ),
              0,
            );
            const dueItemsCount = collection.studentFeeCollectionItems.filter(
              (item) =>
                Math.max(
                  0,
                  item.line_total_amount +
                    (item.fine_amount ?? 0) -
                    item.paid_amount -
                    item.discount_amount,
                ) > 0,
            ).length;
            const settled = Math.min(
              collectionTotal,
              collectionPaid + collectionDiscount,
            );
            const collectedPct =
              collectionTotal > 0
                ? Math.round((settled / collectionTotal) * 100)
                : 100;
            const collectionStatus: FeeStatus =
              collectionDue <= 0
                ? "PAID"
                : collectionPaid > 0 || collectedPct > 0
                  ? "PARTIAL"
                  : "UNPAID";

            return (
              <Card key={collection.id} className="border-border/50 shadow-sm">
                <CardHeader className="space-y-3 border-b border-border/50 bg-muted/20 pb-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-semibold">
                        {collection.feeType?.name ?? "Fee Type"}
                      </CardTitle>
                      <StatusBadge status={collectionStatus} />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
                      <span className="text-muted-foreground">
                        Total{" "}
                        <span className="font-semibold tabular-nums text-foreground">
                          {formatAmount(collectionTotal)}
                        </span>
                      </span>
                      <span className="text-muted-foreground">
                        Paid{" "}
                        <span className="font-semibold tabular-nums text-green-600">
                          {formatAmount(settled)}
                        </span>
                      </span>
                      {collectionDue > 0 ? (
                        <DueBadge amount={collectionDue} />
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 text-xs font-semibold text-green-600">
                          <CheckCircle2 className="h-3 w-3" />
                          Cleared
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className={`h-full rounded-full transition-all ${
                          collectedPct >= 100 ? "bg-green-500" : "bg-amber-500"
                        }`}
                        style={{ width: `${collectedPct}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">
                      {collectedPct}%
                    </span>
                  </div>
                </CardHeader>
                {collectionDue > 0 && (
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-red-500/20 bg-red-500/[0.06] px-4 py-2.5 text-xs font-medium text-red-600">
                    <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                    Outstanding due of
                    <b className="tabular-nums">
                      {formatAmount(collectionDue)}
                    </b>
                    across {dueItemsCount} item{dueItemsCount > 1 ? "s" : ""} —
                    collect to clear the balance.
                  </div>
                )}
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableHead className="h-9 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Item
                        </TableHead>
                        {/* <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            Year
                          </TableHead> */}
                        <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Amount
                        </TableHead>
                        <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Late Fee 
                        </TableHead>
                        <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Paid
                        </TableHead>
                        <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Scholarship
                        </TableHead>
                        <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Line Total
                        </TableHead>
                        <TableHead className="h-9 text-right text-xs font-semibold uppercase tracking-wider text-red-600/80">
                          Due
                        </TableHead>
                        <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Status
                        </TableHead>
                        <TableHead className="h-9 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {collection.studentFeeCollectionItems.map((item) => {
                        const itemDue = Math.max(
                          0,
                          item.line_total_amount +
                            (item.fine_amount ?? 0) -
                            item.paid_amount -
                            item.discount_amount,
                        );
                        const isPaying = payingItemId === item.id;
                        const historyOpen = expandedHistoryId === item.id;
                        const paymentCount = item.collectionInfos?.length ?? 0;

                        return (
                          <Fragment key={item.id}>
                            <TableRow
                              className={
                                itemDue > 0
                                  ? "bg-red-500/[0.04] hover:bg-red-500/10"
                                  : undefined
                              }
                            >
                              <TableCell className="relative text-sm">
                                {itemDue > 0 && (
                                  <span className="absolute left-0 top-1/2 h-8 w-[3px] -translate-y-1/2 rounded-r bg-red-500" />
                                )}
                                <div className="font-medium">
                                  {item.feeItem?.name ?? "—"}
                                </div>
                                {item.feeItem?.FeeItemType === "Monthly" &&
                                  item.fee_month &&
                                  item.fee_year && (
                                    <span className="mt-0.5 inline-block rounded bg-muted px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                                      {item.fee_month} {item.fee_year}
                                    </span>
                                  )}
                                {paymentCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setExpandedHistoryId(
                                        historyOpen ? null : item.id,
                                      )
                                    }
                                    className="mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-blue-600 hover:underline"
                                  >
                                    {paymentCount} payment
                                    {paymentCount > 1 ? "s" : ""}
                                    <ChevronDown
                                      className={`h-3 w-3 transition-transform ${historyOpen ? "rotate-180" : ""}`}
                                    />
                                  </button>
                                )}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {item.feeItem
                                  ? formatAmount(item.feeItem.amount)
                                  : "—"}
                              </TableCell>
                              <TableCell className="text-right text-sm">
                                <span
                                  className={`font-medium ${
                                    (item.fine_amount ?? 0) > 0
                                      ? "text-amber-700"
                                      : "text-muted-foreground"
                                  }`}
                                >
                                  {formatAmount(item.fine_amount ?? 0)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatAmount(item.paid_amount)}
                              </TableCell>
                              <TableCell className="text-right text-sm text-muted-foreground">
                                {formatAmount(item.discount_amount)}
                              </TableCell>
                              <TableCell className="text-right text-sm font-medium">
                                {formatAmount(
                                  item.line_total_amount +
                                    (item.fine_amount ?? 0),
                                )}
                              </TableCell>
                              <TableCell className="text-right">
                                {itemDue > 0 ? (
                                  <DueBadge amount={itemDue} />
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    —
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="text-center">
                                <StatusBadge
                                  status={itemStatus(itemDue, item.paid_amount)}
                                />
                              </TableCell>
                              <TableCell className="text-center">
                                <div className="flex items-center justify-center gap-1">
                                  {paymentCount > 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs"
                                      title="Print full invoice (all payments of this item)"
                                      onClick={() => printItemFullInvoice(item)}
                                    >
                                      <Printer className="mr-1 h-3 w-3" />
                                      Invoice
                                    </Button>
                                  )}
                                  {itemDue > 0 && !isPaying && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 border-red-500/40 text-xs text-red-600 hover:bg-red-500/10 hover:text-red-700"
                                      onClick={() => {
                                        setPayingItemId(item.id);
                                        setPayAmount(itemDue.toFixed(2));
                                        setPayMethod("CASH");
                                        setPayNote("");
                                      }}
                                    >
                                      <Banknote className="mr-1 h-3 w-3" />
                                      Pay
                                    </Button>
                                  )}
                                  {isPaying && (
                                    <span className="text-xs font-medium text-muted-foreground">
                                      Cancel to edit
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                            {/* Payment history sub-row (collapsible) */}
                            {historyOpen && paymentCount > 0 && (
                              <TableRow key={`${item.id}-history`}>
                                <TableCell
                                  colSpan={9}
                                  className="bg-muted/10 px-6 py-2"
                                >
                                  <div className="space-y-1">
                                    {item.collectionInfos.map((ci) => (
                                      <div
                                        key={ci.id}
                                        className="flex items-center gap-3 text-xs text-muted-foreground"
                                      >
                                        <span className="font-medium text-green-600">
                                          {formatAmount(ci.paid_amount)}
                                        </span>
                                        <span className="shrink-0 rounded bg-blue-500/10 px-1.5 py-0.5 text-blue-600">
                                          {ci.payment_method}
                                        </span>
                                        <span className="truncate">
                                          by {ci.collectedBy}
                                        </span>
                                        {ci.payment_note && (
                                          <span className="truncate italic text-muted-foreground/70">
                                            &quot;{ci.payment_note}&quot;
                                          </span>
                                        )}
                                        <span className="ml-auto shrink-0">
                                          {new Date(
                                            ci.created_at,
                                          ).toLocaleDateString()}
                                        </span>
                                        <PaymentHistoryPrintButton
                                          student={student}
                                          className={className}
                                          itemName={
                                            item.feeItem?.name ?? "Fee item"
                                          }
                                          period={
                                            item.feeItem?.FeeItemType ===
                                              "Monthly" &&
                                            item.fee_month &&
                                            item.fee_year
                                              ? `${item.fee_month.charAt(0)}${item.fee_month.slice(1).toLowerCase()} ${item.fee_year}`
                                              : "One-time"
                                          }
                                          ci={ci}
                                        />
                                      </div>
                                    ))}
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                            {/* Inline payment form row */}
                            {isPaying && (
                              <PayFormRow
                                key={`${item.id}-payform`}
                                colSpan={9}
                                itemDue={itemDue}
                                payAmount={payAmount}
                                onPayAmountChange={setPayAmount}
                                payDiscount={payDiscount}
                                onPayDiscountChange={setPayDiscount}
                                payMethod={payMethod}
                                onPayMethodChange={setPayMethod}
                                payNote={payNote}
                                onPayNoteChange={setPayNote}
                                payDate={payDate}
                                onPayDateChange={setPayDate}
                                submitting={submitting}
                                onSubmit={() => handlePay(item.id)}
                                onCancel={() => {
                                  setPayingItemId(null);
                                  setPayDiscount("");
                                }}
                              />
                            )}
                          </Fragment>
                        );
                      })}
                    </TableBody>
                  </Table>
                  <div className="flex flex-wrap items-center justify-end gap-x-6 gap-y-1 border-t border-border/50 px-4 py-3 text-xs text-muted-foreground">
                    <span>
                      Collected: <b className="tabular-nums">{collectedPct}%</b>
                    </span>
                    <span>Paid: {formatAmount(collectionPaid)}</span>
                    <span>Scholarship: {formatAmount(collectionDiscount)}</span>
                    {collectionFine > 0 && (
                      <span className="text-amber-700">
                        Late Fee : {formatAmount(collectionFine)}
                      </span>
                    )}
                    <span className="font-medium text-foreground">
                      Total: {formatAmount(collectionTotal)}
                    </span>
                    {collectionDue > 0 ? (
                      <DueBadge amount={collectionDue} />
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-md border border-green-500/30 bg-green-500/10 px-2 py-0.5 font-semibold text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Fully cleared
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentFeeDetailView;
