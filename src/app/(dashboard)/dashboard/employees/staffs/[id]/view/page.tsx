import { PageHeader } from "@/components/shared/page-header";
import { getStaffById } from "@/services/staff";
import { notFound } from "next/navigation";
import StaffProfileView from "./_components/StaffProfileView";

const StaffViewPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const res = await getStaffById(id);

  if (!res?.success || !res?.data) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={res.data.full_name}
        backHref="/dashboard/employees/staffs"
      />
      <StaffProfileView staff={res.data} />
    </div>
  );
};

export default StaffViewPage;