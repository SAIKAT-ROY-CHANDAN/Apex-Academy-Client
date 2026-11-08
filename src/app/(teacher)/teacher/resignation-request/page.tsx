import Link from "next/link";
import { FileText } from "lucide-react";
import { FaPlus } from "react-icons/fa6";
import PageRoute from "../components/dynamicRoute";
import ResignationCard from "./_components/ResignationCard";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { loggedInTeacherUser } from "@/services/logged-user";
import { getAllResignations } from "@/services/teacherResignation";
import { QueryParams } from "@/types/shared/query.type";
import {
  TResignationRequest,
  TResignationResponse,
} from "@/types/modules/teacher/resignation.type";

const ResignationRequest = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const search = searchParams.search;

  const query: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
  ];

  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const loggedInTeacher = await loggedInTeacherUser();
  const response = (await getAllResignations(
    loggedInTeacher.id,
    query,
  )) as TResignationResponse;
  const meta = response?.data?.meta;
  const requests: TResignationRequest[] = response?.data?.data ?? [];

  const totalCount = meta?.totalItems ?? requests.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <PageRoute
            title="Resignation Request"
            breadcrumbs={[
              { label: "Overview", href: "/teacher" },
              { label: "Resignation Request" },
            ]}
          />
          <Link
            href="/teacher/resignation-request/apply"
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md w-fit"
          >
            <FaPlus className="w-4 h-4" />
            <span>Apply for Resignation</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="relative overflow-hidden rounded-2xl border bg-blue-50 text-blue-600 border-blue-100 p-6 transition-all duration-300 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-1">
                  Total Resignations
                </p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {totalCount}
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-blue-100 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              My Resignation Requests
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {requests.length === 0 ? (
              <div className="py-16 px-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No resignation requests found
                </h3>
                <p className="text-gray-500 text-sm">
                  You haven&apos;t submitted any resignation requests yet.
                </p>
                <Link
                  href="/teacher/resignation-request/apply"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <FaPlus className="w-4 h-4" />
                  Submit Your First Request
                </Link>
              </div>
            ) : (
              requests.map((request) => (
                <ResignationCard key={request.id} request={request} />
              ))
            )}
          </div>

          {meta?.totalPages && meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
              <PaginationWrapper
                totalPages={meta.totalPages}
                totalItems={meta.totalItems}
                active={page}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResignationRequest;