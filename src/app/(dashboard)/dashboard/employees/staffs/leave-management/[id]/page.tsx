import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getStaffLeaveById } from "@/services/staffLeave";
import StaffLeaveDetails from "../_components/StaffLeaveDetails";

const StaffLeaveDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const res = await getStaffLeaveById(id);

  if (!res?.success || !res?.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Details"
        backHref="/dashboard/employees/staffs/leave-management"
      />
      <StaffLeaveDetails leave={res.data} />
    </div>
  );
};

export default StaffLeaveDetailsPage;
