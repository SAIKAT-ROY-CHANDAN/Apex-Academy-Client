import { PageHeader } from "@/components/shared/page-header";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getAcademicSections } from "@/services/academicSection";
import { getBatchDetails } from "@/services/batch";
import { getDepartments } from "@/services/department";
import { getPrograms } from "@/services/program";

import HostelStudentsDueReportFilters, {
  Option,
  ReportFilterValues,
} from "./_components/HostelStudentsDueReportFilters";
import HostelStudentsDueReportTable from "./_components/HostelStudentsDueReportTable";
import { getHostelStudentsDueReport, HostelStudentsDueReportRow } from "@/services/hostel-report/hostel-report";

interface HostelStudentsDueReportPageProps {
  searchParams: Promise<
    ReportFilterValues & { page?: string }
  >;
}

const mapToOption = (item: any): Option => ({
  id: String(item.id),
  name:
    item.name ||
    item.class_name ||
    item.batch_name ||
    item.section_name ||
    item.department_name ||
    item.program_name ||
    String(item.id),
});

const HostelReportPage = async ({
  searchParams,
}: HostelStudentsDueReportPageProps) => {
  const params = await searchParams;

  const {
    startDate = "",
    endDate = "",
    programId = "",
    classId = "",
    batchId = "",
    sectionId = "",
    departmentId = "",
    search = "",
    page: pageStr = "1",
  } = params;

  const page = Number(pageStr) || 1;
  const limit = 10;

  let programs: Option[] = [];
  let classes: Option[] = [];
  let batches: Option[] = [];
  let sections: Option[] = [];
  let departments: Option[] = [];
  let reportRows: HostelStudentsDueReportRow[] = [];
  let totalItems = 0;
  let totalPages = 1;

  try {
    const programsRes = await getPrograms([{ label: "limit", value: "500" }]);
    programs = Array.isArray(programsRes?.data)
      ? programsRes.data.map(mapToOption)
      : Array.isArray(programsRes)
        ? programsRes.map(mapToOption)
        : [];

    const departmentParams = programId
      ? [
          {
            label: "filter",
            value: JSON.stringify({ program_id: programId }),
          },
          { label: "limit", value: "500" },
        ]
      : [{ label: "limit", value: "500" }];

    const enrollmentWhere: Record<
      string,
      string | Record<string, string>
    > = {};
    const academicClassWhere: Record<string, string> = {};

    if (programId) academicClassWhere.program_id = programId;
    if (departmentId) academicClassWhere.department_id = departmentId;
    if (classId) enrollmentWhere.academic_class_id = classId;
    if (batchId) enrollmentWhere.batch_id = batchId;
    if (sectionId) enrollmentWhere.academic_section_id = sectionId;
    if (Object.keys(academicClassWhere).length > 0) {
      enrollmentWhere.academicClass = academicClassWhere;
    }

    const filter =
      Object.keys(enrollmentWhere).length > 0
        ? { studentEnrollments: { some: enrollmentWhere } }
        : {};

    const [departmentsRes, batchesRes, sectionsRes, reportRes, classesRes] =
      await Promise.all([
        getDepartments(departmentParams),
        getBatchDetails(),
        getAcademicSections(),
        getHostelStudentsDueReport({
          page,
          limit,
          startDate,
          endDate,
          searchTerm: search,
          filter: Object.keys(filter).length > 0 ? filter : undefined,
        }),
        getAcademicClassDetails(
          departmentId
            ? [
                {
                  label: "filter",
                  value: JSON.stringify({ department_id: departmentId }),
                },
                { label: "limit", value: "500" },
              ]
            : [{ label: "limit", value: "500" }],
        ),
      ]);

    departments = Array.isArray(departmentsRes?.data)
      ? departmentsRes.data.map(mapToOption)
      : Array.isArray(departmentsRes)
        ? departmentsRes.map(mapToOption)
        : [];

    classes = Array.isArray(classesRes?.data)
      ? classesRes.data.map(mapToOption)
      : Array.isArray(classesRes)
        ? classesRes.map(mapToOption)
        : [];

    batches = Array.isArray(batchesRes?.data)
      ? batchesRes.data.map(mapToOption)
      : Array.isArray(batchesRes)
        ? batchesRes.map(mapToOption)
        : [];

    sections = Array.isArray(sectionsRes?.data)
      ? sectionsRes.data.map(mapToOption)
      : Array.isArray(sectionsRes)
        ? sectionsRes.map(mapToOption)
        : [];

    reportRows = Array.isArray(reportRes?.data)
      ? (reportRes.data as HostelStudentsDueReportRow[])
      : [];

    totalItems = reportRes?.meta?.totalItems ?? reportRows.length;
    totalPages = reportRes?.meta?.totalPages ?? Math.ceil(totalItems / limit);
  } catch (error) {
    console.error("Failed to load hostel students due report:", error);
  }

  const initialFilters: ReportFilterValues = {
    startDate,
    endDate,
    programId,
    classId,
    batchId,
    sectionId,
    departmentId,
    search,
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hostel Students Due Report"
        backHref="/dashboard/hostel"
      />

      <HostelStudentsDueReportFilters
        initialFilters={initialFilters}
        programs={programs}
        classes={classes}
        batches={batches}
        sections={sections}
        departments={departments}
      />

      <HostelStudentsDueReportTable
        rows={reportRows}
        currentPage={page}
        totalItems={totalItems}
        totalPages={totalPages}
      />
    </div>
  );
};

export default HostelReportPage;