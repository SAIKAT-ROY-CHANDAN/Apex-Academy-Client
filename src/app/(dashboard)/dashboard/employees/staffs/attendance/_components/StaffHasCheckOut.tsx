import {
  isStaffCheckedIn,
  isStaffCheckedOut,
} from "@/services/staffAttendance";
import CheckOutToggle from "./CheckOutToggle";

const StaffHasCheckOut = async ({ staffId }: { staffId: string }) => {
  const hasCheckIn = await isStaffCheckedIn(staffId);
  const hasCheckOut = await isStaffCheckedOut(staffId);
  return (
    <CheckOutToggle
      hasCheckIn={hasCheckIn?.data}
      hasCheckOut={hasCheckOut?.data}
    />
  );
};

export default StaffHasCheckOut;
