import { PageHeader } from "@/components/shared/page-header";
import { getStaffs } from "@/services/staff";
import { type TStaff } from "@/types/modules/staff/staff.type";
import StaffLeaveForm from "../_components/StaffLeaveForm";

const AddStaffLeave = async () => {
  const staffsRes = await getStaffs([{ label: "limit", value: "100" }]);

  const staffs = (staffsRes?.data ?? []).map((s: TStaff) => ({
    id: s.id,
    name: s.full_name,
    designation: s.designation?.name ?? null,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Leave"
        backHref="/dashboard/employees/staffs/leave-management"
      />
      <StaffLeaveForm staffs={staffs} />
    </div>
  );
};

export default AddStaffLeave;
