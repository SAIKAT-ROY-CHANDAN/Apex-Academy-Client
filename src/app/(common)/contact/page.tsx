import banner from "@/assets/contact/banner.webp";
import { FaPhone } from "react-icons/fa6";
import { MdEmail, MdOutlineArrowOutward } from "react-icons/md";
import { CiFacebook } from "react-icons/ci";
import ContactSection from "./components/contactSection";
import CoverPageBanner from "@/components/shared/cover-page-banner";
import { getWebsiteContactUs } from "@/services/websiteContactUs";

export type TWebsiteContactInfo = {
  id: string;
  heading: string;
  subHeading: string;
  phone: string;
  email: string;
  location: string;
  mapUrl: string;
  workingHours: string;
  facebookUrl: string;
  createdAt: string;
  updatedAt: string;
};

const page = async () => {
  const res = await getWebsiteContactUs();
  const contactInfo: TWebsiteContactInfo | undefined = res?.data;
  return (
    <div>
      <CoverPageBanner pageKey="contactUs"
        fallbackBanner={banner}
        title="Contact Us"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-32 lg:max-w-4xl 2xl:max-w-6xl mx-auto px-4 md:px-0">
        <div className="bg-[#F0F1F1] p-5 rounded-2xl">
          <p className="bg-[#0F284E] p-5 rounded-2xl text-5xl w-fit mb-8">
            <MdEmail className="text-white" />
          </p>
          <h3 className="text-3xl text-black uppercase font-bebas">Email</h3>

          <p className="text-[#404040] font-almarai">{contactInfo?.email}</p>
        </div>
        <div className="bg-[#F0F1F1] p-5 rounded-2xl">
          <p className="bg-[#0F284E] p-5 rounded-2xl text-5xl w-fit mb-8">
            <FaPhone className="text-white" />
          </p>
          <h3 className="text-3xl text-black uppercase font-bebas mb-1.5">
            Phone
          </h3>

          <p className="text-[#404040] font-almarai">{contactInfo?.phone}</p>
        </div>
        <div className="bg-[#F0F1F1] p-5 rounded-2xl">
          <p className="bg-[#0F284E] p-5 rounded-2xl text-5xl w-fit mb-8">
            <CiFacebook className="text-white" />
          </p>
          <h3 className="text-3xl text-black uppercase font-bebas mb-1.5">
            Facebook
          </h3>

          <p className="text-[#404040] font-almarai">
            {contactInfo?.facebookUrl}
          </p>
        </div>
      </div>

      <div className="lg:max-w-4xl 2xl:max-w-6xl mx-auto">
        <ContactSection contactInfo={contactInfo} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 my-14 gap-10 lg:max-w-4xl 2xl:max-w-6xl mx-auto px-4 md:px-0">
        <div>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d230.06971084919408!2d90.35265516489744!3d22.686748600575875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x37553594d3e577bf%3A0xce2cba69a27bf6c!2sMNTECH%20DIGITAL!5e0!3m2!1sen!2sbd!4v1784961407601!5m2!1sen!2sbd"
            width="600"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            className="w-full h-[450px] rounded-2xl"
          ></iframe>
        </div>
        <div className="bg-[#0F284E] p-12 rounded-2xl">
          <h2 className="text-white text-3xl mb-4 font-bebas">Location</h2>
          <p className="text-white font-almarai">
            {contactInfo?.location}
          </p>
          <hr className="my-8" />
          <h4 className="text-xl text-white font-bebas">Working Hours</h4>
          <p className="text-white font-almarai">
            {contactInfo?.workingHours}
          </p>
          <hr className="my-8" />
          <a
            href={contactInfo?.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="relative uppercase text-black bg-[#F59E0B] p-4 rounded-full w-full flex items-center justify-center"
          >
            <span className="block text-center font-almarai">
              Get Direction
            </span>
            <span className="absolute right-4 top-1/2 -translate-y-1/2 bg-black text-white text-2xl rounded-full p-1 flex items-center justify-center">
              <MdOutlineArrowOutward />
            </span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default page;
