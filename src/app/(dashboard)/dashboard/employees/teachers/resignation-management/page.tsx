import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { getDesignations } from "@/services/designation";
import { getShifts } from "@/services/shift";
import { getAdminResignations } from "@/services/teacherResignation";
import { QueryParams } from "@/types/shared/query.type";
import { CalendarX2, ListX } from "lucide-react";
import ResignationFilter from "./_components/ResignationFilter";
import ResignationCard from "./_components/ResignationCard";
import {
  TAdminResignationResponse,
  TResignationRequest,
} from "@/types/modules/teacher/resignation.type";

const ResignationManagement = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const designationFilter = searchParams.designationFilter;
  const teacherTypeFilter = searchParams.teacherTypeFilter;
  const shiftFilter = searchParams.shiftFilter;
  const adminPositionFilter = searchParams.administrativePositionFilter;
  const search = searchParams.search;

  const query: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "10" },
  ];

  if (search && typeof search === "string") {
    query.push({ label: "searchTerm", value: search });
  }

  const teacherFilter: Record<string, any> = {};
  if (designationFilter && typeof designationFilter === "string") {
    teacherFilter.designation_id = designationFilter;
  }
  if (teacherTypeFilter && typeof teacherTypeFilter === "string") {
    teacherFilter.teacher_type = teacherTypeFilter;
  }
  if (shiftFilter && typeof shiftFilter === "string") {
    teacherFilter.shift_id = shiftFilter;
  }
  if (adminPositionFilter && typeof adminPositionFilter === "string") {
    teacherFilter.administrative_position = adminPositionFilter;
  }

  const filter: Record<string, any> = {};
  if (Object.keys(teacherFilter).length > 0) {
    filter.teacher = teacherFilter;
  }
  if (Object.keys(filter).length > 0) {
    query.push({ label: "filter", value: JSON.stringify(filter) });
  }

  const [response, designationsRes, shiftsRes] = await Promise.all([
    getAdminResignations(query) as Promise<TAdminResignationResponse>,
    getDesignations([{ label: "limit", value: "100" }]),
    getShifts([{ label: "limit", value: "100" }]),
  ]);

  const resignations: TResignationRequest[] = response?.data ?? [];
  const meta = response?.meta;
  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({ id: d.id, name: d.name }),
  );
  const shifts = (shiftsRes?.data ?? []).map(
    (s: { id: string; name: string }) => ({ id: s.id, name: s.name }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Resignation Management"
        backHref="/dashboard/employees"
        actions={{
          href: "/dashboard/employees/teachers/resignation-management/create",
          label: "Add Resignation",
        }}
      />

      <ResignationFilter designations={designations} shifts={shifts} />

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ListX className="h-4 w-4 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Resignations
            </h2>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
              {meta?.totalItems ?? resignations.length}
            </span>
          </div>
        </div>

        {resignations.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-16 text-center">
            <CalendarX2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm font-medium text-muted-foreground">
              No resignation records found.
            </p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Try adjusting the filters above or add a new resignation.
            </p>
          </div>
        ) : (
          resignations.map((request) => (
            <ResignationCard key={request.id} request={request} />
          ))
        )}

        {meta && meta.totalPages > 1 && (
          <PaginationWrapper
            totalPages={meta.totalPages}
            totalItems={meta.totalItems}
            active={page}
          />
        )}
      </div>
    </div>
  );
};

export default ResignationManagement;