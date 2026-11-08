"use client";

import { Download, FileText, ReceiptText } from "lucide-react";
import {
  invoiceFooterHtml,
  invoiceHeaderHtml,
  invoiceStyles,
  invoiceWatermarkHtml,
} from "@/components/shared/invoice-design";
import { Button } from "@/components/ui/button";
import type { TeacherPayrollHistoryRow } from "@/services/payroll/teachers-payroll";
import type { TeacherPayrollRow } from "@/types/modules/payroll";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const formatMoney = (amount: number) => currency.format(amount);

/**
 * Generic print helper.
 *
 * Prints the provided HTML without opening a new browser tab.
 * It creates a temporary hidden iframe, prints it, then removes it.
 */
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

/* -------------------------------------------------------------------------- */
/* Advance Salary Invoice                                                     */
/* -------------------------------------------------------------------------- */

export const generateAdvanceSalaryInvoiceContent = (
  teacher: TeacherPayrollRow,
) => {
  const advanceAmount = teacher.advanceSalary ?? 0;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Advance Salary Invoice - ${teacher.name}</title>

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
                <td>${teacher.name}</td>
              </tr>

              <tr>
                <td>Designation:</td>
                <td>${teacher.designation}</td>
              </tr>

              <tr>
                <td>Department:</td>
                <td>${teacher.department}</td>
              </tr>

              <tr>
                <td>Teacher Type:</td>
                <td>${teacher.teacherType ?? "—"}</td>
              </tr>

              <tr>
                <td>Shift:</td>
                <td>${teacher.shift ?? "—"}</td>
              </tr>

              <tr>
                <td>Monthly Net Salary:</td>
                <td>${formatMoney(teacher.totalSalary)}</td>
              </tr>

              <tr style="background: #fffbeb;">
                <td>
                  <strong>Advance Salary Amount:</strong>
                </td>

                <td>
                  <strong style="color: #b45309;">
                    ${formatMoney(advanceAmount)}
                  </strong>
                </td>
              </tr>

              <tr>
                <td>Deduction From:</td>
                <td>Next Payroll Cycle</td>
              </tr>

              <tr>
                <td>Status:</td>
                <td>${teacher.status ?? "Pending"}</td>
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

export const handleDownloadAdvanceInvoice = (teacher: TeacherPayrollRow) => {
  const invoiceContent = generateAdvanceSalaryInvoiceContent(teacher);

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
  teacherName?: string;
  note?: string;
  paidByAdmin?: string;
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
        <title>Advance Salary Receipt - ${advance.teacherName ?? ""}</title>
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
            <tr><td>Teacher Name:</td><td>${advance.teacherName ?? "—"}</td></tr>
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
              <p>Teacher Signature</p>
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
  teacherName?: string;
  note?: string;
  paidByAdmin?: string;
}) => {
  const receiptContent = generateAdvanceSalaryReceiptContent(advance);
  printHtml(receiptContent);
};

/* -------------------------------------------------------------------------- */
/* Salary Receipt                                                             */
/* -------------------------------------------------------------------------- */

const getMonthLabelForReceipt = (month: number) =>
  new Date(2000, month - 1).toLocaleString("en-US", { month: "long" });

