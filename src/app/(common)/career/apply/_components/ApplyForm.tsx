"use client";

import { FileText, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { type UseFormRegister, useForm } from "react-hook-form";
import { initiateJobApplication } from "@/services/jobApplication";

type FormValues = {
  circularId: string;
  fullName: string;
  gender: string;
  nid: string;
  dob: string;
  phone: string;
  email: string;
  bloodGroup?: string;
  image?: FileList;

  village?: string;
  postOffice?: string;
  subDistrict?: string;
  district?: string;

  degree: string;
  majorSubject: string;
  institution: string;
  cgpa: string;
  graduationYear: string;
  certificate?: FileList;
  cv?: FileList;
};

interface ApplyFormProps {
  circularId?: string;
  positionName?: string | null;
  applyFee?: string | null;
}

/* ---------- Icons ---------- */

function UserIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 stroke-blue-600"
      fill="none"
      strokeWidth={1.8}
      aria-hidden="true"
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
      aria-hidden="true"
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
      aria-hidden="true"
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

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-slate-400"
      fill="none"
      strokeWidth={1.6}
      aria-hidden="true"
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
      aria-hidden="true"
    >
      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UploadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 stroke-slate-500"
      fill="none"
      strokeWidth={1.6}
      aria-hidden="true"
    >
      <path
        d="M12 16V4M8 8l4-4 4 4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------- Reusable field pieces ---------- */

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <span className="mb-2 block text-sm text-slate-700">
      {text}
      {required && <span className="ml-0.5 text-rose-500">*</span>}
    </span>
  );
}

