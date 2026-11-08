import banner from "@/assets/heroBanner.webp";
import AcademicNotice from "@/components/academicNotice/academicNotice";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAllAcademicSyllabuses } from "@/services/academicSyllabus";
import SyllabusPagination from "./_components/SyllabusPagination";
const titleData = {
  subTitle: "Syllabus",
  title: "View Our Academic Syllabus",
};

type SyllabusPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const SyllabusPage = async (props: SyllabusPageProps) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;

  const query = [
    { label: "page", value: String(page) },
    { label: "limit", value: "20" },
    { label: "orderBy", value: JSON.stringify({ created_at: "desc" }) },
  ];

  let data: {
    id: string;
    title: string;
    syllabusUrl?: string | null;
    created_at?: string;
  }[] = [];
  let meta: { totalItems: number; totalPages: number; limit: number; currentPage: number } | null = null;

  try {
    const res = await getAllAcademicSyllabuses(query);
    data = res?.data ?? [];
    meta = res?.meta ?? null;
  } catch (error) {
    console.error("Failed to load syllabuses:", error);
  }

  return (
    <div className="mb-28">
      <CoverPageBanner pageKey="academic"
        fallbackBanner={banner}
        title="Syllabus"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Syllabus" },
        ]}
      />
      <div className="text-center mb-12 mt-20 max-w-6xl mx-auto">
        <PageTitle titleData={titleData} />
      </div>
      <div className="px-4 md:px-0 mb-20">
        <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto bg-[#0F284E] p-5 md:p-8 lg:p-10 rounded-2xl min-h-50">
          {data.length === 0 ? (
            <p className="text-center text-sm text-white/80 py-10">No syllabus found.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
              {data.map((item) => (
                <AcademicNotice
                  key={item.id}
                  title={item.title}
                  syllabusUrl={item.syllabusUrl ?? null}
                  createdAt={item.created_at ?? null}
                />
              ))}
            </div>
          )}
        </div>
        {meta && meta.totalPages > 1 && (
          <SyllabusPagination
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            active={page}
          />
        )}
      </div>
    </div>
  );
};

export default SyllabusPage;
