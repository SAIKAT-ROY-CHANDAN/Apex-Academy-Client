
import StudentDueCard from "@/components/dashboard/StudentDueCard";
import { PageHeader } from "@/components/shared/page-header";

const StudentDashboard = () => {
  return (
    <div className="space-y-6">
      <PageHeader title="Overview" />
      <StudentDueCard />
    </div>
  );
};

export default StudentDashboard;