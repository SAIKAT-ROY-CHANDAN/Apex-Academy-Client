import HostelDueCard from "@/components/dashboard/studentDashboard/HostelDueCard";
import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { getMyHostelDue } from "@/services/hostelFeeCollection";

const HostelPaymentPage = async () => {
  let hostelDue = 0;
  try {
    const hostelResponse = await getMyHostelDue();
    hostelDue = Number(hostelResponse?.data?.totalDue) || 0;
  } catch {
    hostelDue = 0;
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Hostel Payment" />

      {hostelDue > 0 ? (
        <Card className="grid md:grid-cols-4 gap-4 px-4 justify-center items-center max-w-3xl">
          <HostelDueCard totalDue={hostelDue} />
        </Card>
      ) : (
        <Card className="px-4 py-10 flex flex-col items-center justify-center text-center max-w-3xl">
          <p className="text-sm font-medium text-slate-500">
            No pending hostel dues
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Your hostel account is all settled for now.
          </p>
        </Card>
      )}
    </div>
  );
};

export default HostelPaymentPage;
