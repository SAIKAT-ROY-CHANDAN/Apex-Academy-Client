"use client";

import type { TAdmitEnrollment, TAdmitExam, TInstitutionInfo } from "./types";

interface AdmitCardPreviewProps {
  enrollment: TAdmitEnrollment;
  exam: TAdmitExam;
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

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
      });
};

const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

const AdmitCardPreview = ({
  enrollment,
  exam,
  institution,
}: AdmitCardPreviewProps) => {
  const student = enrollment.student;
  const isUniversity = institution?.mode === "COLLEGE_UNIVERSITY";
  const sectionName = enrollment.academicSection?.section_name;

  const classKey = isUniversity ? "Year" : "Class";
  const classLabel = isUniversity
    ? enrollment.academicClass?.year_level != null
      ? `${ordinal(enrollment.academicClass.year_level)} Year`
      : (enrollment.academicClass?.class_name ?? "N/A")
    : (enrollment.academicClass?.class_name ?? "N/A");

  const programName =
    exam.program?.program_name ||
    enrollment.academicClass?.program?.program_name ||
    "";
  const departmentName =
    exam.department?.department_name ||
    enrollment.academicClass?.department?.department_name ||
    "";
  const batchName =
    enrollment.batch?.batch_name || exam.batch?.batch_name || "";
  const scheduleYear = exam.examSchedules?.find(
    (s) => s.examTakenYear != null,
  )?.examTakenYear;
  const examDateYear = exam.exam_date
    ? new Date(exam.exam_date).getFullYear()
    : null;
  const examYear =
    scheduleYear != null
      ? String(scheduleYear)
      : examDateYear != null && !Number.isNaN(examDateYear)
        ? String(examDateYear)
        : "";

  const schedules = (exam.examSchedules ?? [])
    .slice()
    .sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime(),
    )
    .slice(0, 3);

  return (
    <div className="relative flex min-h-[190px] w-[275px] shrink-0 select-none flex-col overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-[0_4px_14px_-4px_rgba(15,23,42,0.18)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_22px_-6px_rgba(15,23,42,0.28)]">
      {/* ── Institution header ──────────────────────────────────── */}
      <div className="relative flex items-center gap-1.5 overflow-hidden bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-500 px-2 py-1.5 text-white">
        <div className="pointer-events-none absolute -right-3 -top-7 h-[56px] w-[56px] rounded-full bg-white/10" />
        <div className="pointer-events-none absolute right-11 -top-8 h-[48px] w-[48px] rounded-full bg-white/[0.07]" />

        {institution?.logo ? (
          // biome-ignore lint/performance/noImgElement: photo/logo URLs come from the API server host, not configured for next/image
          <img
            src={institution.logo}
            alt="logo"
            className="h-6 w-6 shrink-0 rounded-full bg-white object-contain p-[2px] shadow-sm"
          />
        ) : (
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white text-[9px] font-black text-blue-700">
            {(institution?.name || "S").charAt(0)}
          </div>
        )}

        <div className="min-w-0 flex-1 leading-tight">
          <p className="truncate text-[9px] font-bold tracking-wide">
            {institution?.name || "Institution Name"}
          </p>
          <span className="mt-px inline-block rounded-sm bg-white px-1 text-[5.5px] font-extrabold uppercase tracking-[0.24em] text-blue-700">
            Admit Card
          </span>
        </div>
      </div>

      {/* ── Exam strip ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-1 border-b border-blue-100 bg-blue-50/90 px-2 py-[3px]">
        <span className="flex min-w-0 items-center gap-1 text-[7.5px] font-extrabold text-blue-800">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
          <span className="truncate">{exam.exam_name}</span>
        </span>
        <span className="shrink-0 text-[6.5px] font-semibold text-blue-600">
          {examYear ? `Exam Year: ${examYear}` : formatDate(exam.exam_date)}
        </span>
      </div>

      {/* ── Holder details ──────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1 gap-2 px-2 pt-1.5">
        <div className="min-w-0 flex-1 space-y-[2px] text-[7.5px] leading-tight text-slate-600">
          <p className="truncate text-[10px] font-extrabold capitalize leading-snug text-slate-900">
            {student?.name || "N/A"}
          </p>
          <div className="grid grid-cols-2 gap-x-1.5 gap-y-[2px]">
            <p className="truncate">
              <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                Roll&nbsp;&nbsp;
              </span>
              <span className="font-bold text-slate-700">
                {enrollment.roll_number || "N/A"}
              </span>
            </p>
            <p className="truncate">
              <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                Reg&nbsp;&nbsp;&nbsp;&nbsp;
              </span>
              <span className="font-bold text-slate-700">
                {enrollment.registration_number || "N/A"}
              </span>
            </p>
            <p className="truncate">
              <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                {classKey}&nbsp;
              </span>
              <span className="font-bold text-slate-700">
                {classLabel}
                {!isUniversity && sectionName ? ` • ${sectionName}` : ""}
              </span>
            </p>
            {batchName ? (
              <p className="truncate">
                <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Batch&nbsp;
                </span>
                <span className="font-bold text-slate-700">{batchName}</span>
              </p>
            ) : null}
            {programName ? (
              <p className="col-span-2 truncate">
                <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Program&nbsp;
                </span>
                <span className="font-bold text-slate-700">{programName}</span>
              </p>
            ) : null}
            {departmentName ? (
              <p className="col-span-2 truncate">
                <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Dept&nbsp;
                </span>
                <span className="font-bold text-slate-700">
                  {departmentName}
                </span>
              </p>
            ) : null}
            {enrollment.academicSession?.session_name ? (
              <p className="truncate">
                <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Session
                </span>
                <span className="ml-0.5 font-bold text-slate-700">
                  {enrollment.academicSession.session_name}
                </span>
              </p>
            ) : null}
            {examYear ? (
              <p className="truncate">
                <span className="text-[6.5px] font-semibold uppercase tracking-wider text-slate-400">
                  Exam Yr
                </span>
                <span className="ml-0.5 font-bold text-slate-700">
                  {examYear}
                </span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="shrink-0 self-start rounded-md bg-gradient-to-b from-blue-600 to-indigo-400 p-[2px] shadow-sm">
          {student?.photo ? (
            // biome-ignore lint/performance/noImgElement: student photo URLs come from the API server host, not configured for next/image
            <img
              src={student.photo}
              alt={student.name}
              className="h-[52px] w-[42px] rounded-[5px] border-2 border-white object-cover"
            />
          ) : (
            <div className="flex h-[52px] w-[42px] items-center justify-center rounded-[5px] border-2 border-white bg-slate-100 text-base font-bold text-slate-400">
              {(student?.name || "?")
                .split(" ")
                .slice(0, 2)
                .map((part) => part.charAt(0).toUpperCase())
                .join("")}
            </div>
          )}
        </div>
      </div>

      {/* ── Schedule mini-table ─────────────────────────────────── */}
      <div className="mx-2 mb-1 mt-1 overflow-hidden rounded-md border border-slate-200">
        {schedules.length > 0 ? (
          <table className="w-full table-fixed border-collapse text-[6.5px] leading-tight">
            <thead>
              <tr className="bg-slate-800 text-white">
                <th className="w-[38%] truncate px-1 py-[2px] text-left font-semibold uppercase tracking-wider">
                  Subject
                </th>
                <th className="truncate px-1 py-[2px] text-left font-semibold uppercase tracking-wider">
                  Date
                </th>
                <th className="w-[30%] truncate px-1 py-[2px] text-left font-semibold uppercase tracking-wider">
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s) => (
                <tr key={s.id} className="border-t border-slate-100 bg-white">
                  <td className="truncate px-1 py-[2px] font-bold text-slate-700">
                    {s.subject?.name ?? "—"}
                  </td>
                  <td className="truncate px-1 py-[2px] text-slate-500">
                    {formatDate(s.examDate)}
                  </td>
                  <td className="truncate px-1 py-[2px] text-slate-500">
                    {formatTime(s.startTime)}
                  </td>
                </tr>
              ))}
              {exam.examSchedules && exam.examSchedules.length > 3 && (
                <tr className="border-t border-slate-100 bg-slate-50">
                  <td
                    colSpan={3}
                    className="px-1 py-[2px] text-center font-semibold italic text-slate-400"
                  >
                    +{exam.examSchedules.length - 3} more subjects in PDF
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="bg-slate-50 px-1 py-[3px] text-center text-[6.5px] font-medium italic text-slate-400">
            No subject schedule published
          </div>
        )}
      </div>
    </div>
  );
};

export default AdmitCardPreview;
