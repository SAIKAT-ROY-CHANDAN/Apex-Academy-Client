import FeatureCard from "@/components/dashboard/FeatureCard";
import { PageHeader } from "@/components/shared/page-header";
import { WEBSITE_CARDS } from "@/constant/feature/website";

const WebsitePage = () => {
  return (
    <div className="space-y-4 sm:space-y-5">
      <PageHeader title="Website Settings" backHref="/dashboard" />

      <div className="grid grid-cols-1 gap-2.5 pb-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 xl:grid-cols-4">
        {WEBSITE_CARDS.map((card, index) => (
          <FeatureCard
            key={card.name}
            name={card.name}
            icon={<card.icon className="size-4 sm:size-5" />}
            href={card.href}
            color={card.color}
            index={index}
          />
        ))}
      </div>
    </div>
  );
};

export default WebsitePage;
