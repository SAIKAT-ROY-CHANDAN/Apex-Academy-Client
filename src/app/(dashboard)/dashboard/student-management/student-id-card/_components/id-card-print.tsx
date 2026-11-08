import type { TIdCardEnrollment, TInstitutionInfo } from "./types";

/**
 * Generic print helper (same approach as payroll receipts).
 * Writes the provided HTML into a temporary hidden iframe and opens the
 * browser print dialog — "Save as PDF" produces the downloadable PDF.
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

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const ordinal = (value: number) => {
  const mod100 = value % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${value}th`;
  switch (value % 10) {
    case 1:
      return `${value}st`;
    case 2:
      return `${value}nd`;
    case 3:
      return `${value}rd`;
    default:
      return `${value}th`;
  }
};

/**
 * Large-format ID card front sheet (~170mm x 107mm on A4), modern design,
 * including full student info.
 */
export const generateIdCardFrontHtml = ({
  enrollment,
  institution,
}: {
  enrollment: TIdCardEnrollment;
  institution?: TInstitutionInfo | null;
}) => {
  const student = enrollment.student;
  const isUniversity = institution?.mode === "COLLEGE_UNIVERSITY";
  const sectionName = escapeHtml(
    enrollment.academicSection?.section_name ?? "",
  );

  const classKey = isUniversity ? "Year" : "Class";
  const classLabel = isUniversity
    ? enrollment.academicClass?.year_level != null
      ? `${ordinal(enrollment.academicClass.year_level)} Year`
      : escapeHtml(enrollment.academicClass?.class_name ?? "N/A")
    : escapeHtml(enrollment.academicClass?.class_name ?? "N/A");

  const name = escapeHtml(student?.name || "N/A");
  const roll = escapeHtml(enrollment.roll_number || "N/A");
  const reg = escapeHtml(enrollment.registration_number || "N/A");
  const session = escapeHtml(enrollment.academicSession?.session_name ?? "");
  const batch = escapeHtml(enrollment.batch?.batch_name ?? "");
  const shift = escapeHtml(enrollment.shift?.name ?? "");
  const phone = student?.student_phone || student?.father_phone || "—";
  const address =
    [student?.sub_district, student?.district]
      .filter(Boolean)
      .map((part) => escapeHtml(part))
      .join(", ") || "—";
  const year = new Date().getFullYear();
  const photo =
    student?.photo ||
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='140'><rect width='100%25' height='100%25' fill='%23e2e8f0'/><text x='50%25' y='58%25' text-anchor='middle' font-size='44' fill='%2394a3b8' font-family='Arial'>?</text></svg>";
  const logoUrl = institution?.logo
    ? escapeHtml(institution.logo)
    : "/institution/logo.svg";
  const institutionName = escapeHtml(institution?.name || "Institution Name");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Student ID Card - ${name}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }

          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            color: #0f172a;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 92vh;
          }

          /* Large card sheet: fills the printable A4 width */
          .id-card {
            width: 170mm;
            height: 107mm;
            border-radius: 6.5mm;
            overflow: hidden;
            border: 0.4mm solid #e2e8f0;
            box-shadow: 0 3mm 8mm rgba(15, 23, 42, 0.28);
            background: #fff;
            display: flex;
            flex-direction: column;
          }

          /* ── Brand header ─────────────────────────────── */
          .id-card__header {
            position: relative;
            overflow: hidden;
            background: linear-gradient(100deg, #1e3a8a 0%, #1d4ed8 45%, #6366f1 100%);
            color: #fff;
            display: flex;
            align-items: center;
            gap: 5mm;
            padding: 5mm 6mm;
          }

          .id-card__bubble {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }

          .id-card__bubble--one {
            top: -16mm;
            right: -9mm;
            width: 38mm;
            height: 38mm;
            background: rgba(255, 255, 255, 0.12);
          }

          .id-card__bubble--two {
            top: -20mm;
            right: 30mm;
            width: 30mm;
            height: 30mm;
            background: rgba(255, 255, 255, 0.08);
          }

          .id-card__logo {
            position: relative;
            width: 17mm;
            height: 17mm;
            object-fit: contain;
            background: #fff;
            border-radius: 50%;
            padding: 1.1mm;
            box-shadow: 0 0.6mm 2mm rgba(0, 0, 0, 0.25);
          }

          .id-card__brand {
            min-width: 0;
            flex: 1;
            position: relative;
          }

          .id-card__institution h2 {
            font-size: 6.6mm;
            font-weight: 700;
            letter-spacing: 0.15mm;
            line-height: 1.12;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .id-card__type {
            display: inline-block;
            margin-top: 1.4mm;
            background: rgba(255, 255, 255, 0.2);
            border-radius: 4mm;
            padding: 0.7mm 3mm;
            font-size: 3.3mm;
            font-weight: 700;
            letter-spacing: 0.9mm;
            text-transform: uppercase;
          }

          .id-card__year {
            align-self: flex-start;
            position: relative;
            background: rgba(255, 255, 255, 0.16);
            color: #dbeafe;
            border-radius: 2mm;
            padding: 1mm 2.2mm;
            font-size: 3.8mm;
            letter-spacing: 0.7mm;
            font-weight: 600;
          }

          /* ── Holder details ───────────────────────────── */
          .id-card__body {
            flex: 1;
            display: flex;
            gap: 6mm;
            padding: 5mm 6mm 0;
            min-height: 0;
          }

          .id-card__photo-frame {
            flex-shrink: 0;
            background: linear-gradient(180deg, #2563eb, #818cf8);
            border-radius: 3.2mm;
            padding: 1mm;
            height: fit-content;
            box-shadow: 0 0.8mm 2.4mm rgba(37, 99, 235, 0.35);
          }

          .id-card__photo {
            display: block;
            width: 34mm;
            height: 40.5mm;
            object-fit: cover;
            border-radius: 2.4mm;
            border: 1.1mm solid #fff;
          }

          .id-card__details {
            flex: 1;
            min-width: 0;
            display: flex;
            flex-direction: column;
            gap: 1.7mm;
            justify-content: center;
          }

          .id-card__name {
            font-size: 7.2mm;
            font-weight: 800;
            color: #0f172a;
            line-height: 1.1;
            text-transform: capitalize;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            margin-bottom: 1.2mm;
          }

          .id-card__row {
            display: flex;
            align-items: baseline;
            font-size: 4.6mm;
            line-height: 1.25;
          }

          .id-card__label {
            color: #94a3b8;
            width: 27mm;
            flex-shrink: 0;
            font-size: 3.9mm;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.3mm;
          }

          .id-card__value {
            color: #334155;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          /* ── Contact footer ───────────────────────────── */
          .id-card__footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 4mm;
            margin-top: auto;
            background: #f8fafc;
            border-top: 0.3mm solid #e2e8f0;
            padding: 2.4mm 6mm;
          }

          .id-card__footer-item {
            display: flex;
            align-items: baseline;
            gap: 2mm;
            font-size: 4.2mm;
            min-width: 0;
          }

          .id-card__footer-label {
            flex-shrink: 0;
            color: #94a3b8;
            font-size: 3.4mm;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.35mm;
          }

          .id-card__footer-value {
            color: #334155;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .id-card__footer-divider {
            flex-shrink: 0;
            width: 0.35mm;
            height: 6mm;
            background: #cbd5e1;
          }

          .print-note {
            margin-top: 14mm;
            font-size: 13px;
            color: #6b7280;
            text-align: center;
          }

          @media print {
            .print-note {
              display: none;
            }

            body {
              min-height: auto;
            }
          }
        </style>
      </head>
      <body>
        <div class="id-card">
          <div class="id-card__header">
            <span class="id-card__bubble id-card__bubble--one"></span>
            <span class="id-card__bubble id-card__bubble--two"></span>

            <img src="${logoUrl}" alt="Logo" class="id-card__logo" />

            <div class="id-card__brand">
              <div class="id-card__institution"><h2>${institutionName}</h2></div>
              <span class="id-card__type">Student ID Card</span>
            </div>

          </div>

          <div class="id-card__body">
            <div class="id-card__photo-frame">
              <img src="${photo}" alt="${name}" class="id-card__photo" />
            </div>

            <div class="id-card__details">
              <div class="id-card__name">${name}</div>
              <div class="id-card__row">
                <span class="id-card__label">Roll</span>
                <span class="id-card__value">${roll}</span>
              </div>
              <div class="id-card__row">
                <span class="id-card__label">Reg</span>
                <span class="id-card__value">${reg}</span>
              </div>
              <div class="id-card__row">
                <span class="id-card__label">${classKey}</span>
                <span class="id-card__value">${classLabel}${
                  !isUniversity && sectionName ? ` &bull; ${sectionName}` : ""
                }</span>
              </div>
              ${
                session
                  ? `<div class="id-card__row">
                      <span class="id-card__label">Session</span>
                      <span class="id-card__value">${session}</span>
                    </div>`
                  : ""
              }
              ${
                batch
                  ? `<div class="id-card__row">
                      <span class="id-card__label">Batch</span>
                      <span class="id-card__value">${batch}${shift ? ` &bull; ${shift}` : ""}</span>
                    </div>`
                  : ""
              }
            </div>
          </div>

          <div class="id-card__footer">
            <span class="id-card__footer-item">
              <span class="id-card__footer-label">Phone</span>
              <span class="id-card__footer-value">${escapeHtml(phone)}</span>
            </span>
            <span class="id-card__footer-divider" aria-hidden="true"></span>
            <span class="id-card__footer-item" style="flex: 1;">
              <span class="id-card__footer-label">Address</span>
              <span class="id-card__footer-value">${address}</span>
            </span>
          </div>
        </div>

        <p class="print-note">
          Choose <strong>"Save as PDF"</strong> in the print dialog to download this ID card as a PDF file.
        </p>
      </body>
    </html>
  `;
};

export const handleDownloadIdCardPdf = ({
  enrollment,
  institution,
}: {
  enrollment: TIdCardEnrollment;
  institution?: TInstitutionInfo | null;
}) => {
  printHtml(generateIdCardFrontHtml({ enrollment, institution }));
};
