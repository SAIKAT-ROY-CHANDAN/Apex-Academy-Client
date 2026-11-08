import banner from "@/assets/heroBanner.webp";
import LatesPrograms from "./components/latesPrograms";
import CoverPageBanner from "@/components/shared/cover-page-banner";

const titleData = {
  subTitle: "Academic Programs",
  title: "View our Latest Academic  Programs",
};

const page = () => {
  return (
    <div>
      <CoverPageBanner pageKey="academic"
        fallbackBanner={banner}
        title="Academic Programs"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Academic Programs" },
        ]}
      />
      <div>
        <LatesPrograms titleData={titleData} />
      </div>
    </div>
  );
};

export default page;
