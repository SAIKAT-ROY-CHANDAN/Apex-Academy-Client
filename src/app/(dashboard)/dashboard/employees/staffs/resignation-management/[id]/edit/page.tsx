import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getStaffs } from "@/services/staff";
import { getStaffResignationById } from "@/services/staffResignation";
import type { TStaff } from "@/types/modules/staff/staff.type";
import StaffResignationForm from "../../_components/StaffResignationForm";

const EditStaffResignationPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;

  const [resignationRes, staffsRes] = await Promise.all([
    getStaffResignationById(id),
    getStaffs([{ label: "limit", value: "100" }]),
  ]);

  if (!resignationRes?.success || !resignationRes?.data) {
    notFound();
  }

  const staffs = (staffsRes?.data ?? []).map((s: TStaff) => ({
    id: s.id,
    name: s.full_name,
    designation: s.designation?.name ?? null,
  }));

  // Ensure the currently selected staff is present in options even if
  // it was excluded by the limit/filter above.
  const currentStaffId =
    resignationRes.data?.staff_id ?? resignationRes.data?.staff?.id;
  const currentStaffName = resignationRes.data?.staff?.full_name ?? undefined;
  const currentStaffDesignation =
    resignationRes.data?.staff?.designation?.name ?? null;
  if (
    currentStaffId &&
    !staffs.some((s: { id: string }) => s.id === currentStaffId)
  ) {
    staffs.unshift({
      id: currentStaffId,
      name: currentStaffName ?? "Current Staff",
      designation: currentStaffDesignation,
    });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Resignation"
        backHref={`/dashboard/employees/staffs/resignation-management/${id}`}
      />
      <StaffResignationForm
        staffs={staffs}
        initialData={resignationRes.data}
        isEdit
      />
    </div>
  );
};

export default EditStaffResignationPage;
