import Link from "next/link";
import {
  Briefcase,
  ChevronLeft,
  DollarSign,
  GraduationCap,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchForm } from "@/components/dashboard/SearchForm";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { getWebsiteJobCircularById } from "@/services/websiteJobCircular";
import { getAllJobApplications } from "@/services/jobApplication";
import { JobApplicantsTable } from "./_components/JobApplicantsTable";
import type { JobApplicantItem } from "./_components/ApplicantDetailDialog";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function JobCircularApplicantsPage(props: PageProps) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search =
    typeof searchParams.search === "string" ? searchParams.search : undefined;

  let circular: any = null;
  let applicantsResponse: any = null;

  try {
    const [circularRes, appsRes] = await Promise.all([
      getWebsiteJobCircularById(id),
      getAllJobApplications({
        circular_id: id,
        payment_status: "PAID",
        searchTerm: search,
        page,
        limit: 10,
      }),
    ]);

    circular = circularRes?.data;
    applicantsResponse = appsRes;
  } catch (err) {
    console.error("Failed to load applicants:", err);
  }

  const applicants: JobApplicantItem[] = applicantsResponse?.data ?? [];
  const meta = applicantsResponse?.meta;
  const totalPaidApplicants = meta?.totalItems ?? applicants.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={circular ? `${circular.positionName ?? "Job"} Applicants` : "Job Applicants"}
        backHref="/dashboard/website/job-circular"
      />

      {/* Circular Summary Banner */}
      {circular && (
        <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-linear-to-r from-blue-50/70 via-indigo-50/40 to-white p-6 shadow-xs">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-600/20">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {circular.positionName}
                  </h2>
                  {circular.positionType && (
                    <span className="rounded-full bg-blue-100/80 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                      {circular.positionType}
                    </span>
                  )}
                </div>
                {circular.educationalQualification && (
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                    <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                    Required: {circular.educationalQualification}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-6 border-t border-slate-200/60 pt-3 sm:border-t-0 sm:pt-0">
              <div className="text-left sm:text-right">
                <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Application Fee
                </span>
                <span className="text-lg font-bold text-slate-800">
                  ৳ {circular.applyFee ?? "0"}
                </span>
              </div>

              <div className="h-8 w-px bg-slate-200" />

              <div className="text-left sm:text-right">
                <span className="block text-xs font-medium uppercase tracking-wider text-slate-400">
                  Paid Applicants
                </span>
                <span className="flex items-center gap-1 text-lg font-bold text-emerald-600">
                  <Users className="h-4 w-4" />
                  {totalPaidApplicants}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Actions Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-72">
          <SearchForm
            defaultValue={search ?? ""}
            placeholder="Search by name, phone, NID..."
          />
        </div>
      </div>

      {/* Applicants Table */}
      <JobApplicantsTable applicants={applicants} />

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="mt-6">
          <PaginationWrapper
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            active={page}
          />
        </div>
      )}
    </div>
  );
}
