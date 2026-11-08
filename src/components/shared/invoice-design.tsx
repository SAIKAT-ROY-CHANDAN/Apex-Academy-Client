"use client";

/**
 * Shared invoice/print document builders.
 *
 * These functions return raw HTML strings that are injected into the print
 * template (written to a hidden iframe / new window via document.write()).
 * That is why they cannot be React components — React never mounts in the
 * printed document. Keep the markup self-contained and reference assets
 * through public URLs (e.g. /institution/logo.svg served from /public).
 */

/**
 * The SVG logo is a vector image that stays crisp at any size.
 * The PNG is only 70x78px, so it would look pixelated when used
 * as a large watermark — prefer the SVG in print documents.
 */
export const INSTITUTION_LOGO_URL = "/institution/logo.svg";

const INSTITUTION_NAME = "Apex International College";
const INSTITUTION_TAGLINE = "Education Management System";

/** Watermark — semi-transparent logo covering the whole page, behind content. */
export const invoiceWatermarkHtml = () => `
  <img
    src="${INSTITUTION_LOGO_URL}"
    alt=""
    aria-hidden="true"
    class="invoice-watermark"
  />
`;

/** Header letterhead — institution logo + name, industry-standard position. */
export const invoiceHeaderHtml = () => `
  <header class="invoice-header">
    <div class="invoice-header__brand">
      <img src="${INSTITUTION_LOGO_URL}" alt="${INSTITUTION_NAME} logo" class="invoice-header__logo" />
      <div class="invoice-header__title">
        <h2>${INSTITUTION_NAME}</h2>
        <p>${INSTITUTION_TAGLINE}</p>
      </div>
    </div>
  </header>
`;

/** Kept as a no-op for invoice templates that still call the shared builder. */
export const invoiceFooterHtml = () => "";

/** Common styles for the invoice document (injected into the <style> block). */
export const invoiceStyles = () => `
  @page {
    size: A4;
    margin: 0;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #111827;
    background: #fff;
    min-height: 297mm;
    padding: 18mm 18mm 6mm;
    display: flex;
    flex-direction: column;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Watermark */
  .invoice-watermark {
    position: fixed;
    top: 50%;
    left: 50%;
    width: 60%;
    max-width: 520px;
    transform: translate(-50%, -50%);
    opacity: 0.1;
    pointer-events: none;
    z-index: 0;
  }

  /* Header letterhead */
  .invoice-header {
    border-bottom: 3px solid #1f2937;
    padding-bottom: 16px;
    margin-bottom: 24px;
  }

  .invoice-header__brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .invoice-header__logo {
    width: 56px;
    height: 56px;
    object-fit: contain;
  }

  .invoice-header__title h2 {
    font-size: 22px;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: 0.5px;
  }

  .invoice-header__title p {
    font-size: 12px;
    color: #6b7280;
    margin-top: 2px;
  }

`;
