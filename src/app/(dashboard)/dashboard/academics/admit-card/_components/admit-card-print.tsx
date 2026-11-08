import type { TAdmitEnrollment, TAdmitExam, TInstitutionInfo } from "./types";

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

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
};

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
 * Large-format admit card sheet (~170mm wide on A4), including full
 * student info, the selected exam info and its subject-wise schedule.
 */
export const generateAdmitCardHtml = ({
  enrollment,
  exam,
  institution,
}: {
  enrollment: TAdmitEnrollment;
  exam: TAdmitExam;
  institution?: TInstitutionInfo | null;
}) => {
  const student = enrollment.student;
  const isUniversity = institution?.mode === "COLLEGE_UNIVERSITY";

  const classKey = isUniversity ? "Year" : "Class";
  const classLabel = isUniversity
    ? enrollment.academicClass?.year_level != null
      ? `${ordinal(enrollment.academicClass.year_level)} Year`
      : escapeHtml(enrollment.academicClass?.class_name ?? "N/A")
    : escapeHtml(enrollment.academicClass?.class_name ?? "N/A");

  const name = escapeHtml(student?.name || "N/A");
  const roll = escapeHtml(enrollment.roll_number || "N/A");
  const reg = escapeHtml(enrollment.registration_number || "N/A");
  const sectionName = escapeHtml(
    enrollment.academicSection?.section_name ?? "",
  );
  const session = escapeHtml(enrollment.academicSession?.session_name ?? "");
  const phone = student?.student_phone || student?.father_phone || "";
  const photo =
    student?.photo ||
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='140'><rect width='100%25' height='100%25' fill='%23e2e8f0'/><text x='50%25' y='58%25' text-anchor='middle' font-size='44' fill='%2394a3b8' font-family='Arial'>?</text></svg>";
  const logoUrl = institution?.logo
    ? escapeHtml(institution.logo)
    : "/institution/logo.svg";
  const institutionName = escapeHtml(institution?.name || "Institution Name");
  const institutionAddress = escapeHtml(institution?.address ?? "");
  const examName = escapeHtml(exam.exam_name);
  const examDate = formatDate(exam.exam_date);
  const programName = escapeHtml(
    exam.program?.program_name ||
      enrollment.academicClass?.program?.program_name ||
      "",
  );
  const departmentName = escapeHtml(
    exam.department?.department_name ||
      enrollment.academicClass?.department?.department_name ||
      "",
  );
  const batchName = escapeHtml(
    enrollment.batch?.batch_name || exam.batch?.batch_name || "",
  );
  const scheduleYear = exam.examSchedules?.[0]?.examTakenYear;
  const examDateYear = exam.exam_date
    ? new Date(exam.exam_date).getFullYear()
    : null;
  const examYear =
    scheduleYear != null
      ? String(scheduleYear)
      : examDateYear != null
        ? String(examDateYear)
        : "";

  const schedules = (exam.examSchedules ?? [])
    .slice()
    .sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    );

  const scheduleRows = schedules
    .map(
      (s, i) => `
        <tr>
          <td style="text-align: center;">${i + 1}</td>
          <td class="subject-cell">${escapeHtml(s.subject?.name ?? "—")}</td>
          <td>${formatDate(s.examDate)}</td>
          <td style="white-space: nowrap;">${formatTime(s.startTime)}${s.endTime ? ` – ${formatTime(s.endTime)}` : ""}</td>
          <td style="text-align: center;">${s.fullMarks != null ? escapeHtml(s.fullMarks) : "—"}</td>
        </tr>`,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Admit Card - ${name} - ${examName}</title>
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

          /* Large admit card sheet: fills the printable A4 width */
          .admit-card {
            width: 170mm;
            min-height: 118mm;
            border-radius: 5mm;
            overflow: hidden;
            border: 0.5mm solid #1e3a8a;
            box-shadow: 0 3mm 8mm rgba(15, 23, 42, 0.28);
            background: #fff;
            display: flex;
            flex-direction: column;
          }

          /* ── Institution header ───────────────────────── */
          .admit-card__header {
            position: relative;
            overflow: hidden;
            background: linear-gradient(100deg, #1e3a8a 0%, #1d4ed8 55%, #6366f1 100%);
            color: #fff;
            display: flex;
            align-items: center;
            gap: 4.5mm;
            padding: 4.5mm 6mm;
          }

          .admit-card__bubble {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
          }

          .admit-card__bubble--one {
            top: -14mm;
            right: -8mm;
            width: 34mm;
            height: 34mm;
            background: rgba(255, 255, 255, 0.12);
          }

          .admit-card__bubble--two {
            top: -18mm;
            right: 26mm;
            width: 26mm;
            height: 26mm;
            background: rgba(255, 255, 255, 0.08);
          }

          .admit-card__logo {
            position: relative;
            width: 15.5mm;
            height: 15.5mm;
            object-fit: contain;
            background: #fff;
            border-radius: 50%;
            padding: 1mm;
            box-shadow: 0 0.6mm 2mm rgba(0, 0, 0, 0.25);
          }

          .admit-card__brand {
            flex: 1;
            min-width: 0;
            position: relative;
          }

          .admit-card__brand h2 {
            font-size: 6.4mm;
            font-weight: 700;
            letter-spacing: 0.15mm;
            line-height: 1.12;
          }

          .admit-card__brand p {
            font-size: 3mm;
            opacity: 0.85;
            margin-top: 0.6mm;
          }

          .admit-card__ribbon {
            position: relative;
            align-self: center;
            background: #fff;
            color: #1d4ed8;
            border-radius: 1.6mm;
            padding: 1.4mm 3.2mm;
            font-size: 3.9mm;
            font-weight: 800;
            letter-spacing: 0.7mm;
            text-transform: uppercase;
            box-shadow: 0 0.6mm 1.8mm rgba(0, 0, 0, 0.22);
          }

          /* ── Exam strip ───────────────────────────────── */
          .admit-card__exam-strip {
            background: #eff6ff;
            border-bottom: 0.3mm solid #bfdbfe;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 3mm;
            padding: 1.8mm 6mm;
            font-size: 3.9mm;
            color: #1e40af;
          }

          .admit-card__exam-name {
            font-weight: 800;
          }

          .admit-card__exam-name::before {
            content: "";
            display: inline-block;
            width: 2.2mm;
            height: 2.2mm;
            border-radius: 50%;
            background: #3b82f6;
            margin-right: 2mm;
            vertical-align: middle;
          }

          .admit-card__exam-date {
            flex-shrink: 0;
            font-weight: 600;
            color: #2563eb;
          }

          /* ── Holder details ───────────────────────────── */
          .admit-card__body {
            display: flex;
            gap: 5mm;
            padding: 4mm 6mm;
          }

          .admit-card__details {
            flex: 1;
            min-width: 0;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 1.8mm 5mm;
            align-content: center;
          }

          .admit-card__row {
            display: flex;
            align-items: baseline;
            font-size: 3.8mm;
            line-height: 1.35;
            min-width: 0;
          }

          .admit-card__row--wide {
            grid-column: 1 / -1;
          }

          .admit-card__label {
            color: #64748b;
            width: 23mm;
            flex-shrink: 0;
            font-size: 3.2mm;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.15mm;
          }

          .admit-card__colon {
            color: #94a3b8;
            width: 2.5mm;
            flex-shrink: 0;
            font-weight: 700;
            text-align: center;
          }

          .admit-card__value {
            color: #0f172a;
            font-weight: 700;
            flex: 1;
            min-width: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            padding-left: 1.5mm;
          }

          .admit-card__photo-frame {
            flex-shrink: 0;
            align-self: flex-start;
            background: linear-gradient(180deg, #2563eb, #818cf8);
            border-radius: 2.8mm;
            padding: 1mm;
            box-shadow: 0 0.8mm 2.4mm rgba(37, 99, 235, 0.35);
          }

          .admit-card__photo {
            display: block;
            width: 31mm;
            height: 37mm;
            object-fit: cover;
            border-radius: 2mm;
            border: 1mm solid #fff;
          }

          /* ── Subject schedule ─────────────────────────── */
          .admit-card__schedule {
            padding: 0 6mm 4mm;
          }

          .admit-card__schedule h3 {
            font-size: 4mm;
            text-transform: uppercase;
            letter-spacing: 0.4mm;
            color: #1e3a8a;
            margin-bottom: 1.8mm;
          }

          .admit-card__schedule table {
            width: 100%;
            border-collapse: collapse;
            font-size: 3.6mm;
            table-layout: fixed;
          }

          .admit-card__schedule th {
            background: #1e3a8a;
            color: #fff;
            text-align: left;
            padding: 1.8mm 2.6mm;
            font-weight: 700;
            letter-spacing: 0.15mm;
          }

          .admit-card__schedule td {
            border-bottom: 0.25mm solid #e2e8f0;
            padding: 1.8mm 2.6mm;
            color: #334155;
          }

          .admit-card__schedule tr:nth-child(even) td {
            background: #f8fafc;
          }

          .subject-cell {
            font-weight: 700;
            color: #0f172a;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .schedule-empty {
            border: 0.3mm dashed #cbd5e1;
            border-radius: 2mm;
            padding: 3mm;
            font-size: 3.7mm;
            color: #94a3b8;
            text-align: center;
          }

          /* ── Signatures ───────────────────────────────── */
          .admit-card__signatures {
            margin-top: auto;
            display: flex;
            justify-content: space-between;
            gap: 10mm;
            padding: 5mm 8mm 5mm;
          }

          .admit-card__signature-box {
            min-width: 48mm;
            border-top: 0.35mm solid #64748b;
            padding-top: 1.8mm;
            text-align: center;
            font-size: 3.5mm;
            font-weight: 600;
            color: #475569;
            white-space: nowrap;
          }

          .admit-card__instructions {
            background: #f8fafc;
            border-top: 0.3mm solid #e2e8f0;
            padding: 2.4mm 6mm;
            font-size: 3.2mm;
            color: #64748b;
            line-height: 1.5;
          }

          .print-note {
            margin-top: 12mm;
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
        <div class="admit-card">
          <div class="admit-card__header">
            <span class="admit-card__bubble admit-card__bubble--one"></span>
            <span class="admit-card__bubble admit-card__bubble--two"></span>

            <img src="${logoUrl}" alt="Logo" class="admit-card__logo" />

            <div class="admit-card__brand">
              <h2>${institutionName}</h2>
              ${institutionAddress ? `<p>${institutionAddress}</p>` : ""}
            </div>

            <span class="admit-card__ribbon">Admit Card</span>
          </div>

          <div class="admit-card__exam-strip">
            <span class="admit-card__exam-name">${examName}</span>
            ${examDate ? `<span class="admit-card__exam-date">Exam Date: ${examDate}</span>` : ""}
          </div>

          <div class="admit-card__body">
            <div class="admit-card__details">
              <div class="admit-card__row admit-card__row--wide">
                <span class="admit-card__label">Student</span>
                <span class="admit-card__colon">:</span>
                <span class="admit-card__value">${name}</span>
              </div>
              <div class="admit-card__row">
                <span class="admit-card__label">Roll No</span>
                <span class="admit-card__colon">:</span>
                <span class="admit-card__value">${roll}</span>
              </div>
              <div class="admit-card__row">
                <span class="admit-card__label">Reg No</span>
                <span class="admit-card__colon">:</span>
                <span class="admit-card__value">${reg}</span>
              </div>
              <div class="admit-card__row">
                <span class="admit-card__label">${classKey}</span>
                <span class="admit-card__colon">:</span>
                <span class="admit-card__value">${classLabel}${
                  !isUniversity && sectionName ? ` &bull; ${sectionName}` : ""
                }</span>
              </div>
              ${
                batchName
                  ? `<div class="admit-card__row">
                      <span class="admit-card__label">Batch</span>
                      <span class="admit-card__colon">:</span>
                      <span class="admit-card__value">${batchName}</span>
                    </div>`
                  : ""
              }
              ${
                programName
                  ? `<div class="admit-card__row admit-card__row--wide">
                      <span class="admit-card__label">Program</span>
                      <span class="admit-card__colon">:</span>
                      <span class="admit-card__value">${programName}</span>
                    </div>`
                  : ""
              }
              ${
                departmentName
                  ? `<div class="admit-card__row admit-card__row--wide">
                      <span class="admit-card__label">Department</span>
                      <span class="admit-card__colon">:</span>
                      <span class="admit-card__value">${departmentName}</span>
                    </div>`
                  : ""
              }
              ${
                session
                  ? `<div class="admit-card__row">
                      <span class="admit-card__label">Session</span>
                      <span class="admit-card__colon">:</span>
                      <span class="admit-card__value">${session}</span>
                    </div>`
                  : ""
              }
              ${
                examYear
                  ? `<div class="admit-card__row">
                      <span class="admit-card__label">Exam Year</span>
                      <span class="admit-card__colon">:</span>
                      <span class="admit-card__value">${examYear}</span>
                    </div>`
                  : ""
              }
              ${
                phone
                  ? `<div class="admit-card__row">
                      <span class="admit-card__label">Phone</span>
                      <span class="admit-card__colon">:</span>
                      <span class="admit-card__value">${escapeHtml(phone)}</span>
                    </div>`
                  : ""
              }
            </div>

            <div class="admit-card__photo-frame">
              <img src="${photo}" alt="${name}" class="admit-card__photo" />
            </div>
          </div>

          <div class="admit-card__schedule">
            <h3>Subject Schedule</h3>
            ${
              scheduleRows
                ? `<table>
                    <thead>
                      <tr>
                        <th style="width: 10mm; text-align: center;">#</th>
                        <th>Subject</th>
                        <th style="width: 26mm;">Date</th>
                        <th style="width: 40mm;">Time</th>
                        <th style="width: 18mm; text-align: center;">Marks</th>
                      </tr>
                    </thead>
                    <tbody>${scheduleRows}</tbody>
                  </table>`
                : `<div class="schedule-empty">No subject schedule published for this exam yet.</div>`
            }
          </div>

          <div class="admit-card__signatures">
            <div class="admit-card__signature-box">Candidate's Signature</div>
            <div class="admit-card__signature-box">Principal of the College</div>
          </div>

          <div class="admit-card__instructions">
            Candidates must carry this admit card and report at the examination hall 30 minutes before the scheduled time. Mobile phones are strictly prohibited inside the hall.
          </div>
        </div>

        <p class="print-note">
          Choose <strong>"Save as PDF"</strong> in the print dialog to download this admit card as a PDF file.
        </p>
      </body>
    </html>
  `;
};

export const handleDownloadAdmitCardPdf = ({
  enrollment,
  exam,
  institution,
}: {
  enrollment: TAdmitEnrollment;
  exam: TAdmitExam;
  institution?: TInstitutionInfo | null;
}) => {
  printHtml(generateAdmitCardHtml({ enrollment, exam, institution }));
};
