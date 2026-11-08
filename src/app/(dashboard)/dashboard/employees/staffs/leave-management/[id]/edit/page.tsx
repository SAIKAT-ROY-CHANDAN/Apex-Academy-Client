import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getStaffs } from "@/services/staff";
import { getStaffLeaveById } from "@/services/staffLeave";
import { type TStaff } from "@/types/modules/staff/staff.type";
import StaffLeaveForm from "../../_components/StaffLeaveForm";

const EditStaffLeavePage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;

  const [leaveRes, staffsRes] = await Promise.all([
    getStaffLeaveById(id),
    getStaffs([{ label: "limit", value: "100" }]),
  ]);

  if (!leaveRes?.success || !leaveRes?.data) {
    notFound();
  }

  const staffs = (staffsRes?.data ?? []).map(
    (s: TStaff) => ({
      id: s.id,
      name: s.full_name,
      designation: s.designation?.name ?? null,
    }),
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Leave"
        backHref={`/dashboard/employees/staffs/leave-management/${id}`}
      />
      <StaffLeaveForm staffs={staffs} initialData={leaveRes.data} isEdit />
    </div>
  );
};

export default EditStaffLeavePage;
