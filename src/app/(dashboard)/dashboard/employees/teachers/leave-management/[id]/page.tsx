import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { getTeacherLeaveRequestById } from "@/services/teacherLeave";
import { TLeaveRequest } from "@/types/modules/teacher/leave-request.type";
import LeaveRequestDetails from "./_components/LeaveRequestDetails";

type DetailResponse = {
  success?: boolean;
  data?: TLeaveRequest | null;
};

const LeaveRequestDetailsPage = async (props: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await props.params;
  const response = (await getTeacherLeaveRequestById(
    id,
  )) as DetailResponse;
  const request = response?.data;

  if (!request) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leave Request Details"
        backHref="/dashboard/employees/teachers/leave-management"
      />
      <LeaveRequestDetails request={request} />
    </div>
  );
};

export default LeaveRequestDetailsPage;
