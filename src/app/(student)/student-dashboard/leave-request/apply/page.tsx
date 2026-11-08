import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import ApplyStudentLeaveForm from "../_components/ApplyStudentLeaveForm";

const ApplyLeavePage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Apply Leave Request</h1>
          <p className="text-xs text-muted-foreground mt-1">Fill the form below to submit a new leave request</p>
        </div>
        <Link
          href="/student-dashboard/leave-request"
          className="flex items-center gap-2 py-2 px-6 border border-[#C0D7FA] bg-[#F0F6FF] text-[#005CE8] rounded-full text-xs font-semibold hover:bg-[#E0EDFF] transition-colors"
        >
          <FaArrowLeft />
          Back
        </Link>
      </div>
      <ApplyStudentLeaveForm />
    </div>
  );
};

export default ApplyLeavePage;
