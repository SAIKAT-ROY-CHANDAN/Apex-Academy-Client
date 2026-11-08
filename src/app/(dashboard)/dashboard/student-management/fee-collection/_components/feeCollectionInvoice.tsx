"use client";

/**
 * Fee-collection invoice/receipt generator.
 * Follows the payroll invoice pattern: compose an A4 HTML document using the
 * shared builders from components/shared/invoice-design and print it through
 * a hidden iframe (no PDF library needed).
 */

import {
  INSTITUTION_LOGO_URL,
  invoiceFooterHtml,
  invoiceStyles,
  invoiceWatermarkHtml,
} from "@/components/shared/invoice-design";
import { getInstitutionInvoiceSettings } from "@/services/institutionInvoiceSetting";
import { loggedInAdminUser } from "@/services/logged-user";

/* ------------------------------- types ---------------------------------- */

export interface FeeCollectionReceiptLine {
  /** Item name shown on the line */
  name: string;
  /** Period label, e.g. "July 2026" or "One-time" */
  period?: string | null;
  /** Line total due before this payment */
  amount: number;
  /** Amount actually paid in this transaction */
  paid: number;
  /** Discount applied in this transaction */
  discount?: number;
}

export interface FeeCollectionReceiptParams {
  studentName: string;
  className?: string;
  studentIdLabel?: string;
  studentPhone?: string;
  method: string;
  note?: string | null;
  entries: FeeCollectionReceiptLine[];
  /** Historical reprint: original payment date (defaults to now) */
  issuedAt?: Date;
  /** Stored collector name (e.g. from CollectionInfo) — overrides logged-in user */
  collectedBy?: string;
  /** Full-item statement mode: real outstanding balance of the item.
   *  When provided, totals become Total Billed / Total Paid / this value,
   *  instead of deriving from the (payment-only) entry lines. */
  outstandingDue?: number;
}

interface InvoiceBranding {
  institutionName: string;
  address?: string;
  phone?: string;
  email?: string;
  invoicePrefix?: string;
  footerNote?: string;
  termsAndConditions?: string;
  logoUrl?: string | null;
}

/* ---------------------------- branding cache ----------------------------- */

let brandingPromise: Promise<InvoiceBranding> | null = null;

const DEFAULT_BRANDING: InvoiceBranding = {
  institutionName: "Apex International College",
};

const escapeHtml = (value: unknown): string =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const loadBranding = (): Promise<InvoiceBranding> => {
  if (!brandingPromise) {
    brandingPromise = getInstitutionInvoiceSettings()
      .then((response?: { data?: unknown }) => {
        const raw = (
          Array.isArray(response?.data) ? response.data[0] : response?.data
        ) as Partial<InvoiceBranding> | null;
        if (!raw) return DEFAULT_BRANDING;
        return {
          institutionName:
            raw.institutionName || DEFAULT_BRANDING.institutionName,
          address: raw.address || "",
          phone: raw.phone || "",
          email: raw.email || "",
          invoicePrefix: raw.invoicePrefix || "INV",
          footerNote: raw.footerNote || "",
          termsAndConditions: raw.termsAndConditions || "",
          logoUrl: raw.logoUrl || null,
        };
      })
      .catch(() => DEFAULT_BRANDING);
  }
  return brandingPromise;
};

const resolveCollectedBy = async (): Promise<string> => {
  try {
    const user = (await loggedInAdminUser()) as { name?: string };
    return user?.name || "Administrator";
  } catch {
    return "Administrator";
  }
};

/* -------------------------------- money --------------------------------- */

const formatMoney = (amount: number): string =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

/* ------------------------------ generator ------------------------------- */

