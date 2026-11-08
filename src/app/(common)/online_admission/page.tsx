"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { type UseFormRegisterReturn, useForm } from "react-hook-form";
import banner from "@/assets/heroBanner.webp";
import PageBanner from "@/components/shared/page-banner";
import { PageTitle } from "@/components/shared/page-title";
import { registerStudent } from "@/services/student";
import {
  type OnlineAdmissionFormValues,
  onlineAdmissionSchema,
} from "@/validation/student/online-admission.validation";

/* ---------- Icons ---------- */

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-blue-600"
      fill="none"
      strokeWidth={1.8}
    >
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20c1.2-3.5 4-5 7-5s5.8 1.5 7 5" strokeLinecap="round" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-blue-600"
      fill="none"
      strokeWidth={1.8}
    >
      <path
        d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="9.5" r="2.3" />
    </svg>
  );
}

function CapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-blue-600"
      fill="none"
      strokeWidth={1.8}
    >
      <path
        d="M12 4 2 9l10 5 10-5-10-5Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 11.5V17c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5v-5.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-blue-600"
      fill="none"
      strokeWidth={1.8}
    >
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-slate-400"
      fill="none"
      strokeWidth={1.6}
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18" strokeLinecap="round" />
      <path d="M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-slate-500"
      fill="none"
      strokeWidth={2}
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ---------- Reusable field pieces ---------- */

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <label className="mb-2 block text-sm text-slate-700">
      {text}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </label>
  );
}

type RegisterProps = UseFormRegisterReturn;

const emptyRegister: RegisterProps = {
  name: "",
  onChange: () => Promise.resolve(),
  onBlur: () => Promise.resolve(),
  ref: () => {},
};

function TextField({
  label,
  required,
  register = emptyRegister,
  placeholder = "Type here...",
  type = "text",
  error,
}: {
  label: string;
  required?: boolean;
  register?: RegisterProps;
  placeholder?: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <Label text={label} required={required} />
      <input
        type={type}
        placeholder={placeholder}
        {...register}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800"
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  required,
  options,
  register = emptyRegister,
  error,
}: {
  label: string;
  required?: boolean;
  options: string[];
  register?: RegisterProps;
  error?: string;
}) {
  return (
    <div>
      <Label text={label} required={required} />
      <div className="relative">
        <select
          {...register}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800"
        >
          <option value="" disabled>
            Select One
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="text-slate-700">
              {opt}
            </option>
          ))}
        </select>
        <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <ChevronDownIcon />
        </span>
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function DateField({
  label,
  required,
  register = emptyRegister,
  error,
}: {
  label: string;
  required?: boolean;
  register?: RegisterProps;
  error?: string;
}) {
  return (
    <div>
      <Label text={label} required={required} />
      <div className="flex items-center rounded-lg border border-slate-200 px-4 py-3">
        <input
          type="date"
          {...register}
          className="w-full text-sm text-slate-700 outline-none"
        />
        <CalendarIcon />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function SectionBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="absolute -top-4 left-6 inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-blue-600">
      {icon}
      {label}
    </span>
  );
}

function SectionCard({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-2xl border border-slate-200 p-6 pt-10 sm:p-8 sm:pt-12">
      <SectionBadge icon={icon} label={label} />
      {children}
    </div>
  );
}

/* ---------- Page ---------- */

const titleData = {
  subTitle: "Apply",
  title: "Apply through this Form",
};

