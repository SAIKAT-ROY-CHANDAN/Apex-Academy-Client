"use client";

import type { TIdCardEnrollment, TInstitutionInfo } from "./types";

interface IdCardFrontPreviewProps {
  enrollment: TIdCardEnrollment;
  institution?: TInstitutionInfo | null;
}

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

const IdCardFrontPreview = ({
  enrollment,
  institution,
}: IdCardFrontPreviewProps) => {
  const student = enrollment.student;
  const isUniversity = institution?.mode === "COLLEGE_UNIVERSITY";
  const sectionName = enrollment.academicSection?.section_name;

  const classLabel = isUniversity
    ? enrollment.academicClass?.year_level != null
      ? `${ordinal(enrollment.academicClass.year_level)} Year`
      : (enrollment.academicClass?.class_name ?? "N/A")
    : (enrollment.academicClass?.class_name ?? "N/A");
  const classKey = isUniversity ? "Year" : "Class";

  const phone = student?.student_phone || "—";
  const address =
    [student?.sub_district, student?.district].filter(Boolean).join(", ") ||
    "—";

  const initials = (student?.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="relative flex h-[160px] w-[254px] shrink-0 select-none flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_14px_-4px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-6px_rgba(15,23,42,0.28)]">
      {/* ── Brand header ─────────────────────────────────────────── */}
      <div className="relative flex items-center gap-2 overflow-hidden bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-500 px-2.5 py-2 text-white">
        <div className="pointer-events-none absolute -right-4 -top-9 h-[70px] w-[70px] rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-12 -top-10 h-[60px] w-[60px] rounded-full bg-white/[0.07]" />

        {institution?.logo ? (
          // biome-ignore lint/performance/noImgElement: photo/logo URLs come from the API server host, not configured for next/image
          <img
            src={institution.logo}
            alt="logo"
            className="h-7 w-7 shrink-0 rounded-full bg-white object-contain p-[3px] shadow-sm"
          />
        ) : (
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
            <GraduationIcon />
          </div>
        )}

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[10px] font-bold tracking-wide">
            {institution?.name || "Institution Name"}
          </p>
          <span className="mt-0.5 inline-block rounded-full bg-white/20 px-1.5 py-px text-[6px] font-semibold uppercase tracking-[0.22em]">
            Student ID Card
          </span>
        </div>
      </div>

      {/* ── Holder details ──────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 items-start gap-2.5 px-2.5 pt-2">
        <div className="shrink-0 rounded-md bg-gradient-to-b from-blue-600 to-indigo-400 p-[2px] shadow-sm">
          {student?.photo ? (
            // biome-ignore lint/performance/noImgElement: student photo URLs come from the API server host, not configured for next/image
            <img
              src={student.photo}
              alt={student.name}
              className="h-[58px] w-[47px] rounded-[5px] border-2 border-white object-cover"
            />
          ) : (
            <div className="flex h-[58px] w-[47px] items-center justify-center rounded-[5px] border-2 border-white bg-slate-100 text-base font-bold text-slate-400">
              {initials}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-[3px] text-[8px] leading-tight text-slate-600">
          <p className="truncate text-[11.5px] font-extrabold capitalize leading-snug text-slate-900">
            {student?.name || "N/A"}
          </p>
          <p className="truncate">
            <span className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
              Roll&nbsp;&nbsp;
            </span>
            <span className="font-bold text-slate-700">
              {enrollment.roll_number || "N/A"}
            </span>
          </p>
          <p className="truncate">
            <span className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
              Reg&nbsp;&nbsp;&nbsp;&nbsp;
            </span>
            <span className="font-bold text-slate-700">
              {enrollment.registration_number || "N/A"}
            </span>
          </p>
          <p className="truncate">
            <span className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
              {classKey}&nbsp;
            </span>
            <span className="font-bold text-slate-700">
              {classLabel}
              {!isUniversity && sectionName ? ` • ${sectionName}` : ""}
            </span>
          </p>
          <p className="truncate">
            <span className="text-[7px] font-semibold uppercase tracking-wider text-slate-400">
              Session
            </span>
            <span className="ml-0.5 font-bold text-slate-700">
              {enrollment.academicSession?.session_name ?? "N/A"}
            </span>
          </p>
        </div>
      </div>

      {/* ── Contact footer ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 bg-slate-50 px-2.5 py-1">
        <span className="flex min-w-0 items-baseline gap-1 text-[7px] leading-tight">
          <span className="shrink-0 text-[6px] font-semibold uppercase tracking-wider text-slate-400">
            Phone
          </span>
          <span className="truncate font-bold text-slate-600">{phone}</span>
        </span>
        <span className="hidden h-2.5 w-px shrink-0 bg-slate-300 sm:block" />
        <span className="flex min-w-0 flex-1 items-baseline justify-end gap-1 text-right text-[7px] leading-tight">
          <span className="shrink-0 text-[6px] font-semibold uppercase tracking-wider text-slate-400">
            Address
          </span>
          <span className="truncate font-semibold text-slate-600">
            {address}
          </span>
        </span>
      </div>
    </div>
  );
};

const GraduationIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1d4ed8"
    strokeWidth="2"
    className="h-3.5 w-3.5"
    aria-hidden="true"
  >
    <path
      d="M22 10L12 5 2 10l10 5 10-5v6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 12v5c0 1 2.5 3 6 3s6-2 6-3v-5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default IdCardFrontPreview;