export const generateFeeCollectionInvoiceHtml = (
  params: FeeCollectionReceiptParams,
  branding: InvoiceBranding,
  collectedBy: string,
): string => {
  const {
    studentName,
    className,
    studentIdLabel,
    studentPhone,
    method,
    note,
    entries,
    issuedAt: issuedAtOverride,
    outstandingDue,
  } = params;

  const totalPaid = entries.reduce((sum, e) => sum + e.paid, 0);
  const totalDiscount = entries.reduce((sum, e) => sum + (e.discount || 0), 0);
  const isStatement = outstandingDue !== undefined;
  const totalAmount = isStatement
    ? totalPaid + outstandingDue
    : entries.reduce((sum, e) => sum + e.amount, 0);
  const remainingDue = isStatement
    ? Math.max(0, outstandingDue)
    : Math.max(0, totalAmount - totalPaid - totalDiscount);

  const dueColumnLabel = isStatement ? "Amount Paid" : "Due Amount";
  const paidColumnLabel = isStatement ? "Payment" : "Paid Now";
  const showDiscount = !isStatement && totalDiscount > 0;

  const issuedAt = issuedAtOverride ?? new Date();
  const stamp = [
    issuedAt.getFullYear(),
    String(issuedAt.getMonth() + 1).padStart(2, "0"),
    String(issuedAt.getDate()).padStart(2, "0"),
  ].join("");
  const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  const invoiceNo = `${branding.invoicePrefix || "INV"}-${stamp}-${randomSuffix}`;

  const logoSrc = branding.logoUrl || INSTITUTION_LOGO_URL;

  const contactLine = [branding.address, branding.phone, branding.email]
    .filter(Boolean)
    .map((part) => escapeHtml(part))
    .join(" &nbsp;•&nbsp; ");

  const rowsHtml = entries
    .map(
      (entry, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>
            <span class="item-name">${escapeHtml(entry.name)}</span>
            ${
              entry.period
                ? `<span class="item-period">${escapeHtml(entry.period)}</span>`
                : ""
            }
          </td>
          <td class="num">${formatMoney(entry.amount)}</td>
          <td class="num">${formatMoney(entry.paid)}</td>
          ${showDiscount ? `<td class="num">${formatMoney(entry.discount || 0)}</td>` : ""}
        </tr>`,
    )
    .join("");

  const termsHtml = branding.termsAndConditions
    ? `<div class="terms">
         <h4>Terms & Conditions</h4>
         <p>${escapeHtml(branding.termsAndConditions)}</p>
       </div>`
    : "";

  const trimmedNote = typeof note === "string" ? note.trim() : "";
  const paymentNoteLine = trimmedNote
    ? `Note: ${escapeHtml(trimmedNote)}<br />`
    : "";

  const noteHtml = trimmedNote
    ? `<div class="note-line"><strong>Note:</strong> ${escapeHtml(trimmedNote)}</div>`
    : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Fee Collection Invoice — ${escapeHtml(studentName)} (${invoiceNo})</title>
        <style>
          ${invoiceStyles()}

          .doc-title {
            text-align: center;
            margin: 18px 0 22px;
          }
          .doc-title h1 {
            font-size: 20px;
            letter-spacing: 2px;
            color: #1f2937;
            text-transform: uppercase;
          }
          .doc-title p {
            font-size: 12px;
            color: #6b7280;
            margin-top: 4px;
          }

          .meta-grid {
            display: flex;
            justify-content: space-between;
            gap: 24px;
            margin-bottom: 22px;
          }
          .meta-block h4 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #6b7280;
            margin-bottom: 6px;
          }
          .meta-block p {
            font-size: 13px;
            line-height: 1.7;
          }

          table.items {
            width: 100%;
            border-collapse: collapse;
            margin-top: 8px;
          }
          table.items th {
            background: #f3f4f6;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            color: #374151;
            padding: 9px 10px;
            border-bottom: 2px solid #d1d5db;
          }
          table.items td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            vertical-align: top;
          }
          table.items th.num,
          table.items td.num {
            text-align: right;
            white-space: nowrap;
          }
          .item-name {
            display: block;
            font-weight: 600;
          }
          .item-period {
            display: inline-block;
            margin-top: 3px;
            font-size: 11px;
            color: #6b7280;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            padding: 1px 6px;
          }

          .totals {
            margin-top: 16px;
            margin-left: auto;
            width: 46%;
          }
          .totals table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          .totals td {
            padding: 7px 10px;
          }
          .totals td.num {
            text-align: right;
            tabular-nums: tabular-nums;
          }
          .totals tr.grand td {
            border-top: 2px solid #1f2937;
            font-weight: 700;
            font-size: 15px;
          }
          .totals tr.due td {
            color: #b91c1c;
            font-weight: 700;
          }
          .totals tr.due-zero td {
            color: #15803d;
          }

          .note-line {
            margin-top: 14px;
            font-size: 12px;
            color: #374151;
          }

          .terms {
            margin-top: 26px;
            font-size: 11px;
            color: #6b7280;
          }
          .terms h4 {
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
          }

          .signature-row {
            display: flex;
            justify-content: space-between;
            gap: 40px;
            margin-top: auto;
            padding-top: 56px;
          }
          .signature-box {
            text-align: center;
            min-width: 200px;
          }
          .signature-box .line {
            border-top: 1px solid #9ca3af;
            margin-bottom: 6px;
          }
          .signature-box p {
            font-size: 12px;
            color: #374151;
            line-height: 1.5;
          }

          @media print {
            .page-break { page-break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        ${invoiceWatermarkHtml()}

        <header class="invoice-header">
          <div class="invoice-header__brand">
            <img src="${logoSrc}" alt="${escapeHtml(branding.institutionName)} logo" class="invoice-header__logo" />
            <div class="invoice-header__title">
              <h2>${escapeHtml(branding.institutionName)}</h2>
              <p>${contactLine}</p>
            </div>
          </div>
        </header>

        <div class="doc-title">
          <h1>Fee Collection Invoice</h1>
          <p>Invoice No: ${escapeHtml(invoiceNo)}</p>
        </div>

        <div class="meta-grid">
          <div class="meta-block">
            <h4>Billed To</h4>
            <p>
              <strong>${escapeHtml(studentName)}</strong><br />
              ${className ? `${escapeHtml(className)}<br />` : ""}
              ${studentIdLabel ? `ID: ${escapeHtml(studentIdLabel)}<br />` : ""}
              ${studentPhone ? `Phone: ${escapeHtml(studentPhone)}` : ""}
            </p>
          </div>
          <div class="meta-block" style="text-align:right;">
            <h4>Payment Details</h4>
            <p>
              Date: ${issuedAt.toLocaleDateString()}<br />
              Method: <strong>${escapeHtml(method)}</strong><br />
              ${paymentNoteLine}
              Collected by: <strong>${escapeHtml(collectedBy)}</strong>${
                branding.phone
                  ? `<br />Institution phone: ${escapeHtml(branding.phone)}`
                  : ""
              }
            </p>
          </div>
        </div>

        <table class="items">
          <thead>
            <tr>
              <th style="width:36px;">#</th>
              <th>Description</th>
              <th class="num">${escapeHtml(dueColumnLabel)}</th>
              <th class="num">${escapeHtml(paidColumnLabel)}</th>
              ${showDiscount ? '<th class="num">Scholarship</th>' : ""}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="totals">
          <table>
            ${
              isStatement
                ? `<tr>
                     <td>Total Billed (lifetime)</td>
                     <td class="num">${formatMoney(totalAmount)}</td>
                   </tr>`
                : `<tr>
                     <td>Total Due</td>
                     <td class="num">${formatMoney(totalAmount)}</td>
                   </tr>`
            }
${showDiscount ? `<tr>
                  <td>Total Scholarship</td>
                  <td class="num">${formatMoney(totalDiscount)}</td>
               </tr>` : ""}
            <tr class="grand">
              <td>${isStatement ? "Total Paid" : "Total Paid"}</td>
              <td class="num">${formatMoney(totalPaid)}</td>
            </tr>
            <tr class=${remainingDue > 0 ? '"due"' : '"due due-zero"'}>
              <td>${isStatement ? "Outstanding Due" : "Remaining Due"}</td>
              <td class="num">${formatMoney(remainingDue)}</td>
            </tr>
          </table>
        </div>

        ${noteHtml}
        ${termsHtml}

        <div class="signature-row">
          <div class="signature-box">
            <div class="line"></div>
            <p>Student / Guardian Signature</p>
          </div>
          <div class="signature-box">
            <div class="line"></div>
            <p>Collected by<br /><strong>${escapeHtml(collectedBy)}</strong></p>
          </div>
        </div>

        ${invoiceFooterHtml()}
      </body>
    </html>`;
};

/** Hidden-iframe print helper (same approach as the payroll invoices). */
export const printHtmlDocument = (html: string): void => {
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
        console.error("Failed to print invoice:", error);
        cleanup();
      }
    }, 300);
  };
};

/**
 * Compose + auto-print a fee-collection invoice.
 * Fire-and-forget: failures fall back silently so payment UX is never blocked.
 */
export const printFeeCollectionReceipt = async (
  params: FeeCollectionReceiptParams,
): Promise<void> => {
  try {
    const [branding, resolvedCollector] = await Promise.all([
      loadBranding(),
      resolveCollectedBy(),
    ]);
    const html = generateFeeCollectionInvoiceHtml(
      params,
      branding,
      params.collectedBy || resolvedCollector,
    );
    printHtmlDocument(html);
  } catch (error) {
    console.error("Failed to generate invoice:", error);
  }
};
