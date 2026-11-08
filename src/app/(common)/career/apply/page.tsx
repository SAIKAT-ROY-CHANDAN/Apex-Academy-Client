import banner from "@/assets/heroBanner.webp";
import ClientCoverPageBanner from "@/components/shared/client-cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { getWebsiteJobCircularById } from "@/services/websiteJobCircular";
import { ApplyForm } from "./_components/ApplyForm";

const titleData = {
  subTitle: "Apply",
  title: "Apply through this From",
};

const ApplyPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) => {
  const { id } = await searchParams;

  let circular: {
    id: string;
    positionName?: string | null;
    applyFee?: string | null;
  } | null = null;

  if (id) {
    try {
      const res = await getWebsiteJobCircularById(id);
      if (res?.success && res.data) {
        circular = res.data;
      }
    } catch {
      circular = null;
    }
  }

  return (
    <div>
      <ClientCoverPageBanner
        pageKey="career"
        fallbackBanner={banner}
        title="Job Apply"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Career", href: "/career" },
          { label: "Job Apply" },
        ]}
      />

      <section className="bg-white px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <PageTitle titleData={titleData} />

          <div className="mt-10 lg:max-w-4xl 2xl:max-w-6xl mx-auto">
            <ApplyForm
              circularId={id ?? ""}
              positionName={circular?.positionName ?? null}
              applyFee={circular?.applyFee ?? null}
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default ApplyPage;
