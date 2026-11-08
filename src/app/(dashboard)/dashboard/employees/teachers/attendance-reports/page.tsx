import { PageHeader } from "@/components/shared/page-header";
import { getDesignations } from "@/services/designation";
import { getDepartments } from "@/services/department";
import { getTeacherAttendanceReport } from "@/services/teacherAttendance";
import TeacherAttendanceReportFilter from "./_components/TeacherAttendanceReportFilter";
import TeacherAttendanceReportTable from "./_components/TeacherAttendanceReportTable";

const TeacherAttendanceReportPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;

  const currentTeacherType =
    typeof searchParams.teacher_type === "string"
      ? searchParams.teacher_type
      : "";
  const currentDesignationId =
    typeof searchParams.designation_id === "string"
      ? searchParams.designation_id
      : "";
  const currentDepartmentId =
    typeof searchParams.department_id === "string"
      ? searchParams.department_id
      : "";
  const currentAdminPosition =
    typeof searchParams.administrative_position === "string"
      ? searchParams.administrative_position
      : "";
  const currentStartDate =
    typeof searchParams.start_date === "string" ? searchParams.start_date : "";
  const currentEndDate =
    typeof searchParams.end_date === "string" ? searchParams.end_date : "";

  const query: { label: string; value: string }[] = [];
  if (currentTeacherType)
    query.push({ label: "teacher_type", value: currentTeacherType });
  if (currentDesignationId)
    query.push({ label: "designation_id", value: currentDesignationId });
  if (currentDepartmentId)
    query.push({ label: "department_id", value: currentDepartmentId });
  if (currentAdminPosition)
    query.push({ label: "administrative_position", value: currentAdminPosition });
  if (currentStartDate)
    query.push({ label: "start_date", value: currentStartDate });
  if (currentEndDate) query.push({ label: "end_date", value: currentEndDate });

  const [reportRes, designationsRes, departmentsRes] = await Promise.all([
    getTeacherAttendanceReport(query),
    getDesignations([]),
    getDepartments([{ label: "limit", value: "100" }]),
  ]);

  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({
      id: d.id,
      name: d.name,
    }),
  );
  const departments = (departmentsRes?.data ?? []).map(
    (d: { id: string; department_name: string }) => ({
      id: d.id,
      name: d.department_name,
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teacher Attendance Report"
        backHref="/dashboard/employees"
      />

      <TeacherAttendanceReportFilter
        designations={designations}
        departments={departments}
        currentTeacherType={currentTeacherType}
        currentDesignationId={currentDesignationId}
        currentDepartmentId={currentDepartmentId}
        currentAdminPosition={currentAdminPosition}
        currentStartDate={currentStartDate}
        currentEndDate={currentEndDate}
      />

      <TeacherAttendanceReportTable
        data={reportRes?.data ?? []}
        totalTeachers={reportRes?.meta?.totalTeachers ?? 0}
        totalRecords={reportRes?.meta?.totalRecords ?? 0}
        totalOvertimeHours={reportRes?.meta?.totalOvertimeHours ?? 0}
        totalOvertimeAmount={reportRes?.meta?.totalOvertimeAmount ?? 0}
      />
    </div>
  );
};

export default TeacherAttendanceReportPage;