export default function ApplyFormPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<OnlineAdmissionFormValues>({
    resolver: zodResolver(onlineAdmissionSchema),
    defaultValues: {
      name: "",
      father_name: "",
      mother_name: "",
      gender: "",
      nid_no: "",
      date_of_birth: "",
      student_phone: "",
      father_phone: "",
      mother_phone: "",
      email: "",
      password: "",
      confirm_password: "",
      village_road: "",
      post_office: "",
      sub_district: "",
      district: "",
      religion: "",
      degree: "",
      major_subject: "",
      institution: "",
      cgpa: "",
      graduation_year: "",
    },
  });

  const onSubmit = async (values: OnlineAdmissionFormValues) => {
    setSubmitting(true);
    setSubmitMessage("");

    const genderMap: Record<string, string> = {
      Male: "MALE",
      Female: "FEMALE",
      Other: "OTHER",
    };

    const religionMap: Record<string, string> = {
      Islam: "ISLAM",
      Hinduism: "HINDU",
      Buddhism: "BUDDHIST",
      Christianity: "CHRISTIAN",
      Other: "OTHER",
    };

    const payload = {
      name: values.name,
      father_name: values.father_name,
      mother_name: values.mother_name,
      gender: genderMap[values.gender] ?? values.gender,
      nid_no: values.nid_no,
      student_phone: values.student_phone,
      father_phone: values.father_phone,
      mother_phone: values.mother_phone,
      email: values.email,
      password: values.password,
      village_road: values.village_road,
      post_office: values.post_office,
      sub_district: values.sub_district,
      district: values.district,
      religion: values.religion
        ? (religionMap[values.religion] ?? values.religion)
        : undefined,
    };

    try {
      const response = await registerStudent(payload);

      if (!response.success) {
        setSubmitMessage(response.message ?? "Failed to submit application");
        setSubmitting(false);
        return;
      }

      setSubmitted(true);
      reset();
    } catch {
      setSubmitMessage("Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageBanner
        banner={banner}
        title="Online Admission"
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Online Admission" },
        ]}
      />

      <section className="bg-white px-4 mb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <PageTitle titleData={titleData} />

          {submitted ? (
            <div className="mt-10 flex flex-col items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl font-bold text-white">
                ✓
              </div>
              <h2 className="text-xl font-semibold text-emerald-800">
                Application Submitted
              </h2>
              <p className="max-w-md text-sm text-emerald-700">
                Your application has been submitted successfully. It is now
                pending approval by the administration. Once approved, you will
                be able to log in with the email and password you provided.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="mt-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
              >
                Submit Another Application
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="mt-10 flex flex-col gap-8 lg:max-w-4xl 2xl:max-w-6xl mx-auto font-almarai"
            >
              {/* Basic Information */}
              <SectionCard icon={<UserIcon />} label="Basic Information">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField
                    label="Full Name"
                    required
                    register={register("name")}
                    error={errors.name?.message}
                  />
                  <TextField
                    label="Father's Name"
                    required
                    register={register("father_name")}
                    error={errors.father_name?.message}
                  />
                  <TextField
                    label="Mother's Name"
                    required
                    register={register("mother_name")}
                    error={errors.mother_name?.message}
                  />
                  <SelectField
                    label="Gender"
                    required
                    register={register("gender")}
                    error={errors.gender?.message}
                    options={["Male", "Female", "Other"]}
                  />
                  <TextField
                    label="NID / Birth Certificate No."
                    register={register("nid_no")}
                  />
                  <DateField
                    label="Date of Birth"
                    required
                    register={register("date_of_birth")}
                    error={errors.date_of_birth?.message}
                  />
                  <TextField
                    label="Student Phone"
                    type="tel"
                    register={register("student_phone")}
                  />
                  <TextField
                    label="Father's Phone"
                    required
                    type="tel"
                    register={register("father_phone")}
                    error={errors.father_phone?.message}
                  />
                  <TextField
                    label="Mother's Phone"
                    type="tel"
                    register={register("mother_phone")}
                  />
                  <TextField
                    label="Email"
                    required
                    type="email"
                    register={register("email")}
                    error={errors.email?.message}
                  />
                  <SelectField
                    label="Religion"
                    register={register("religion")}
                    options={[
                      "Islam",
                      "Hinduism",
                      "Buddhism",
                      "Christianity",
                      "Other",
                    ]}
                  />
                </div>
              </SectionCard>

              {/* Address */}
              <SectionCard icon={<LocationIcon />} label="Address">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField
                    label="Village/Road"
                    register={register("village_road")}
                  />
                  <TextField
                    label="Post Office"
                    register={register("post_office")}
                  />
                  <TextField
                    label="Sub-district"
                    required
                    register={register("sub_district")}
                    error={errors.sub_district?.message}
                  />
                  <TextField
                    label="District"
                    required
                    register={register("district")}
                    error={errors.district?.message}
                  />
                </div>
              </SectionCard>

              {/* Academic Qualification */}
              <SectionCard icon={<CapIcon />} label="Academic Qualification">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  <TextField label="Degree" register={register("degree")} />
                  <TextField
                    label="Major Subject"
                    register={register("major_subject")}
                  />
                  <TextField
                    label="Institution"
                    register={register("institution")}
                  />
                  <TextField label="CGPA" register={register("cgpa")} />
                  <TextField
                    label="Graduation Year"
                    register={register("graduation_year")}
                  />
                </div>
              </SectionCard>

              {/* Account Credentials */}
              <SectionCard icon={<LockIcon />} label="Login Credentials">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                  <TextField
                    label="Password"
                    required
                    type="password"
                    register={register("password")}
                    error={errors.password?.message}
                  />
                  <TextField
                    label="Confirm Password"
                    required
                    type="password"
                    register={register("confirm_password")}
                    error={errors.confirm_password?.message}
                  />
                </div>
                <p className="mt-3 text-xs text-slate-500">
                  Use these credentials to log in after your application is
                  approved.
                </p>
              </SectionCard>

              {submitMessage && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {submitMessage}
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="reset"
                  onClick={() => reset()}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                  Clear Form
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-purple-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:opacity-70"
                >
                  {submitting ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
