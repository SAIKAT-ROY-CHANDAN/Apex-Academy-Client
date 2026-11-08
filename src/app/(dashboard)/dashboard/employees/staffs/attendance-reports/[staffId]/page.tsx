import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";
import { getStaffAttendanceHistory } from "@/services/staffAttendance";
import StaffAttendanceHistory, {
  type StaffAttendanceHistoryData,
} from "../_components/StaffAttendanceHistory";

const StaffAttendanceDetailsPage = async (props: {
  params: Promise<{ staffId: string }>;
}) => {
  const { staffId } = await props.params;
  const res = await getStaffAttendanceHistory(staffId);

  if (!res?.success || !res?.data) {
    notFound();
  }

  const history = res.data as StaffAttendanceHistoryData;

  return (
    <div className="space-y-6">
      <PageHeader
        title={history.staff.full_name}
        backHref="/dashboard/employees/staffs/attendance-reports"
      />

      <StaffAttendanceHistory history={history} />
    </div>
  );
};

export default StaffAttendanceDetailsPage;