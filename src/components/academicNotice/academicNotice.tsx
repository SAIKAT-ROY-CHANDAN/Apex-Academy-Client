import { IoMdDownload } from "react-icons/io";
import { HiOutlineCalendarDays } from "react-icons/hi2";

type AcademicNoticeProps = {
  title?: string;
  syllabusUrl?: string | null;
  createdAt?: string | null;
  publisher?: string | null;
  faculty?: string | null;
};

const AcademicNotice = ({
  title,
  syllabusUrl,
  createdAt,
  publisher,
  faculty,
}: AcademicNoticeProps) => {
  const displayTitle =
    title ||
    "Academic Session Notices & Class Schedule Announcements";

  // Publisher -> institution authority
  const displayPublisher =
    publisher || "Office of the Principal, Apex International College";

  // Faculty / department
  const displayFaculty =
    faculty || "Apex International College";

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "25-FEB-26";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "25-FEB-26";
      const day = String(d.getDate()).padStart(2, "0");
      const month = d.toLocaleString("en-GB", { month: "short" }).toUpperCase();
      const year = String(d.getFullYear()).slice(-2);
      return `${day}-${month}-${year}`;
    } catch {
      return "25-FEB-26";
    }
  };

  const displayDate = formatDate(createdAt);
  const isDownloadable = Boolean(syllabusUrl);

  return (
    <div className="group relative flex min-h-[190px] flex-col overflow-hidden rounded-xl bg-[#E53935] p-5 shadow-[0_4px_20px_rgba(229,57,53,0.25)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(229,57,53,0.35)] sm:min-h-[200px] sm:p-6">
      {/* decorative blobs - subtle premium feel */}
      <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/[0.07] blur-[0.5px] transition-transform duration-500 group-hover:scale-110" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-black/10 blur-[0.5px]" />
      <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-white/10" />

      {/* subtle diagonal highlight */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/8 via-transparent to-transparent" />

      {/* Header row: Title + Date */}
      <div className="relative flex items-start justify-between gap-3">
        <h3
          className="flex-1 break-words text-[14px] font-bold leading-[1.55] text-white sm:text-[15px] sm:leading-6"
          style={{ fontFamily: "var(--font-almarai), var(--font-geist-sans), sans-serif" }}
          title={displayTitle}
        >
          {displayTitle}
        </h3>

        {/* Date - top right like image "17-MAY-26" */}
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="inline-flex items-center gap-1 whitespace-nowrap rounded-md bg-white/15 px-2 py-1 text-[10px] font-bold tracking-widest text-white backdrop-blur-sm sm:text-[11px]">
            <HiOutlineCalendarDays className="h-3 w-3 opacity-90" />
            {displayDate}
          </span>
        </div>
      </div>

      {/* Meta row: Publisher (left) + Faculty (right) - like image second line */}
      <div className="relative mt-3 flex items-start justify-between gap-3 border-t border-white/15 pt-3">
        <p className="flex-1 break-words text-[11px] font-medium leading-4 text-white/90 sm:text-xs">
          {displayPublisher}
        </p>
        <p className="max-w-[45%] shrink-0 break-words text-right text-[10px] font-medium leading-4 text-white/80 sm:text-[11px]">
          {displayFaculty}
        </p>
      </div>

      {/* Spacer to push button to bottom */}
      <div className="flex flex-1" />

      {/* Download Button - centered like image "নোটিশ ডাউনলোড" teal */}
      <div className="relative mt-5 flex justify-center">
        {isDownloadable ? (
          <a
            href={syllabusUrl as string}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Download notice: ${displayTitle}`}
            className="inline-flex items-center justify-center gap-2 rounded-[8px] bg-[#0F766E] px-7 py-2.5 text-[13px] font-bold tracking-wide text-white shadow-[0_4px_12px_rgba(15,118,110,0.35)] transition-all duration-200 hover:bg-[#0D665E] hover:shadow-[0_6px_16px_rgba(15,118,110,0.45)] hover:scale-[1.02] active:scale-[0.98] sm:px-8 sm:text-sm"
          >
            নোটিশ ডাউনলোড
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/20">
              <IoMdDownload className="h-3.5 w-3.5 text-white" />
            </span>
          </a>
        ) : (
          <button
            disabled
            aria-disabled="true"
            className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-[8px] bg-[#0F766E]/60 px-7 py-2.5 text-[13px] font-bold tracking-wide text-white/70 shadow-none sm:px-8 sm:text-sm"
          >
            নোটিশ ডাউনলোড
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
              <IoMdDownload className="h-3.5 w-3.5 text-white/70" />
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AcademicNotice;
