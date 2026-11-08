import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getStaffResignationById } from "@/services/staffResignation";
import StaffResignationDetails from "../_components/StaffResignationDetails";

const StaffResignationDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const res = await getStaffResignationById(id);

  if (!res?.success || !res?.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Resignation Details"
        backHref="/dashboard/employees/staffs/resignation-management"
      />
      <StaffResignationDetails resignation={res.data} />
    </div>
  );
};

export default StaffResignationDetailsPage;
