import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { getStudentDueReport } from "@/services/report";
import { getInstitutionDetails } from "@/services/institution";
import { getPrograms } from "@/services/program";
import { getDepartments } from "@/services/department";
import { getAcademicClassDetails } from "@/services/academicClass";
import type { StudentDueReport } from "../_components/types/dueReport";
import { DueReportFilters } from "../_components/DueReportFilters";
import { DueSummaryCards } from "../_components/DueSummaryCards";
import { DueAmountByClassChart } from "../_components/DueAmountByClassChart";
import { StudentsDueTable } from "../_components/StudentsDueTable";
import { StudentsDueExportButton } from "../_components/StudentsDueExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueryParams } from "@/types/shared/query.type";

interface StudentDueAmountAnalyticsProps {
  searchParams: Promise<{
    page?: string;
    from_date?: string;
    to_date?: string;
    program_id?: string;
    department_id?: string;
    academic_class_id?: string;
    searchTerm?: string;
  }>;
}

const StudentDueAmountAnalytics = async ({
  searchParams,
}: StudentDueAmountAnalyticsProps) => {
  const resolved = await searchParams;

  const {
    page: pageStr = "1",
    from_date = "",
    to_date = "",
    program_id = "",
    department_id = "",
    academic_class_id = "",
    searchTerm = "",
  } = resolved;

  const page = Number(pageStr) || 1;

  const [institutionRes, programsRes] = await Promise.all([
    getInstitutionDetails(),
    getPrograms([{ label: "limit", value: "500" }]),
  ]);

  const mode = institutionRes?.data?.mode || "SCHOOL";
  const isCollege = mode === "COLLEGE_UNIVERSITY";

  const programs = Array.isArray(programsRes?.data)
    ? programsRes.data.map((item: any) => ({
        id: String(item.id),
        name: item.program_name ?? String(item.id),
      }))
    : [];

  let departments: { id: string; name: string }[] = [];
  if (isCollege && program_id) {
    const deptRes = await getDepartments([
      { label: "filter", value: JSON.stringify({ program_id }) },
      { label: "limit", value: "500" },
    ]);
    departments = Array.isArray(deptRes?.data)
      ? deptRes.data.map((item: any) => ({
          id: String(item.id),
          name: item.department_name ?? String(item.id),
        }))
      : [];
  }

  let classes: { id: string; name: string }[] = [];
  if (isCollege && department_id) {
    const classRes = await getAcademicClassDetails([
      { label: "filter", value: JSON.stringify({ department_id }) },
      { label: "limit", value: "500" },
    ]);
    classes = Array.isArray(classRes?.data)
      ? classRes.data.map((item: any) => ({
          id: String(item.id),
          name: item.class_name ?? String(item.id),
        }))
      : [];
  } else if (!isCollege) {
    const classRes = await getAcademicClassDetails([
      { label: "limit", value: "500" },
    ]);
    classes = Array.isArray(classRes?.data)
      ? classRes.data.map((item: any) => ({
          id: String(item.id),
          name: item.class_name ?? String(item.id),
        }))
      : [];
  }

  const queryParams: QueryParams[] = [
    { label: "page", value: page.toString() },
    { label: "limit", value: "20" },
  ];

  const filter: Record<string, any> = {};
  if (from_date) filter.from_date = from_date;
  if (to_date) filter.to_date = to_date;
  if (program_id) filter.program_id = program_id;
  if (department_id) filter.department_id = department_id;
  if (academic_class_id) filter.academic_class_id = academic_class_id;

  if (Object.keys(filter).length > 0) {
    queryParams.push({ label: "filter", value: JSON.stringify(filter) });
  }
  if (searchTerm) {
    queryParams.push({ label: "searchTerm", value: searchTerm });
  }

  const response = await getStudentDueReport(queryParams);

  const rawData = response?.data?.data ?? {};
  const report: StudentDueReport = {
    summary: {
      totalDueAmount: rawData?.summary?.totalDueAmount ?? 0,
      totalStudentsWithDue: rawData?.summary?.totalStudentsWithDue ?? 0,
      totalLineAmount: rawData?.summary?.totalLineAmount ?? 0,
      totalPaidAmount: rawData?.summary?.totalPaidAmount ?? 0,
    },
    students: Array.isArray(rawData?.students) ? rawData.students : [],
  };

  const meta = response?.data?.meta;

  const totalLineAmount = report.summary.totalLineAmount;
  const totalPaidAmount = report.summary.totalPaidAmount;

  const initialFilters = {
    from_date,
    to_date,
    program_id,
    department_id,
    academic_class_id,
    searchTerm,
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Student Due Amount Analytics"
        backHref="/dashboard/finance/reports"
      />

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Due Amount Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          View students with outstanding due amounts and their fee breakdown.
        </p>
      </div>

      <DueReportFilters
        mode={mode}
        programs={programs}
        departments={departments}
        classes={classes}
        initialFilters={initialFilters}
      />

      <DueSummaryCards
        totalDueAmount={report.summary.totalDueAmount}
        totalStudentsWithDue={report.summary.totalStudentsWithDue}
        totalLineAmount={totalLineAmount}
        totalPaidAmount={totalPaidAmount}
      />

      <DueAmountByClassChart students={report.students} />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">
              Students With Due Amounts
            </CardTitle>
            <StudentsDueExportButton students={report.students} />
          </div>
        </CardHeader>
        <CardContent>
          <StudentsDueTable students={report.students} />
        </CardContent>
      </Card>

      {meta?.totalPages > 1 && (
        <PaginationWrapper
          totalPages={meta.totalPages}
          totalItems={meta.totalItems}
          active={meta.currentPage}
        />
      )}
    </div>
  );
};

export default StudentDueAmountAnalytics;
