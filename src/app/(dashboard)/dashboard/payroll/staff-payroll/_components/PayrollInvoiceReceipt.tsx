"use client";

import { Download, FileText, ReceiptText } from "lucide-react";
import {
  invoiceFooterHtml,
  invoiceHeaderHtml,
  invoiceStyles,
  invoiceWatermarkHtml,
} from "@/components/shared/invoice-design";
import { Button } from "@/components/ui/button";
import { MONTHS } from "@/constant/payroll/teacher-payroll";
import type { StaffPayrollHistoryRow } from "@/services/payroll/staff-payroll";
import type { StaffPayrollRow } from "@/types/modules/payroll";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const formatMoney = (amount: number) => currency.format(amount);

export const printHtml = (html: string) => {
  const iframe = document.createElement("iframe");

  iframe.style.position = "fixed";
  iframe.style.top = "0";
  iframe.style.left = "0";
  iframe.style.width = "1px";
  iframe.style.height = "1px";
  iframe.style.border = "0";
  iframe.style.opacity = "0";
  iframe.style.pointerEvents = "none";

  document.body.appendChild(iframe);

  const iframeDocument = iframe.contentDocument;
  const iframeWindow = iframe.contentWindow;

  if (!iframeDocument || !iframeWindow) {
    document.body.removeChild(iframe);
    console.error("Unable to create print document.");
    return;
  }

  iframeDocument.open();
  iframeDocument.write(html);
  iframeDocument.close();

  const cleanup = () => {
    setTimeout(() => {
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);
  };

  iframeWindow.onafterprint = cleanup;

  iframe.onload = () => {
    setTimeout(() => {
      try {
        iframeWindow.focus();
        iframeWindow.print();
      } catch (error) {
        console.error("Failed to print:", error);
        cleanup();
      }
    }, 300);
  };
};

export const generateAdvanceSalaryInvoiceContent = (staff: StaffPayrollRow) => {
  const advanceAmount = staff.advanceSalary ?? 0;
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Advance Salary Invoice - ${staff.name}</title>
        <style>
          ${invoiceStyles()}

          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            color: #b45309;
            font-size: 24px;
          }

          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
          }

          .invoice-details {
            margin: 30px 0;
          }

          .invoice-details table {
            width: 100%;
            border-collapse: collapse;
          }

          .invoice-details td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
          }

          .invoice-details td:first-child {
            font-weight: bold;
            width: 40%;
            color: #374151;
          }

          .amount-box {
            font-size: 28px;
            font-weight: bold;
            color: #b45309;
            text-align: center;
            margin: 40px 0;
            padding: 25px;
            background: #fffbeb;
            border: 2px solid #fbbf24;
            border-radius: 10px;
          }

          .signature {
            margin-top: 70px;
            display: flex;
            justify-content: space-between;
          }

          .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
          }

          .terms {
            margin-top: 30px;
            padding: 15px;
            background: #f9fafb;
            border-radius: 8px;
            font-size: 12px;
            color: #4b5563;
          }
        </style>
      </head>

      <body>
        ${invoiceWatermarkHtml()}
        <div class="container" style="position: relative; z-index: 1;">
          ${invoiceHeaderHtml()}

          <div class="header">
            <h1>ADVANCE SALARY INVOICE</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="invoice-details">
            <table>
              <tr>
                <td>Employee Name:</td>
                <td>${staff.name}</td>
              </tr>

              <tr>
                <td>Designation:</td>
                <td>${staff.designation}</td>
              </tr>

              <tr>
                <td>Department:</td>
                <td>${staff.department ?? "—"}</td>
              </tr>

              <tr>
                <td>Monthly Net Salary:</td>
                <td>${formatMoney(staff.totalSalary)}</td>
              </tr>
            </table>
          </div>

          <div class="amount-box">
            ADVANCE AMOUNT: ${formatMoney(advanceAmount)}
          </div>

          <div class="terms">
            <strong>Terms & Conditions:</strong>
            <br />
            1. This advance salary amount will be deducted from the next payable
            salary.
            <br />
            2. The advance is provided as per the organization's policy.
            <br />
            3. This invoice is valid for the current payroll period only.
          </div>

          <div class="signature">
            <div class="signature-box">
              <p>Employee Signature</p>
            </div>

            <div class="signature-box">
              <p>Authority Signature</p>
            </div>
          </div>

          ${invoiceFooterHtml()}
        </div>
      </body>
    </html>
  `;
};

export const handleDownloadAdvanceInvoice = (staff: StaffPayrollRow) => {
  const invoiceContent = generateAdvanceSalaryInvoiceContent(staff);
  printHtml(invoiceContent);
};

export const generateAdvanceSalaryReceiptContent = (advance: {
  id: string;
  advance_amount: number;
  reason: string;
  given_at: string;
  payment_method: string;
  transaction_id: string | null;
  payment_note: string | null;
  staffName?: string;
  paidByAdmin?: string;
  note?: string;
}) => {
  const reference =
    advance.payment_method === "BKASH"
      ? advance.transaction_id ?? "—"
      : advance.payment_note ?? "—";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Advance Salary Receipt - ${advance.staffName ?? ""}</title>
        <style>
          ${invoiceStyles()}

          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            color: #b45309;
            font-size: 24px;
          }

          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }

          td {
            padding: 11px;
            border-bottom: 1px solid #ddd;
          }

          td:first-child {
            font-weight: bold;
            width: 40%;
          }

          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #b45309;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 2px solid #fbbf24;
            background: #fffbeb;
            border-radius: 8px;
          }

          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }

          .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        ${invoiceWatermarkHtml()}
        <div class="container" style="position: relative; z-index: 1;">
          ${invoiceHeaderHtml()}

          <div class="header">
            <h1>ADVANCE SALARY RECEIPT</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <table>
            <tr><td>Staff Name:</td><td>${advance.staffName ?? "—"}</td></tr>
            <tr><td>Advance Amount:</td><td>${formatMoney(advance.advance_amount)}</td></tr>
            <tr><td>Reason:</td><td>${advance.reason || "—"}</td></tr>
            <tr><td>Date Issued:</td><td>${new Date(advance.given_at).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</td></tr>
            <tr><td>Payment Method:</td><td>${advance.payment_method}</td></tr>
            <tr><td>Reference:</td><td>${reference}</td></tr>
            ${advance.note ? `<tr><td>Note:</td><td>${advance.note}</td></tr>` : ""}
            <tr><td>Paid By:</td><td>${(advance as any).paidByAdmin ?? (advance as any).paid_by_admin?.name ?? "—"}</td></tr>
          </table>

          <div class="amount">ADVANCE AMOUNT: ${formatMoney(advance.advance_amount)}</div>

          <div class="signature">
            <div class="signature-box">
              <p>Staff Signature</p>
            </div>

            <div class="signature-box">
              <p>Authority Signature</p>
            </div>
          </div>

          ${invoiceFooterHtml()}
        </div>
      </body>
    </html>
  `;
};

