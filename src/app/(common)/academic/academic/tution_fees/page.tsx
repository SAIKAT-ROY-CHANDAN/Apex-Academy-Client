import Image from "next/image";
import banner from "@/assets/heroBanner.webp";
import { TbCoinTaka } from "react-icons/tb";
import image1 from "@/assets/Academic/image2.jpg";
import { PageTitle } from "@/components/shared/page-title";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getAllAcademicTuitions } from "@/services/academicTuition";
import TuitionPagination from "./_components/TuitionPagination";

const titleData = {
  subTitle: "Tuition Fees",
  title: "View Our Tuition Fees",
};

type TuitionFeesPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const TuitionFeesPage = async (props: TuitionFeesPageProps) => {
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
    tuitionUrl?: string | null;
    tuitionAmount?: number | null;
    created_at?: string;
  }[] = [];
  let meta: {
    totalItems: number;
    totalPages: number;
    limit: number;
    currentPage: number;
  } | null = null;

  try {
    const res = await getAllAcademicTuitions(query);
    data = res?.data ?? [];
    meta = res?.meta ?? null;
  } catch (error) {
    console.error("Failed to load tuitions:", error);
  }

  return (
    <div className="mb-20">
      <CoverPageBanner pageKey="academic"
        fallbackBanner={banner}
        title="Tution Fees"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Tution Fees" },
        ]}
      />
      <div className="text-center mb-12 mt-20 max-w-6xl mx-auto">
        <PageTitle titleData={titleData} />
      </div>

      <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0 min-h-50">
        {data.length === 0 ? (
          <p className="col-span-full text-center text-sm text-slate-500 py-10">
            No tuition fees found.
          </p>
        ) : (
          data.map((item) => (
            <div
              key={item.id}
              className="bg-[#0F284E] p-6 rounded-2xl grid grid-cols-2 sm:grid-cols-2 gap-8 justify-between"
            >
              <div className="flex flex-col justify-around">
                <h2
                  className="text-3xl text-white font-bebas line-clamp-2"
                  title={item.title}
                >
                  {item.title}
                </h2>
                <p className="flex items-center gap-2 bg-[#F59E0B] w-fit text-xl px-4 py-1 rounded-full text-[#0F284E]">
                  <TbCoinTaka />
                  {item.tuitionAmount != null
                    ? Number(item.tuitionAmount).toLocaleString()
                    : "—"}
                </p>
              </div>
              {item.tuitionUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.tuitionUrl}
                  alt={item.title}
                  width={250}
                  height={150}
                  className="rounded-2xl h-37.5 w-62.5 object-cover"
                />
              ) : (
                <Image
                  src={image1}
                  alt={item.title}
                  width={250}
                  height={150}
                  className="rounded-2xl h-37.5 w-62.5 object-cover"
                />
              )}
            </div>
          ))
        )}
      </div>
      {meta && meta.totalPages > 1 && (
        <TuitionPagination
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          active={page}
        />
      )}
    </div>
  );
};

export default TuitionFeesPage;
