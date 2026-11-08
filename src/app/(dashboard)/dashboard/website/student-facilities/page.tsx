import { Plus } from "lucide-react";
import Link from "next/link";
import { SearchForm } from "@/components/dashboard/SearchForm";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { PageHeader } from "@/components/shared/page-header";
import { getAllAcademicFacilities } from "@/services/academicFacilities";
import FacilitiesTable from "./_components/FacilitiesTable";

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
    name: string;
    facilities_type?: string | null;
    main_image_url?: string | null;
    sub_one_image_url?: string | null;
    sub_two_image_url?: string | null;
    description?: string | null;
    created_at?: string;
    updated_at?: string;
  }[];
};

const StudentFacilitiesPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  const query = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
  ];

  if (search) {
    query.push({ label: "searchTerm", value: search });
  }

  let response: ListResponse | null = null;

  try {
    response = (await getAllAcademicFacilities(query)) as ListResponse;
  } catch (error) {
    console.error("Failed to load facilities:", error);
  }

  const facilities = response?.data ?? [];
  const meta = response?.meta;

  return (
    <div className="space-y-2">
      <PageHeader
        title="Student Facilities"
        backHref="/dashboard/website"
        components={
          <Link
            href="/dashboard/website/student-facilities/create"
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-600/30 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            Add
          </Link>
        }
      />

      <div className="w-full sm:w-64">
        <SearchForm
          defaultValue={search ?? ""}
          placeholder="Search by name..."
        />
      </div>

      <FacilitiesTable facilities={facilities} />

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

export default StudentFacilitiesPage;
