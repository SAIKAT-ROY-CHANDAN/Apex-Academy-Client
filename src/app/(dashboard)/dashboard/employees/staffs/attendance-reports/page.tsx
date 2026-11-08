import { PageHeader } from "@/components/shared/page-header";
import { getDesignations } from "@/services/designation";
import { getStaffAttendanceReport } from "@/services/staffAttendance";
import StaffAttendanceReportFilter from "./_components/StaffAttendanceReportFilter";
import StaffAttendanceReportTable from "./_components/StaffAttendanceReportTable";

const StaffAttendanceReportPage = async (props: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const searchParams = await props.searchParams;

  const currentStaffType =
    typeof searchParams.staff_type === "string" ? searchParams.staff_type : "";
  const currentDesignationId =
    typeof searchParams.designation_id === "string"
      ? searchParams.designation_id
      : "";
  const currentStartDate =
    typeof searchParams.start_date === "string" ? searchParams.start_date : "";
  const currentEndDate =
    typeof searchParams.end_date === "string" ? searchParams.end_date : "";

  const query: { label: string; value: string }[] = [];
  if (currentStaffType)
    query.push({ label: "staff_type", value: currentStaffType });
  if (currentDesignationId)
    query.push({ label: "designation_id", value: currentDesignationId });
  if (currentStartDate)
    query.push({ label: "start_date", value: currentStartDate });
  if (currentEndDate) query.push({ label: "end_date", value: currentEndDate });

  const [reportRes, designationsRes] = await Promise.all([
    getStaffAttendanceReport(query),
    getDesignations([]),
  ]);

  const designations = (designationsRes?.data ?? []).map(
    (d: { id: string; name: string }) => ({
      id: d.id,
      name: d.name,
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Staff Attendance Report"
        backHref="/dashboard/employees"
      />

      <StaffAttendanceReportFilter
        designations={designations}
        currentStaffType={currentStaffType}
        currentDesignationId={currentDesignationId}
        currentStartDate={currentStartDate}
        currentEndDate={currentEndDate}
      />

      <StaffAttendanceReportTable
        data={reportRes?.data ?? []}
        totalStaffs={reportRes?.meta?.totalStaffs ?? 0}
        totalRecords={reportRes?.meta?.totalRecords ?? 0}
        totalOvertimeHours={reportRes?.meta?.totalOvertimeHours ?? 0}
        totalOvertimeAmount={reportRes?.meta?.totalOvertimeAmount ?? 0}
      />
    </div>
  );
};

export default StaffAttendanceReportPage;
