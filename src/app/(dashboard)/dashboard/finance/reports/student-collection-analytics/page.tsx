import { PageHeader } from "@/components/shared/page-header";
import PaginationWrapper from "@/components/shared/PaginationWrapper";
import { getStudentCollectionReport } from "@/services/report";
import { getInstitutionDetails } from "@/services/institution";
import { getPrograms } from "@/services/program";
import { getDepartments } from "@/services/department";
import { getAcademicClassDetails } from "@/services/academicClass";
import type { StudentCollectionReport } from "../_components/types/collectionReport";
import { CollectionReportFilters } from "../_components/CollectionReportFilters";
import { CollectionSummaryCards } from "../_components/CollectionSummaryCards";
import { CollectionMonthlyBarChart } from "../_components/CollectionMonthlyBarChart";
import { StudentsCollectionTable } from "../_components/StudentsCollectionTable";
import { CollectionRecordsTable } from "../_components/CollectionRecordsTable";
import { CollectionRecordsExportButton } from "../_components/CollectionRecordsExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { QueryParams } from "@/types/shared/query.type";

interface StudentCollectionAnalyticsProps {
  searchParams: Promise<{
    page?: string;
    from_date?: string;
    to_date?: string;
    program_id?: string;
    department_id?: string;
    academic_class_id?: string;
    searchTerm?: string;
    student_id?: string;
  }>;
}

const StudentCollectionAnalytics = async ({
  searchParams,
}: StudentCollectionAnalyticsProps) => {
  const resolved = await searchParams;

  const {
    page: pageStr = "1",
    from_date = "",
    to_date = "",
    program_id = "",
    department_id = "",
    academic_class_id = "",
    searchTerm = "",
    student_id = "",
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

  // Departments: only fetch when program is selected (COLLEGE mode)
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

  // Classes: only fetch when parent is selected
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

  // Build report query params
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
  if (student_id) filter.student_id = student_id;

  if (Object.keys(filter).length > 0) {
    queryParams.push({ label: "filter", value: JSON.stringify(filter) });
  }
  if (searchTerm) {
    queryParams.push({ label: "searchTerm", value: searchTerm });
  }

  const response = await getStudentCollectionReport(queryParams);

  const rawData = response?.data?.data ?? {};
  const report: StudentCollectionReport = {
    monthly: Array.isArray(rawData?.monthly) ? rawData.monthly : [],
    students: Array.isArray(rawData?.students) ? rawData.students : [],
    records: Array.isArray(rawData?.records) ? rawData.records : [],
  };

  const meta = response?.data?.meta;

  const totalAmount = report.monthly.reduce((sum, m) => sum + m.totalAmount, 0);
  const totalCount = report.monthly.reduce(
    (sum, m) => sum + m.collectionCount,
    0,
  );
  const studentCount = report.students.length;
  const monthCount = report.monthly.length;

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
        title="Student Collection Analytics"
        backHref="/dashboard/finance/reports"
      />

      <div>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Collection Analytics
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Track student fee collections by date and student with detailed
          breakdown.
        </p>
      </div>

      <CollectionReportFilters
        mode={mode}
        programs={programs}
        departments={departments}
        classes={classes}
        initialFilters={initialFilters}
      />

      <CollectionSummaryCards
        totalAmount={totalAmount}
        totalCount={totalCount}
        studentCount={studentCount}
        monthCount={monthCount}
      />

      <CollectionMonthlyBarChart data={report.monthly} />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-slate-700">
            Student Collection Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StudentsCollectionTable students={report.students} />
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-slate-700">
              Collection Records Detail
            </CardTitle>
            <CollectionRecordsExportButton records={report.records} />
          </div>
        </CardHeader>
        <CardContent>
          <CollectionRecordsTable records={report.records} />
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

export default StudentCollectionAnalytics;
