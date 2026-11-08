import banner from "@/assets/heroBanner.webp";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAllAcademicNotices } from "@/services/academicNotice";
import { NOTICE_CATEGORY_MAP } from "../config";
import NoticeBoardContent from "../_components/NoticeBoardContent";

const CATEGORY = "hsc" as const;
const CONFIG = NOTICE_CATEGORY_MAP[CATEGORY];
const LIMIT = 9;

type SearchParams = {
  page?: string;
};

type ListResponse = {
  success?: boolean;
  meta?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data?: {
    id: string;
    title: string;
    noticeType: string;
    pdfUrl?: string | null;
    created_at?: string;
    updated_at?: string;
  }[];
};

export default async function HscNoticesPage(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.page) || 1;

  const query = [
    { label: "page", value: page.toString() },
    { label: "limit", value: LIMIT.toString() },
    { label: "filter", value: JSON.stringify({ noticeType: CONFIG.noticeType }) },
  ];

  let response: ListResponse | null = null;
  try {
    response = (await getAllAcademicNotices(query)) as ListResponse;
  } catch (error) {
    console.error(`Failed to load ${CONFIG.label}:`, error);
  }

  const notices = response?.data ?? [];
  const meta = response?.meta ?? null;

  const titleData = {
    subTitle: CONFIG.subTitle,
    title: CONFIG.title,
  };

  return (
    <div className="mb-20">
      <CoverPageBanner
        pageKey="noticeBoard"
        fallbackBanner={banner}
        title={CONFIG.bannerTitle}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: CONFIG.breadcrumbLabel },
        ]}
      />
      <PageTitle titleData={titleData} />
      <NoticeBoardContent notices={notices} meta={meta} currentPage={page} />
    </div>
  );
}
