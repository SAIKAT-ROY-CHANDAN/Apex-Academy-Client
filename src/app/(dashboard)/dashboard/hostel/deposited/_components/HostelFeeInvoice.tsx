"use client";

import {
  invoiceFooterHtml,
  invoiceHeaderHtml,
  invoiceStyles,
  invoiceWatermarkHtml,
} from "@/components/shared/invoice-design";
import { TAKA } from "./deposited.utils";

export interface HostelFeeInvoiceItem {
  name: string;
  amount: number;
}

export interface HostelFeeInvoiceData {
  referenceId?: string;
  studentName: string;
  className: string;
  department: string;
  batch: string;
  session: string;
  section: string;
  collectionDate: string;
  items: HostelFeeInvoiceItem[];
  meal?: { count: number; rate: number; total: number };
  scholarshipAmount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
}

const formatMoney = (amount: number) =>
  `${TAKA} ${(Number(amount) || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString();
};

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

export const generateHostelFeeInvoiceContent = (data: HostelFeeInvoiceData) => {
  const hasMeal = Boolean(data.meal && data.meal.total > 0);

  const itemRows = data.items
    .map(
      (item, index) => `
        <tr>
          <td class="col-index">${index + 1}</td>
          <td>${item.name || `Fee Item ${index + 1}`}</td>
          <td class="col-amount">${formatMoney(item.amount)}</td>
        </tr>
      `,
    )
    .join("");

  const mealRow = hasMeal
    ? `
        <tr>
          <td class="col-index">${data.items.length + 1}</td>
          <td>Meal charges (${data.meal?.count} meals × ${formatMoney(data.meal?.rate ?? 0)})</td>
          <td class="col-amount">${formatMoney(data.meal?.total ?? 0)}</td>
        </tr>
      `
    : "";

  const netPayable = Math.max(0, data.totalAmount - data.scholarshipAmount);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Hostel Fee Invoice - ${data.studentName}</title>
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
            color: #1f2937;
            font-size: 24px;
            letter-spacing: 1px;
          }

          .header p {
            margin: 5px 0;
            color: #666;
            font-size: 13px;
          }

          .invoice-details table,
          .items-table {
            width: 100%;
            border-collapse: collapse;
          }

          .invoice-details {
            margin: 20px 0;
          }

          .invoice-details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }

          .invoice-details td:first-child {
            font-weight: bold;
            width: 40%;
            color: #374151;
          }

          .items-table {
            margin: 24px 0 12px;
            border: 1px solid #e5e7eb;
          }

          .items-table th {
            background: #f3f4f6;
            text-align: left;
            padding: 10px;
            font-size: 13px;
            color: #374151;
            border-bottom: 1px solid #e5e7eb;
          }

          .items-table td {
            padding: 10px;
            border-bottom: 1px solid #eee;
          }

          .items-table tr:last-child td {
            border-bottom: 0;
          }

          .col-index {
            width: 40px;
            color: #6b7280;
          }

          .col-amount {
            text-align: right;
            white-space: nowrap;
          }

          .summary {
            margin-left: auto;
            width: 55%;
          }

          .summary td {
            padding: 8px 10px;
          }

          .summary td:first-child {
            font-weight: bold;
            color: #374151;
          }

          .summary td:last-child {
            text-align: right;
          }

          .summary .net-row td {
            border-top: 2px solid #333;
            font-weight: bold;
          }

          .paid-box {
            font-size: 24px;
            font-weight: bold;
            color: #16a34a;
            text-align: center;
            margin: 30px 0 14px;
            padding: 18px;
            border: 1px solid #bbf7d0;
            background: #f0fdf4;
            border-radius: 8px;
          }

          .due-box {
            font-size: 18px;
            font-weight: bold;
            color: #dc2626;
            text-align: center;
            margin-bottom: 10px;
            padding: 14px;
            border: 1px solid #fecaca;
            background: #fef2f2;
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
            <h1>HOSTEL FEE INVOICE</h1>
            <p>Date: ${formatDate(data.collectionDate)}</p>
            ${data.referenceId ? `<p>Reference: ${data.referenceId}</p>` : ""}
          </div>

          <div class="invoice-details">
            <table>
              <tr><td>Student Name:</td><td>${data.studentName}</td></tr>
              <tr><td>Class:</td><td>${data.className}</td></tr>
              <tr><td>Group/Department:</td><td>${data.department}</td></tr>
              <tr><td>Batch:</td><td>${data.batch}</td></tr>
              <tr><td>Session:</td><td>${data.session}</td></tr>
              <tr><td>Section:</td><td>${data.section}</td></tr>
            </table>
          </div>

          ${
            data.items.length > 0 || hasMeal
              ? `
                <table class="items-table">
                  <thead>
                    <tr>
                      <th class="col-index">#</th>
                      <th>Description</th>
                      <th class="col-amount">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemRows}
                    ${mealRow}
                  </tbody>
                </table>
              `
              : ""
          }

          <table class="summary">
            <tr>
              <td>Gross Total:</td>
              <td>${formatMoney(data.totalAmount)}</td>
            </tr>
            ${
              data.scholarshipAmount > 0
                ? `
                  <tr>
                    <td>Scholarship Discount:</td>
                    <td>- ${formatMoney(data.scholarshipAmount)}</td>
                  </tr>
                  <tr class="net-row">
                    <td>Net Payable:</td>
                    <td>${formatMoney(netPayable)}</td>
                  </tr>
                `
                : ""
            }
            <tr>
              <td>Paid Amount:</td>
              <td style="color: #16a34a;">${formatMoney(data.paidAmount)}</td>
            </tr>
            <tr>
              <td>Due Amount:</td>
              <td style="color: ${data.dueAmount > 0 ? "#dc2626" : "#16a34a"};">
                ${formatMoney(data.dueAmount)}
              </td>
            </tr>
          </table>

          <div class="paid-box">
            TOTAL PAID: ${formatMoney(data.paidAmount)}
          </div>

          ${
            data.dueAmount > 0
              ? `<div class="due-box">REMAINING DUE: ${formatMoney(data.dueAmount)}</div>`
              : '<p style="text-align: center; color: #16a34a; font-weight: bold;">FULLY PAID</p>'
          }

          <div class="signature">
            <div class="signature-box">
              <p>Student/Guardian Signature</p>
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

interface HostelFeeCollectionDetailRecord {
  id?: string;
  collection_date?: string;
  total_amount?: number | string;
  scholarship_amount?: number | string;
  paid_amount?: number | string;
  due_amount?: number | string;
  student?: {
    name?: string;
    studentEnrollments?: Array<{
      academicClass?: {
        class_name?: string;
        group?: string;
        department?: { department_name?: string };
      };
      batch?: { batch_name?: string };
      academicSection?: { section_name?: string };
      academicSession?: { session_name?: string };
    }>;
  };
  hostelFeeCollectionItems?: Array<{
    item_name?: string;
    item_amount?: number | string;
  }>;
  mealCollection?: {
    meal_count?: number | string;
    meal_rate?: number | string;
    total_amount?: number | string;
  };
}

export const mapCollectionDetailToInvoiceData = (
  res: unknown,
): HostelFeeInvoiceData | null => {
  let raw: unknown =
    res && typeof res === "object" && "success" in res
      ? (res as { data?: unknown }).data
      : res;

  if (raw && typeof raw === "object" && "data" in raw) {
    const nested = (raw as { data?: unknown }).data;
    if (nested && typeof nested === "object") {
      raw = nested;
    }
  }

  if (!raw || typeof raw !== "object") return null;

  const record = raw as HostelFeeCollectionDetailRecord;
  const enrollment = record.student?.studentEnrollments?.[0];

  const items: HostelFeeInvoiceItem[] = Array.isArray(
    record.hostelFeeCollectionItems,
  )
    ? record.hostelFeeCollectionItems.map((item, index) => ({
        name: String(item?.item_name ?? `Fee Item ${index + 1}`),
        amount: Number(item?.item_amount) || 0,
      }))
    : [];

  let meal: HostelFeeInvoiceData["meal"] = undefined;
  if (
    record.mealCollection &&
    typeof record.mealCollection === "object" &&
    !Array.isArray(record.mealCollection)
  ) {
    const count = Number(record.mealCollection.meal_count) || 0;
    const rate = Number(record.mealCollection.meal_rate) || 0;
    const total =
      Number(record.mealCollection.total_amount) || count * rate || 0;
    if (count > 0 && total > 0) {
      meal = { count, rate, total };
    }
  }

  return {
    referenceId: record.id ? String(record.id) : undefined,
    studentName: record.student?.name?.trim() || "Unknown Student",
    className: enrollment?.academicClass?.class_name || "—",
    department:
      enrollment?.academicClass?.group ||
      enrollment?.academicClass?.department?.department_name ||
      "—",
    batch: enrollment?.batch?.batch_name || "—",
    session: enrollment?.academicSession?.session_name || "—",
    section: enrollment?.academicSection?.section_name || "—",
    collectionDate:
      record.collection_date ?? new Date().toISOString().split("T")[0],
    items,
    meal,
    scholarshipAmount: Number(record.scholarship_amount) || 0,
    totalAmount: Number(record.total_amount) || 0,
    paidAmount: Number(record.paid_amount) || 0,
    dueAmount: Number(record.due_amount) || 0,
  };
};

export const handlePrintHostelFeeInvoice = (data: HostelFeeInvoiceData) => {
  const invoiceContent = generateHostelFeeInvoiceContent(data);
  printHtml(invoiceContent);
};
