"use client";

import { useEffect, useState, useTransition } from "react";
import { Switch } from "@/components/ui/switch";
import { checkInTeacher } from "@/services/teacherAttendance";
import { toast } from "sonner";

type CheckInToggleProps = {
  teacherId: string;
  hasCheckIn?: boolean;
};

const CheckInToggle = ({ teacherId, hasCheckIn = false }: CheckInToggleProps) => {
  const [checkedIn, setCheckedIn] = useState(hasCheckIn);
  const [isPending, startTransition] = useTransition();

  // keep in sync when the server re-sends fresh status (e.g. after revalidatePath)
  useEffect(() => {
    setCheckedIn(hasCheckIn);
  }, [hasCheckIn]);

  const handleCheckIn = () => {
    if (checkedIn || isPending) return; // guards against re-firing once already checked in

    startTransition(async () => {
      setCheckedIn(true); // optimistic

      const payload = {
        teacher_id: teacherId,
        check_in_time: new Date().toISOString(),
        attendance_status: "PRESENT",
      };

      const res = await checkInTeacher(payload);

      if (res?.success) {
        toast.success(res.message || "Check-in recorded successfully");
      } else {
        setCheckedIn(false); // rollback on failure (e.g. 409 already checked in)
        toast.error(res?.message || "Failed to record check-in");
      }
    });
  };

  return (
    <div className="flex justify-center">
      <Switch
        className="cursor-pointer"
        size="sm"
        checked={checkedIn}
        disabled={checkedIn || isPending}
        onCheckedChange={handleCheckIn}
      />
    </div>
  );
};

export default CheckInToggle;