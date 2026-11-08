import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AcademicNotice from "@/components/academicNotice/academicNotice";
import { PageTitle } from "@/components/shared/page-title";
import { getAllAcademicNotices } from "@/services/academicNotice";

const titleData = {
  subTitle: "General  Notices ",
  title: "View Our latest Notice and update.",
};

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

const HomeNotice = async () => {
  let notices: NoticeItem[] = [];

  try {
    const query = [
      { label: "page", value: "1" },
      { label: "limit", value: "5" },
      { label: "filter", value: JSON.stringify({ noticeType: "GENERAL_NOTICE" }) },
    ];
    const res = (await getAllAcademicNotices(query)) as {
      success?: boolean;
      data?: NoticeItem[];
    };
    if (Array.isArray(res?.data)) {
      notices = res.data.slice(0, 5);
    }
  } catch (error) {
    console.error("Failed to load general notices for HomeNotice:", error);
  }

  return (
    <div className="mx-auto xl:max-w-4xl 2xl:max-w-6xl px-4">
      <PageTitle titleData={titleData} />
      <div className="bg-[#0F284E] p-5 md:p-8 lg:p-10 rounded-2xl">
        {notices.length > 0 ? (
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
        ) : (
          <div className="rounded-2xl bg-[#FFEFC4] p-8 text-center">
            <p className="font-bebas text-lg uppercase tracking-wide text-[#0F284E]">
              No general notices available
            </p>
            <p className="mt-2 text-sm font-almarai text-[#0F284E]/70">
              Please check the general notices page for updates.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <Link
          href="/notices/general"
          className="inline-flex items-center gap-2 rounded-full bg-[#F59E0B] px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#0F284E] transition-colors hover:bg-[#E6A61E]"
        >
          Show More
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#0F284E] text-[#F59E0B]">
            <ArrowRight size={14} />
          </span>
        </Link>
      </div>
    </div>
  );
};

export default HomeNotice;
