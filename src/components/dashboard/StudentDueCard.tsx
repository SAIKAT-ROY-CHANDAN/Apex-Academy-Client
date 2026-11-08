import { getStudentDueFee } from "@/services/student";
import FeeDueCards from "./studentDashboard/FeeDueCards";

const StudentDueCard = async () => {
  const response = await getStudentDueFee();

  if (!response?.success || !response?.data) {
    return (
      <div>
        <FeeDueCards API_RESPONSE={{ dueItems: [], unpaid: [] }} />
      </div>
    );
  }

  return (
    <div>
      <FeeDueCards API_RESPONSE={response?.data} />
    </div>
  );
};

export default StudentDueCard;
