import AcademicNotice from "@/components/academicNotice/academicNotice";
import NoticePagination from "./NoticePagination";

type NoticeItem = {
  id: string;
  title: string;
  noticeType: string;
  pdfUrl?: string | null;
  pdf_url?: string | null;
  syllabusUrl?: string | null;
  created_at?: string;
  createdAt?: string;
};

type NoticeBoardContentProps = {
  notices: NoticeItem[];
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  } | null;
  currentPage: number;
};

export default function NoticeBoardContent({
  notices,
  meta,
  currentPage,
}: NoticeBoardContentProps) {
  const totalPages = meta?.totalPages ?? 1;
  const totalItems = meta?.totalItems ?? notices.length;

  if (!notices.length) {
    return (
      <div className="px-4 md:px-0">
        <div className="flex flex-col gap-3 bg-[#0F284E] p-5 md:p-14 rounded-2xl mx-auto lg:max-w-4xl 2xl:max-w-6xl">
          <div className="rounded-2xl bg-[#FFEFC4] p-8 text-center">
            <p className="font-bebas text-lg uppercase tracking-wide text-[#0F284E]">
              No notices found
            </p>
            <p className="mt-2 text-sm font-almarai text-[#0F284E]/70">
              There are currently no notices in this category. Please check back later.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 md:px-0">
      <div className="mx-auto lg:max-w-4xl 2xl:max-w-6xl rounded-2xl bg-[#0F284E] p-5 md:p-8 lg:p-10">
        {/* Grid exactly like reference image - 2 columns on desktop, 1 on mobile */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          {notices.map((notice) => {
            const pdfUrl =
              notice.pdfUrl ?? notice.pdf_url ?? notice.syllabusUrl ?? null;
            const createdAt = notice.created_at ?? notice.createdAt ?? null;
            return (
              <AcademicNotice
                key={notice.id}
                title={notice.title}
                syllabusUrl={pdfUrl}
                createdAt={createdAt}
              />
            );
          })}
        </div>

        {meta && (
          <div className="mt-8">
            <NoticePagination
              active={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
            />
          </div>
        )}
      </div>
    </div>
  );
}
