import { FiArrowUpRight } from "react-icons/fi";
import { TWebsiteContactInfo } from "../page";

export default function ContactSection({ contactInfo }: { contactInfo: TWebsiteContactInfo | undefined }) {
  return (
    <section className="w-full py-16">
      <div className="mx-auto grid max-w-6xl grid-cols-1 px-4 md:px-0 gap-5 md:grid-cols-2">
        {/* Left side */}
        <div className="flex flex-col">
          <h2 className="text-4xl font-bebas">
           {contactInfo?.heading}
          </h2>
          <p className="mt-6 max-w-md text-[#6B7280] font-almarai">
            {contactInfo?.subHeading}
          </p>
        </div>

        {/* Right side */}
        <div className="relative">
          <form className="flex flex-col gap-4 font-almarai">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Full Name"
                className="w-full rounded-full border border-gray-200 px-6 py-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-full border border-gray-200 px-6 py-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
              <input
                type="tel"
                placeholder="Phone"
                className="w-full rounded-full border border-gray-200 px-6 py-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
              <input
                type="text"
                placeholder="Subject"
                className="w-full rounded-full border border-gray-200 px-6 py-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400"
              />
            </div>

            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full resize-none rounded-3xl border border-gray-200 px-6 py-4 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:border-gray-400"
            />

            <button
              type="submit"
              className="mt-2 flex w-fit items-center gap-3 rounded-full bg-[#5C1A3B] py-2 pl-6 pr-2 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#4A1530]"
            >
              Submit
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-black">
                <FiArrowUpRight className="text-white" size={18} />
              </span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
