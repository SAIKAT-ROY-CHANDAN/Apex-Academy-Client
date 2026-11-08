import { PageHeader } from "@/components/shared/page-header";
import { getStaffById } from "@/services/staff";
import { getDesignations } from "@/services/designation";
import { notFound } from "next/navigation";
import EditStaffForm from "./_components/EditStaffForm";

const EditStaffPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;

  const [staffRes, designationsRes] =
    await Promise.all([
      getStaffById(id),
      getDesignations([]),
    ]);

  if (!staffRes?.success || !staffRes?.data) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Edit: ${staffRes.data.full_name}`}
        backHref="/dashboard/employees/staffs"
      />
      <EditStaffForm
        staff={staffRes.data}
        designations={designationsRes?.data || []}
      />
    </div>
  );
};

export default EditStaffPage;