import { PageHeader } from "@/components/shared/page-header";
import { getStaffs } from "@/services/staff";
import type { TStaff } from "@/types/modules/staff/staff.type";
import StaffResignationForm from "../_components/StaffResignationForm";

const AddStaffResignation = async () => {
  const staffsRes = await getStaffs([{ label: "limit", value: "100" }]);

  const staffs = (staffsRes?.data ?? []).map((s: TStaff) => ({
    id: s.id,
    name: s.full_name,
    designation: s.designation?.name ?? null,
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Add Resignation"
        backHref="/dashboard/employees/staffs/resignation-management"
      />
      <StaffResignationForm staffs={staffs} />
    </div>
  );
};

export default AddStaffResignation;
