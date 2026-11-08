import AboutGlance from "./about/about_college/components/glance";
import AdministrationQuote from "./about/administration/components/administrationQuote";
import CTABanner from "./home/component/ctaBanner";
import FaqSection from "./home/component/faq";
import HeroSection from "./home/component/heroSection";
import HomeGallery from "./home/component/homeGallery";
import ManagementTeam from "./about/management/components/managementTeam";
import HomeNotice from "./home/component/homeNotice";
import { getAllWebsiteFaqs } from "@/services/websiteFaq";
import { getWebsiteCtaBanner } from "@/services/websiteCtaBanner";
import { getAllWebsiteHeadOfDepartments } from "@/services/websiteHeadOfDepartment";

const managementSectionTitle = {
  subTitle: "Management",
  title: "Meet Our Head Of The Departments",
};

export type TWebsiteFAQ = {
  id: string;
  question: string;
  answer: string;
  created_at: string;
  updated_at: string;
};

export type TWebsiteCTA = {
  id: string;
  heading: string;
  subHeading: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}; 

const page = async () => {
  const faqRes = await getAllWebsiteFaqs();
  const faqData: TWebsiteFAQ[] = faqRes?.data || [];

  const ctaRes = await getWebsiteCtaBanner();
  const ctaData: TWebsiteCTA = ctaRes?.data;

 const res = await getAllWebsiteHeadOfDepartments();
   const { data } = res;
  return (
    <div>
      <HeroSection />
      <AboutGlance />
      <AdministrationQuote />
      <HomeNotice />
      <ManagementTeam titleData={managementSectionTitle} teamData={data} />
      <HomeGallery />
      <CTABanner ctaData={ctaData} />
      <FaqSection faqData={faqData} />
    </div>
  );
};

export default page;
