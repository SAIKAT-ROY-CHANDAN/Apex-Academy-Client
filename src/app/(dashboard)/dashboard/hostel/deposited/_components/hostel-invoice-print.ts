"use client";

import {
  invoiceFooterHtml,
  invoiceHeaderHtml,
  invoiceStyles,
  invoiceWatermarkHtml,
} from "@/components/shared/invoice-design";
import { getHostelFeeCollectionById } from "@/services/hostelFeeCollection";
import type { HostelFeeCollectionRecord } from "./deposited.utils";
import { formatDate } from "./deposited.utils";

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const formatMoney = (amount?: number) => currency.format(Number(amount) || 0);

const escapeHtml = (value?: string | null) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

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

export const generateHostelInvoiceContent = (
  record: HostelFeeCollectionRecord,
): string => {
  const enrollment = record.student?.studentEnrollments?.[0];
  const invoice = record.hostelInvoice;

  const itemsTotal = (record.hostelFeeCollectionItems ?? []).reduce(
    (sum, item) => sum + (Number(item.item_amount) || 0),
    0,
  );
  const meal = record.mealCollection;
  const mealTotal = Number(meal?.total_amount) || 0;
  // total_amount carries charges + any previous outstanding due settled into
  // this collection — surface it as its own line so the breakdown adds up.
  const carriedDue = Math.max(
    0,
    (Number(record.total_amount) || 0) - itemsTotal - mealTotal,
  );

  const statusLabel = invoice?.status ?? "—";
  const statusColor =
    invoice?.status === "PAID"
      ? "#059669"
      : invoice?.status === "PARTIAL"
        ? "#d97706"
        : "#dc2626";

  const itemRows = (record.hostelFeeCollectionItems ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.item_name)}</td>
          <td class="num">${formatMoney(item.item_amount)}</td>
        </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Hostel Fee Invoice${invoice?.invoice_no ? ` - ${invoice.invoice_no}` : ""}</title>
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

          .status-pill {
            display: inline-block;
            margin-top: 10px;
            padding: 4px 14px;
            border-radius: 999px;
            border: 1px solid ${statusColor};
            color: ${statusColor};
            font-size: 12px;
            font-weight: bold;
            letter-spacing: 0.5px;
          }

          .details {
            margin: 20px 0;
          }

          .details table {
            width: 100%;
            border-collapse: collapse;
          }

          .details td {
            padding: 10px;
            border-bottom: 1px solid #ddd;
          }

          .details td:first-child {
            font-weight: bold;
            width: 40%;
            color: #374151;
          }

          .section-title {
            margin: 26px 0 10px;
            font-size: 13px;
            font-weight: bold;
            letter-spacing: 1px;
            color: #374151;
            text-transform: uppercase;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 6px;
          }

          .line-items {
            width: 100%;
            border-collapse: collapse;
          }

          .line-items th {
            text-align: left;
            padding: 8px 10px;
            background: #f9fafb;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
            color: #374151;
          }

          .line-items td {
            padding: 8px 10px;
            border-bottom: 1px solid #eee;
            font-size: 13px;
          }

          .line-items .num {
            text-align: right;
          }

          .amount {
            font-size: 22px;
            font-weight: bold;
            color: #2563eb;
            text-align: center;
            margin: 30px 0;
            padding: 20px;
            border: 1px solid #dbeafe;
            background: #eff6ff;
            border-radius: 8px;
          }

          .totals td:last-child {
            text-align: right;
          }

          .due-note {
            margin-top: 8px;
            font-size: 12px;
            color: #6b7280;
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
            <p>Invoice No: ${escapeHtml(invoice?.invoice_no ?? "—")}</p>
            <p>Generated On: ${formatDate(invoice?.issue_date)} &nbsp;&bull;&nbsp; Payment Due: ${formatDate(invoice?.due_date)}</p>
            <span class="status-pill">${escapeHtml(statusLabel)}</span>
          </div>

          <div class="details">
            <table>
              <tr>
                <td>Student Name:</td>
                <td>${escapeHtml(record.student?.name)}</td>
              </tr>
              <tr>
                <td>Class:</td>
                <td>${escapeHtml(enrollment?.academicClass?.class_name ?? "—")}</td>
              </tr>
              <tr>
                <td>Group/Department:</td>
                <td>${escapeHtml(enrollment?.academicClass?.group ?? enrollment?.academicClass?.department?.department_name ?? "—")}</td>
              </tr>
              <tr>
                <td>Batch:</td>
                <td>${escapeHtml(enrollment?.batch?.batch_name ?? "—")}</td>
              </tr>
              <tr>
                <td>Session:</td>
                <td>${escapeHtml(enrollment?.academicSession?.session_name ?? "—")}</td>
              </tr>
              <tr>
                <td>Section:</td>
                <td>${escapeHtml(enrollment?.academicSection?.section_name ?? "—")}</td>
              </tr>
              <tr>
                <td>Collection Date:</td>
                <td>${formatDate(record.collection_date)}</td>
              </tr>
              ${
                record.payment_method
                  ? `<tr>
                      <td>Payment Method:</td>
                      <td>${record.payment_method === "BKASH" ? "bKash" : "Cash"}</td>
                    </tr>`
                  : ""
              }
            </table>
          </div>

          ${
            itemRows
              ? `<div class="section-title">Fee Charges</div>
            <table class="line-items">
              <thead>
                <tr><th>Description</th><th class="num">Amount</th></tr>
              </thead>
              <tbody>
                ${itemRows}
                ${
                  meal && mealTotal > 0
                    ? `<tr>
                        <td>Meal Charges (${meal.meal_count} meals &times; ${formatMoney(meal.meal_rate)})</td>
                        <td class="num">${formatMoney(meal.total_amount)}</td>
                      </tr>`
                    : ""
                }
                ${
                  carriedDue > 0
                    ? `<tr>
                        <td>Previous Due Carried Forward</td>
                        <td class="num">${formatMoney(carriedDue)}</td>
                      </tr>`
                    : ""
                }
              </tbody>
            </table>`
              : ""
          }

          <div class="section-title">Summary</div>
          <table class="line-items totals">
            <tbody>
              <tr><td>Total Amount</td><td class="num">${formatMoney(record.total_amount)}</td></tr>
              <tr><td>Scholarship</td><td class="num">- ${formatMoney(record.scholarship_amount)}</td></tr>
              <tr><td>Paid Amount</td><td class="num">${formatMoney(record.paid_amount)}</td></tr>
              <tr><td><strong>Due Amount (at generation)</strong></td><td class="num"><strong>${formatMoney(invoice?.due_amount ?? record.due_amount)}</strong></td></tr>
            </tbody>
          </table>
          ${
            (Number(invoice?.due_amount ?? record.due_amount) || 0) > 0
              ? `<p class="due-note">Please settle the outstanding due by ${formatDate(invoice?.due_date)}.</p>`
              : ""
          }

          <div class="amount">
            NET PAYABLE (after scholarship):
            ${formatMoney((Number(record.total_amount) || 0) - (Number(record.scholarship_amount) || 0))}
          </div>

          <div class="signature">
            <div class="signature-box">
              <p>Student Signature</p>
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

export const printHostelInvoiceFromRecord = (
  record: HostelFeeCollectionRecord,
) => {
  printHtml(generateHostelInvoiceContent(record));
};

/** Fetches the full collection record by id and opens the print dialog. */
export const handleGenerateHostelInvoice = async (
  collectionId: string,
): Promise<boolean> => {
  try {
    const res = await getHostelFeeCollectionById(collectionId);
    if (!res?.success || !res?.data) {
      console.error("Failed to load collection for invoice:", res?.message);
      return false;
    }
    printHostelInvoiceFromRecord(res.data as HostelFeeCollectionRecord);
    return true;
  } catch (error) {
    console.error("Failed to generate hostel invoice:", error);
    return false;
  }
};
