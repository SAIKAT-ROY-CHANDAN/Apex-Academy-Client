"use client";

import { useParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { FaRegUserCircle } from "react-icons/fa";
import banner from "@/assets/heroBanner.webp";
import ClientCoverPageBanner from "@/components/shared/client-cover-page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { createWebsiteCareerDevelopmentApplication } from "@/services/websiteCareerDevelopmentApplication";
import { getWebsiteCareerDevelopmentProgrammeById } from "@/services/websiteCareerDevelopmentProgramme";
import DevelopmentSkeleton from "../components/developmentSkeleton";
import type { TCourse } from "../page";

type TFormData = {
  fullName: string;
  phone: string;
  email: string;
  address: string;
};

const initialFormData: TFormData = {
  fullName: "",
  phone: "",
  email: "",
  address: "",
};

const Page = () => {
  const [formData, setFormData] = useState<TFormData>(initialFormData);
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<TCourse>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await getWebsiteCareerDevelopmentProgrammeById(id);
        setData(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) return <DevelopmentSkeleton />;
  if (error) return <div>{error}</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleClear = () => {
    setFormData(initialFormData);
    setMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setMessage("Full Name is required");
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const response = await createWebsiteCareerDevelopmentApplication({
        programmeId: id,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
      });

      if (!response.success) {
        setMessage(
          response.message ?? "Failed to submit your application. Please try again.",
        );
        return;
      }

      setFormData(initialFormData);
      setMessage("Your application has been submitted successfully.");
    } catch (err) {
      console.error(err);
      setMessage("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  const titleData = {
    subTitle: "Apply",
    title: "Apply through this From",
  };

  return (
    <div>
      <ClientCoverPageBanner
        pageKey="students"
        fallbackBanner={banner}
        title="Registration"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Student Facilities" },
          { label: "Registration for Career Development" },
        ]}
      />

      <PageTitle titleData={titleData} />
      <div className="lg:max-w-4xl 2xl:max-w-6xl  mx-auto px-4 md:px-0 mb-20">
        <h5 className="font-bebas">Description</h5>

        <div
          className="job-description mb-10 font-almarai"
          dangerouslySetInnerHTML={{ __html: data?.description || "" }}
        />

        <form onSubmit={handleSubmit} className="font-almarai">
          {message && (
            <div
              className={`mb-4 rounded-lg px-4 py-3 text-sm font-medium ${
                message === "Your application has been submitted successfully."
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {message}
            </div>
          )}

          <div className="border border-blue-100 rounded-xl p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 border border-gray-200 rounded-md px-3 py-1.5 text-blue-600 text-sm font-medium mb-6">
              <FaRegUserCircle />
              Basic Information
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label htmlFor="fullName" className="block text-sm text-gray-700 mb-2">
                  Full Name<span className="text-red-500">*</span>
                </label>
                <input
                  id="fullName"
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Type here..."
                  required
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a2545]/30 focus:border-[#4a2545]"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm text-gray-700 mb-2">
                  Phone
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Type here..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a2545]/30 focus:border-[#4a2545]"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Type here..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a2545]/30 focus:border-[#4a2545]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm text-gray-700 mb-2">
                  Address
                </label>
                <input
                  id="address"
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Type here..."
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4a2545]/30 focus:border-[#4a2545]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            <button
              type="button"
              onClick={handleClear}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3.5 rounded-full transition-colors"
            >
              Clear Form
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#4a2545] hover:bg-[#3a1c37] text-[#F59E0B] font-medium py-3.5 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting..." : "Apply Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Page;
