import { Plus } from "lucide-react";
import Link from "next/link";
import { SearchForm } from "@/components/dashboard/SearchForm";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getAllAcademicNotices } from "@/services/academicNotice";
import NoticeTable from "./_components/NoticeTable";
import NoticeTypeFilter from "./_components/NoticeTypeFilter";

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

const NoticeUpdatePage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;
  const noticeType =
    typeof searchParams.noticeType === "string"
      ? searchParams.noticeType
      : undefined;

  const query = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
  ];

  if (search) {
    query.push({ label: "searchTerm", value: search });
  }

  if (noticeType && noticeType !== "ALL") {
    query.push({
      label: "filter",
      value: JSON.stringify({ noticeType }),
    });
  }

  let response: ListResponse | null = null;

  try {
    response = (await getAllAcademicNotices(query)) as ListResponse;
  } catch (error) {
    console.error("Failed to load notices:", error);
  }

  const notices = response?.data ?? [];
  const meta = response?.meta;

  return (
    <div className="space-y-2">
      <PageHeader
        title="Notice Update"
        backHref="/dashboard/website"
        components={
          <Link
            href="/dashboard/website/notice-update/create"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-64">
          <SearchForm
            defaultValue={search ?? ""}
            placeholder="Search by title..."
          />
        </div>
        <NoticeTypeFilter defaultValue={noticeType ?? "ALL"} />
      </div>

      <NoticeTable notices={notices} />

      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <PaginationWrapper
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            active={page}
          />
        </div>
      )}
    </div>
  );
};

export default NoticeUpdatePage;