export const generateReceiptContent = (
  teacher: TeacherPayrollRow,
  month?: number,
  year?: number,
) => {
  const isPaid = teacher.status === "PAID";
  const payableAmount = teacher.payableAmount ?? teacher.totalSalary;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Salary ${isPaid ? "Receipt" : "Invoice"} - ${teacher.name}</title>

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

            <p>
              Date: ${new Date().toLocaleDateString()}
            </p>
          </div>

          <div class="receipt-details">
            <table>
              <tr>
                <td>Teacher Name:</td>
                <td>${teacher.name}</td>
              </tr>

              <tr>
                <td>Designation:</td>
                <td>${teacher.designation}</td>
              </tr>

              <tr>
                <td>Department:</td>
                <td>${teacher.department}</td>
              </tr>
              ${month && year ? `<tr>\n                <td>Payroll Period:</td>\n                <td>${getMonthLabelForReceipt(month)} ${year}</td>\n              </tr>` : ""}

              <tr>
                <td>Teacher Type:</td>
                <td>${teacher.teacherType ?? "—"}</td>
              </tr>

              <tr>
                <td>Shift:</td>
                <td>${teacher.shift ?? "—"}</td>
              </tr>

              <tr>
                <td>Net Salary:</td>
                <td>${formatMoney(teacher.totalSalary)}</td>
              </tr>

              <tr>
                <td>Advance Amount:</td>
                <td>${formatMoney(teacher.advanceSalary ?? 0)}</td>
              </tr>

              <tr>
                <td>Overtime Hours:</td>
                <td>${teacher.overtimeHours ?? 0} hours</td>
              </tr>

              <tr>
                <td>Overtime Amount:</td>
                <td>${formatMoney(teacher.overtimeAmount ?? 0)}</td>
              </tr>

              <tr>
                <td>${isPaid ? "Paid Amount:" : "Payable Amount:"}</td>
                <td>${formatMoney(payableAmount)}</td>
              </tr>

              <tr>
                <td>Status:</td>
                <td>${teacher.status ?? "Pending"}</td>
              </tr>
            </table>
          </div>

          <div class="amount">
            ${isPaid ? "TOTAL PAID:" : "TOTAL PAYABLE:"}
            ${formatMoney(payableAmount)}
          </div>

          <div class="signature">
            <div class="signature-box">
              <p>Teacher Signature</p>
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
  teacher: TeacherPayrollRow,
  month?: number,
  year?: number,
) => {
  const receiptContent = generateReceiptContent(teacher, month, year);

  printHtml(receiptContent);
};



export const handleDownloadPaymentReceipt = (
  payment: TeacherPayrollHistoryRow,
) => {
  const receiptContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Salary Receipt - ${payment.teacherName}</title>
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
            <tr><td>Teacher Name:</td><td>${payment.teacherName}</td></tr>
            <tr><td>Designation:</td><td>${payment.designation}</td></tr>
            <tr><td>Payroll Period:</td><td>${getMonthLabelForReceipt(payment.month)} ${payment.year}</td></tr>
            <tr><td>Payment Method:</td><td>${payment.paymentMethod}</td></tr>
            <tr><td>Reference:</td><td>${payment.transactionId ?? payment.paymentNote ?? "—"}</td></tr>
            <tr><td>Paid By:</td><td>${payment.paidByAdmin}</td></tr>
          </table>

          <div class="amount">TOTAL PAID: ${formatMoney(payment.amount)}</div>

          <div class="signature">
            <div class="signature-box">
              <p>Teacher Signature</p>
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

/* -------------------------------------------------------------------------- */
/* View Payroll Button                                                        */
/* -------------------------------------------------------------------------- */

type PayrollInvoiceReceiptProps = {
  teacher: TeacherPayrollRow;
};

const PayrollInvoiceReceipt = ({ teacher }: PayrollInvoiceReceiptProps) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className="h-8 rounded-full border-emerald-200 bg-emerald-50 px-3 text-xs text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700"
      onClick={() => handleDownloadReceipt(teacher)}
      type="button"
    >
      <Download className="h-3.5 w-3.5" />
      Receipt
    </Button>
  );
};

type ViewPayrollButtonProps = {
  teacher: TeacherPayrollRow;
  onClick?: (teacher: TeacherPayrollRow) => void;
};

export const ViewPayrollButton = ({
  teacher,
  onClick,
}: ViewPayrollButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon-sm"
      className="rounded-full text-sky-600 opacity-80 transition hover:bg-sky-50 hover:text-sky-700 hover:opacity-100"
      onClick={() => onClick?.(teacher)}
      type="button"
      title="View payroll"
    >
      <ReceiptText className="h-4 w-4" />
    </Button>
  );
};

/* -------------------------------------------------------------------------- */
/* Advance Salary Invoice Icon                                               */
/* -------------------------------------------------------------------------- */

type AdvanceSalaryInvoiceIconProps = {
  teacher: TeacherPayrollRow;
  hasAdvance: boolean;
};

export const AdvanceSalaryInvoiceIcon = ({
  teacher,
  hasAdvance,
}: AdvanceSalaryInvoiceIconProps) => {
  if (!hasAdvance) return null;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        handleDownloadAdvanceInvoice(teacher);
      }}
      className="ml-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full transition hover:bg-amber-200/60 hover:text-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-300"
      title="View Advance Salary Invoice"
    >
      <FileText className="h-3 w-3" />
    </button>
  );
};

export default PayrollInvoiceReceipt;