function TextField({
  label,
  name,
  register,
  required,
  placeholder = "Type here...",
  type = "text",
  error,
}: {
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  required?: boolean;
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
        {...register(name, { required })}
        className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800"
      />
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function SelectField({
  label,
  name,
  register,
  required,
  options,
  error,
}: {
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  required?: boolean;
  options: string[];
  error?: string;
}) {
  return (
    <div>
      <Label text={label} required={required} />
      <div className="relative">
        <select
          defaultValue=""
          {...register(name, { required })}
          className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400 outline-none focus:border-purple-800 focus:ring-1 focus:ring-purple-800"
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
  name,
  register,
  required,
  error,
}: {
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <Label text={label} required={required} />
      <div className="flex items-center rounded-lg border border-slate-200 px-4 py-3">
        <input
          type="text"
          placeholder="DD-MM-YYYY"
          {...register(name, { required })}
          className="w-full text-sm text-slate-400 outline-none placeholder:text-slate-400"
        />
        <CalendarIcon />
      </div>
      {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
    </div>
  );
}

function FileField({
  label,
  name,
  register,
  required,
  accept,
}: {
  label: string;
  name: keyof FormValues;
  register: UseFormRegister<FormValues>;
  required?: boolean;
  accept?: string;
}) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");

  const field = register(name, { required });

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    if (file) {
      setFileName(file.name);
      setFileUrl(URL.createObjectURL(file));
    } else {
      setFileName("");
      setFileUrl(null);
    }
    field.onChange(e);
  };

  const isImage = /\.(png|jpe?g|webp|gif|svg)$/i.test(fileName);

  return (
    <div>
      <Label text={label} required={required} />
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-sm text-slate-400 hover:border-slate-300">
        {fileUrl && isImage ? (
          // biome-ignore lint/performance/noImgElement: preview of a local blob: URL
          <img
            src={fileUrl}
            alt={label}
            className="h-14 w-12 shrink-0 rounded object-cover"
          />
        ) : fileUrl ? (
          <span className="flex h-14 w-12 shrink-0 items-center justify-center rounded border border-slate-200 bg-slate-50">
            <FileText className="h-5 w-5 text-slate-500" />
          </span>
        ) : (
          <UploadIcon />
        )}
        <span className="truncate">{fileName || "Select from file"}</span>
        <input
          type="file"
          className="hidden"
          accept={accept}
          name={field.name}
          ref={field.ref}
          onBlur={field.onBlur}
          onChange={handleChange}
        />
      </label>
      {required && !fileName && (
        <p className="mt-1 text-xs text-rose-500">This file is required</p>
      )}
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

/* ---------- Form ---------- */

export function ApplyForm({
  circularId = "",
  positionName = null,
  applyFee = null,
}: ApplyFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>();

  const hasCircular = Boolean(circularId);

  const buildFormData = (data: FormValues): FormData => {
    const fd = new FormData();
    fd.append("circularId", circularId);

    const textFields: (keyof FormValues)[] = [
      "fullName",
      "gender",
      "nid",
      "dob",
      "phone",
      "email",
      "bloodGroup",
      "village",
      "postOffice",
      "subDistrict",
      "district",
      "degree",
      "majorSubject",
      "institution",
      "cgpa",
      "graduationYear",
    ];

    for (const key of textFields) {
      const value = data[key];
      if (typeof value === "string" && value.trim() !== "") {
        fd.append(key, value);
      }
    }

    const fileFields = ["image", "certificate", "cv"] as const;
    for (const key of fileFields) {
      const list = data[key] as FileList | undefined;
      if (list && list.length > 0) {
        fd.append(key, list[0]);
      }
    }

    return fd;
  };

  const onSubmit = async (data: FormValues) => {
    if (!circularId) {
      setSubmitError(
        "Please open this form from a job circular page (Apply Now).",
      );
      return;
    }

    setSubmitError("");
    setSubmitting(true);

    try {
      const res = await initiateJobApplication(buildFormData(data));

      if (res?.success && res.data?.bkashURL) {
        window.location.href = res.data.bkashURL;
        return;
      }

      setSubmitError(res?.message ?? "Something went wrong. Please try again.");
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    }

    setSubmitting(false);
  };

  const fee = Number(applyFee) || 0;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-8">
      {!hasCircular && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <TriangleAlert className="h-5 w-5 shrink-0" />
          Please apply from a specific job circular page to continue.
        </div>
      )}

      {/* Basic Information */}
      <SectionCard icon={<UserIcon />} label="Basic Information">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="Full Name"
            name="fullName"
            register={register}
            required
            error={errors.fullName ? "Full Name is required" : undefined}
          />
          <SelectField
            label="Gender"
            name="gender"
            register={register}
            required
            options={["Male", "Female", "Other"]}
            error={errors.gender ? "Gender is required" : undefined}
          />
          <TextField
            label="NID No."
            name="nid"
            register={register}
            required
            error={errors.nid ? "NID is required" : undefined}
          />
          <DateField
            label="Date of Birth"
            name="dob"
            register={register}
            required
            error={errors.dob ? "Date of Birth is required" : undefined}
          />

          <TextField
            label="Phone"
            name="phone"
            register={register}
            required
            type="tel"
            error={errors.phone ? "Phone is required" : undefined}
          />
          <TextField
            label="Email"
            name="email"
            register={register}
            required
            type="email"
            error={errors.email ? "Email is required" : undefined}
          />
          <SelectField
            label="Blood Group"
            name="bloodGroup"
            register={register}
            options={["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]}
          />
          <FileField
            label="Image (Passport size)"
            name="image"
            register={register}
            accept="image/*"
          />
        </div>
      </SectionCard>

      {/* Address */}
      <SectionCard icon={<LocationIcon />} label="Address">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TextField label="Village/Road" name="village" register={register} />
          <TextField
            label="Post Office"
            name="postOffice"
            register={register}
          />
          <TextField
            label="Sub-district"
            name="subDistrict"
            register={register}
          />
          <TextField label="District" name="district" register={register} />
        </div>
      </SectionCard>

      {/* Academic Qualification */}
      <SectionCard icon={<CapIcon />} label="Academic Qualification">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <TextField
            label="Degree"
            name="degree"
            register={register}
            required
            error={errors.degree ? "Degree is required" : undefined}
          />
          <TextField
            label="Major Subject"
            name="majorSubject"
            register={register}
            required
            error={
              errors.majorSubject ? "Major Subject is required" : undefined
            }
          />
          <TextField
            label="Institution"
            name="institution"
            register={register}
            required
            error={errors.institution ? "Institution is required" : undefined}
          />
          <TextField
            label="CGPA"
            name="cgpa"
            register={register}
            required
            error={errors.cgpa ? "CGPA is required" : undefined}
          />

          <TextField
            label="Graduation Year"
            name="graduationYear"
            register={register}
            required
            error={
              errors.graduationYear ? "Graduation Year is required" : undefined
            }
          />
          <FileField
            label="Upload Certificate"
            name="certificate"
            register={register}
            accept=".pdf,.doc,.docx,image/*"
          />
          <FileField
            label="Upload CV/Resume"
            name="cv"
            register={register}
            accept=".pdf,.doc,.docx,image/*"
          />
        </div>
      </SectionCard>

      {/* Payment Summary */}
      {hasCircular && (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="mb-4 text-base font-semibold text-slate-800">
            Payment Summary
          </h3>
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-500">Position Applied</p>
              <p className="mt-0.5 font-medium text-slate-800">
                {positionName || circularId}
              </p>
            </div>
            <div className="sm:text-right">
              <p className="text-slate-500">Application Fee</p>
              <p className="mt-0.5 text-lg font-semibold text-purple-900">
                {fee > 0 ? `৳ ${fee}` : "Free"}
              </p>
            </div>
          </div>
          {fee > 0 && (
            <p className="mt-4 border-t border-slate-200 pt-4 text-xs text-slate-500">
              After submitting, you will be redirected to{" "}
              <span className="font-medium text-slate-700">bKash</span> to pay
              the application fee. A receipt will be available for download once
              the payment succeeds.
            </p>
          )}
        </div>
      )}

      {submitError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </p>
      )}

      {/* Actions */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            reset();
            setSubmitError("");
          }}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100"
        >
          Clear Form
        </button>
        <button
          type="submit"
          disabled={submitting || !hasCircular}
          className="w-full rounded-lg bg-purple-900 py-4 text-sm font-semibold text-white transition-colors hover:bg-purple-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Redirecting to bKash..." : "Submit & Pay"}
        </button>
      </div>

      <Link
        href="/career"
        className="mx-auto text-sm font-medium text-purple-900 hover:underline"
      >
        Back to all jobs
      </Link>
    </form>
  );
}
