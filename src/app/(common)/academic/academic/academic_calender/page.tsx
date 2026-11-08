import CoverPageBanner from "@/components/shared/cover-page-banner";
import banner from "@/assets/heroBanner.webp";
import { PageTitle } from "@/components/shared/page-title";
import Calendar from "./components/calendar";

const titleData = {
  subTitle: "Calendar",
  title: "Academic Calendar",
};

const holidays = {
  "2026-05-29": "Holiday",
  "2026-06-01": "Holiday",
  "2026-06-03": "Holiday",
  "2026-06-05": "Holiday",
  "2026-06-07": "Holiday",
  "2026-06-11": "Holiday",
  "2026-06-13": "Holiday",
  "2026-06-19": "Holiday",
  "2026-06-25": "Holiday",
};

export default function CalendarPage() {
  return (
    <div className="pb-16">
      <CoverPageBanner
        pageKey="academic"
        fallbackBanner={banner}
        title="Academic Calendar"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Academic" },
          { label: "Academic Calendar" },
        ]}
      />

      <PageTitle titleData={titleData} />
      <Calendar highlightDay={5} holidays={holidays} />
    </div>
  );
}
