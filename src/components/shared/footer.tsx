import Image from "next/image";
import logo from "@/assets/institution/logo.svg";
import Link from "next/link";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaLocationDot,
  FaPhone,
  FaYoutube,
} from "react-icons/fa6";
import { MdEmail } from "react-icons/md";
import { getWebsiteFooterBranding } from "@/services/websiteFooterBranding";
import { getWebsiteContactUs } from "@/services/websiteContactUs";
import { TWebsiteContactInfo } from "@/app/(common)/contact/page";

export type TWebsiteFooterInfo = {
  id: string;
  heading: string;
  subHeading: string;
  description: string;
  footerImage: string;
  brandingImage: string;
  copyrightText: string;
  createdAt: string;
  updatedAt: string;
};

const Footer = async () => {
  const res = await getWebsiteFooterBranding();
  const footerBranding: TWebsiteFooterInfo | undefined = res?.data;
  const contactRes = await getWebsiteContactUs();
  const contactInfo: TWebsiteContactInfo | undefined = contactRes?.data;
  const currentYear = new Date().getFullYear();
  const NavItems1 = (
    <>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Home
        </Link>
      </li>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          About
        </Link>
      </li>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Notice
        </Link>
      </li>
    </>
  );
  const NavItems2 = (
    <>
      <li className=" text-white">
        <Link href="/contact" className="block py-2">
          Contact Us
        </Link>
      </li>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Notice
        </Link>
      </li>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Administration
        </Link>
      </li>
    </>
  );
  const NavItems3 = (
    <>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Privacy Policy
        </Link>
      </li>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Trems & conditions
        </Link>
      </li>
      <li className=" text-white">
        <Link href="/" className="block py-2">
          Notice
        </Link>
      </li>
    </>
  );
  return (
    <div className="bg-[#0F284E] rounded lg:rounded-[30px] text-white py-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5 px-4 md:px-0">
          <div className="flex flex-col">
            <div className="mb-6">
              <Link href="/">
                <Image
                  src={logo}
                  alt="Apex International College"
                  style={{
                    width: 75,
                    height: 75,
                  }}
                />
              </Link>
            </div>
            <p className="text-[18px] leading-7 font-almarai">
              {footerBranding?.subHeading}
            </p>
            <div className="flex flex-col gap-1.5 mt-6 font-almarai">
              <p className="flex items-center gap-2.5">
                <FaLocationDot />
                <span>{contactInfo?.location}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <FaPhone />
                <span>{contactInfo?.phone}</span>
              </p>
              <p className="flex items-center gap-2.5">
                <MdEmail />
                <span>{contactInfo?.email}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl mb-7 font-bebas">Quick Links</h1>
            <div>
              <ul className="menu menu-horizontal gap-1 font-almarai">
                {NavItems1}
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:items-center">
            <h1 className="text-2xl mb-7 font-bebas">Others Links</h1>
            <div>
              <ul className="menu menu-horizontal gap-1 font-almarai">
                {NavItems2}
              </ul>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h1 className="text-2xl mb-7 font-bebas">Others Links</h1>
            <div>
              <ul className="menu menu-horizontal gap-1 font-almarai">
                {NavItems3}
              </ul>
            </div>
            <div className="my-8">
              <h5>Get the latest news & updates</h5>
              <div className="flex gap-5 pt-6 flex-wrap">
                <p className="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                  <FaFacebook className="text-[#0F284E] text-2xl" />
                </p>
                <p className="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                  <FaInstagram className="text-[#0F284E] text-2xl" />
                </p>
                <p className="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                  <FaLinkedin className="text-[#0F284E] text-2xl" />
                </p>
                <p className="w-10 h-10 rounded-full bg-white flex justify-center items-center">
                  <FaYoutube className="text-[#0F284E] text-2xl" />
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* copyright section */}
        <hr className="border-[#F59E0B] my-7" />
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="font-almarai">
            {footerBranding?.copyrightText} &copy; {currentYear}
          </p>
          <p className="font-almarai">
            Develop by - <span className="text-[#E14942]">MNTECH DIGITAL</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
