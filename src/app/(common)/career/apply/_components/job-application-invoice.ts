"use client";

import {
  invoiceFooterHtml,
  invoiceHeaderHtml,
  invoiceStyles,
  invoiceWatermarkHtml,
} from "@/components/shared/invoice-design";

export interface JobApplicationRecord {
  id: string;
  full_name?: string | null;
  phone?: string | null;
  email?: string | null;
  apply_fee?: string | null;
  transaction_id?: string | null;
  payment_status?: string;
  created_at?: string;
  circular?: {
    positionName?: string | null;
    positionType?: string | null;
  } | null;
}

const currency = new Intl.NumberFormat("en-BD", {
  style: "currency",
  currency: "BDT",
  maximumFractionDigits: 0,
});

const formatMoney = (amount?: string | number) =>
  currency.format(Number(amount) || 0);

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

export const generateJobApplicationInvoiceHtml = (
  application: JobApplicationRecord,
  transactionId?: string,
): string => {
  const invoiceNo = `BKJOB-${String(application.id).slice(-8)}`;
  const circular = application.circular;

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Job Application Fee Receipt</title>
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
            border: 1px solid #059669;
            color: #059669;
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
            <h1>JOB APPLICATION FEE RECEIPT</h1>
            <p>Receipt No: ${escapeHtml(invoiceNo)}</p>
            <p>Generated On: ${new Date().toLocaleString()}</p>
            <span class="status-pill">PAID via bKash</span>
          </div>

          <div class="details">
            <table>
              <tr>
                <td>Applicant Name:</td>
                <td>${escapeHtml(application.full_name)}</td>
              </tr>
              <tr>
                <td>Applicant Phone:</td>
                <td>${escapeHtml(application.phone)}</td>
              </tr>
              <tr>
                <td>Applicant Email:</td>
                <td>${escapeHtml(application.email)}</td>
              </tr>
              <tr>
                <td>Position Applied:</td>
                <td>${escapeHtml(circular?.positionName ?? "—")}${circular?.positionType ? ` (${escapeHtml(circular.positionType)})` : ""}</td>
              </tr>
              <tr>
                <td>Payment Method:</td>
                <td>bKash</td>
              </tr>
              <tr>
                <td>Transaction ID:</td>
                <td>${escapeHtml(transactionId ?? application.transaction_id ?? "—")}</td>
              </tr>
            </table>
          </div>

          <div class="amount">
            APPLY FEE PAID:
            ${formatMoney(application.apply_fee || 0)}
          </div>

          <div class="signature">
            <div class="signature-box">
              <p>Applicant Signature</p>
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

export const printJobApplicationInvoice = (
  application: JobApplicationRecord,
  transactionId?: string,
) => {
  printHtml(generateJobApplicationInvoiceHtml(application, transactionId));
};