export const handleDownloadAdvanceSalaryReceipt = (advance: {
  id: string;
  advance_amount: number;
  reason: string;
  given_at: string;
  payment_method: string;
  transaction_id: string | null;
  payment_note: string | null;
  staffName?: string;
  paidByAdmin?: string;
  note?: string;
}) => {
  const receiptContent = generateAdvanceSalaryReceiptContent(advance);
  printHtml(receiptContent);
};

const getMonthLabel = (month: number) =>
  MONTHS.find((m) => Number(m.value) === month)?.label ?? month;

export const generateReceiptContent = (
  staff: StaffPayrollRow,
  month?: number,
  year?: number,
) => {
  const isPaid = staff.status === "PAID";
  const payableAmount = staff.payableAmount ?? staff.totalSalary;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Salary ${isPaid ? "Receipt" : "Invoice"} - ${staff.name}</title>
        <style>
          ${invoiceStyles()}

          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }

          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
          }

          .receipt-details {
            margin: 20px 0;
          }

          .receipt-details table {
            width: 100%;
            border-collapse: collapse;
          }

          .receipt-details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }

          .receipt-details td:first-child {
            font-weight: bold;
            width: 40%;
          }

          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #dbeafe;
            background: #eff6ff;
            border-radius: 8px;
          }

          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }

          .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        ${invoiceWatermarkHtml()}
        <div class="container" style="position: relative; z-index: 1;">
          ${invoiceHeaderHtml()}

          <div class="header">
            <h1>${isPaid ? "SALARY RECEIPT" : "SALARY INVOICE"}</h1>
            <p>Date: ${new Date().toLocaleDateString()}</p>
          </div>

          <div class="receipt-details">
            <table>
              <tr>
                <td>Staff Name:</td>
                <td>${staff.name}</td>
              </tr>

              <tr>
                <td>Designation:</td>
                <td>${staff.designation}</td>
              </tr>

              <tr>
                <td>Department:</td>
                <td>${staff.department ?? "—"}</td>
              </tr>
              ${month && year ? `<tr>\n                <td>Payroll Period:</td>\n                <td>${getMonthLabel(month)} ${year}</td>\n              </tr>` : ""}

              <tr>
                <td>Total Salary:</td>
                <td>${formatMoney(staff.totalSalary)}</td>
              </tr>

              <tr>
                <td>Advance Amount:</td>
                <td>${formatMoney(staff.advanceSalary ?? 0)}</td>
              </tr>

              <tr>
                <td>${isPaid ? "Paid Amount:" : "Payable Amount:"}</td>
                <td>${formatMoney(payableAmount)}</td>
              </tr>

              <tr>
                <td>Status:</td>
                <td>${staff.status ?? "Pending"}</td>
              </tr>
            </table>
          </div>

          <div class="amount">
            ${isPaid ? "TOTAL PAID:" : "TOTAL PAYABLE:"}
            ${formatMoney(payableAmount)}
          </div>

          <div class="signature">
            <div class="signature-box">
              <p>Staff Signature</p>
            </div>

            <div class="signature-box">
              <p>Authority Signature</p>
            </div>
          </div>

          ${invoiceFooterHtml()}
        </div>
      </body>
    </html>
  `;
};

export const handleDownloadReceipt = (
  staff: StaffPayrollRow,
  month?: number,
  year?: number,
) => {
  const receiptContent = generateReceiptContent(staff, month, year);

  printHtml(receiptContent);
};



export const handleDownloadPaymentReceipt = (
  payment: StaffPayrollHistoryRow,
) => {
  const receiptContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Salary Receipt - ${payment.staffName}</title>
        <style>
          ${invoiceStyles()}

          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
          }

          .header h1 {
            margin: 0;
            color: #333;
            font-size: 24px;
          }

          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }

          td {
            padding: 11px;
            border-bottom: 1px solid #ddd;
          }

          td:first-child {
            font-weight: bold;
            width: 40%;
          }

          .amount {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #dbeafe;
            background: #eff6ff;
            border-radius: 8px;
          }

          .signature {
            margin-top: 60px;
            display: flex;
            justify-content: space-between;
          }

          .signature-box {
            width: 45%;
            border-top: 1px solid #333;
            padding-top: 10px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        ${invoiceWatermarkHtml()}
        <div class="container" style="position: relative; z-index: 1;">
          ${invoiceHeaderHtml()}

          <div class="header">
            <h1>SALARY PAYMENT RECEIPT</h1>
            <p>Date: ${new Date(payment.paidAt).toLocaleDateString()}</p>
          </div>

          <table>
            <tr><td>Staff Name:</td><td>${payment.staffName}</td></tr>
            <tr><td>Designation:</td><td>${payment.designation}</td></tr>
            <tr><td>Payroll Period:</td><td>${getMonthLabel(payment.month)} ${payment.year}</td></tr>
            <tr><td>Payment Method:</td><td>${payment.paymentMethod}</td></tr>
            <tr><td>Reference:</td><td>${payment.transactionId ?? payment.paymentNote ?? "—"}</td></tr>
            <tr><td>Paid By:</td><td>${payment.paidByAdmin}</td></tr>
          </table>

          <div class="amount">TOTAL PAID: ${formatMoney(payment.amount)}</div>

          <div class="signature">
            <div class="signature-box">
              <p>Staff Signature</p>
            </div>

            <div class="signature-box">
              <p>Authority Signature</p>
            </div>
          </div>

          ${invoiceFooterHtml()}
        </div>
      </body>
    </html>
  `;

  printHtml(receiptContent);
};

type PayrollInvoiceReceiptProps = {
  staff: StaffPayrollRow;
};

const PayrollInvoiceReceipt = ({ staff }: PayrollInvoiceReceiptProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 rounded-full"
      onClick={() => handleDownloadReceipt(staff)}
      type="button"
    >
      <Download className="h-3.5 w-3.5" />
      Receipt
    </Button>
  );
};

type ViewPayrollButtonProps = {
  staff: StaffPayrollRow;
  onClick?: (staff: StaffPayrollRow) => void;
};

export const ViewPayrollButton = ({
  staff,
  onClick,
}: ViewPayrollButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-full text-sky-600"
      onClick={() => onClick?.(staff)}
      type="button"
      title="View payroll"
    >
      <ReceiptText className="h-4 w-4" />
    </Button>
  );
};

export const AdvanceSalaryInvoiceIcon = ({
  staff,
  hasAdvance,
}: {
  staff: StaffPayrollRow;
  hasAdvance: boolean;
}) => {
  if (!hasAdvance) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleDownloadAdvanceInvoice(staff);
      }}
      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full"
    >
      <FileText className="h-3 w-3" />
    </button>
  );
};

export default PayrollInvoiceReceipt;
