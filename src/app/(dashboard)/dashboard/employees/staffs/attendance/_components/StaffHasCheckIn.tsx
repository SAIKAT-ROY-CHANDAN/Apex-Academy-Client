import { isStaffCheckedIn } from "@/services/staffAttendance";
import CheckInToggle from "./CheckInToggle";

const StaffHasCheckIn = async ({ staffId }: { staffId: string }) => {
  const hasCheckIn = await isStaffCheckedIn(staffId);
  return (
    <CheckInToggle
      staffId={staffId}
      hasCheckIn={hasCheckIn?.data?.isCheckIn}
    />
  );
};

export default StaffHasCheckIn;
