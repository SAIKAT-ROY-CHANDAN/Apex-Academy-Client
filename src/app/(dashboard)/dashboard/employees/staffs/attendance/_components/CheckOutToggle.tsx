"use client";

import { useEffect, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { checkOutStaff } from "@/services/staffAttendance";
import { toast } from "sonner";

type CheckOutToggleProps = {
  attendanceId?: string;
  hasCheckIn?: boolean;
  hasCheckOut?: boolean;
};

const CheckOutToggle = ({
  attendanceId,
  hasCheckIn = false,
  hasCheckOut = false,
}: CheckOutToggleProps) => {
  const [checkedOut, setCheckedOut] = useState(hasCheckOut);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setCheckedOut(hasCheckOut);
  }, [hasCheckOut]);

  const handleCheckOut = (checked: boolean) => {
    if (!checked || checkedOut || isPending) return;

    if (!hasCheckIn || !attendanceId) {
      toast.warning("Staff hasn't checked in yet");
      return;
    }

    startTransition(async () => {
      setCheckedOut(true); // optimistic

      const res = await checkOutStaff({
        id: attendanceId,
        check_out_time: new Date().toISOString(),
        attendance_status: "PRESENT",
      });

      if (res?.success) {
        toast.success(res.message || "Check-out recorded successfully");
      } else {
        setCheckedOut(false); // rollback
        toast.error(res?.message || "Failed to record check-out");
      }
    });
  };

  return (
    <div className="flex justify-center">
      <Switch
        className="cursor-pointer"
        size="sm"
        checked={checkedOut}
        disabled={!hasCheckIn || checkedOut || isPending}
        onCheckedChange={handleCheckOut}
      />
    </div>
  );
};

export default CheckOutToggle;
