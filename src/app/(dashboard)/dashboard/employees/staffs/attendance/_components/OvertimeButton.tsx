"use client";

import { CheckCircle2, Clock, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { endStaffOvertime, startStaffOvertime } from "@/services/staffOvertime";

export type TOvertimeStatus = {
  hasOvertime: boolean;
  isRunning: boolean;
  overtimeId?: string;
  startTime?: string;
  endTime?: string | null;
  hours: number;
};

type OvertimeButtonProps = {
  staffId: string;
  hasCheckOut: boolean;
  overtime?: TOvertimeStatus;
};

const OvertimeButton = ({
  staffId,
  hasCheckOut,
  overtime,
}: OvertimeButtonProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const isRunning = overtime?.isRunning ?? false;
  const isDone = (overtime?.hasOvertime ?? false) && !isRunning;

  const handleStart = async () => {
    startTransition(async () => {
      const res = await startStaffOvertime({
        staff_id: staffId,
        start_time: new Date().toISOString(),
      });

      if (res.success) {
        toast.success(res.message || "Overtime started successfully");
        router.refresh();
      } else {
        toast.error(res.message || "Failed to start overtime");
      }
    });
  };

  const handleEnd = async () => {
    startTransition(async () => {
      const res = await endStaffOvertime({
        staff_id: staffId,
        overtime_id: overtime?.overtimeId,
        end_time: new Date().toISOString(),
      });

      if (res.success) {
        const hours = res.data?.overtime_hours;
        toast.success(
          hours !== undefined
            ? `Overtime ended (${hours} hr)`
            : res.message || "Overtime ended successfully",
        );
        router.refresh();
      } else {
        toast.error(res.message || "Failed to end overtime");
      }
    });
  };

  // Completed state — one overtime per day, no further action
  if (isDone) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled
              className="gap-2 rounded-md transition-colors"
            >
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              <span className="hidden md:inline">
                {overtime?.hours ? `${overtime.hours} hr` : "Done"}
              </span>
            </Button>
          }
        />
        <TooltipContent>
          <p>
            Overtime completed
            {overtime?.hours ? ` (${overtime.hours} hr)` : ""}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Running state — show End button
  if (isRunning) {
    return (
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              disabled={isPending}
              className="gap-2 rounded-md border-amber-500/50 transition-colors hover:bg-amber-500/10"
              onClick={handleEnd}
            >
              <Square className="h-3 w-3 text-amber-600" />
              <span className="hidden md:inline">
                {isPending ? "Ending..." : "End Overtime"}
              </span>
            </Button>
          }
        />
        <TooltipContent>
          <p>
            Started{" "}
            {overtime?.startTime
              ? new Date(overtime.startTime).toLocaleTimeString()
              : ""}
            {" — click to end and calculate hours"}
          </p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Idle state — show Start button (checkout still required)
  const isDisabled = isPending || !hasCheckOut;

  const button = (
    <Button
      variant="outline"
      size="sm"
      disabled={isDisabled}
      className="gap-2 rounded-md transition-colors hover:bg-primary/5"
      onClick={handleStart}
    >
      <Clock className="h-3 w-3" />
      <span className="hidden md:inline">
        {isPending ? "Starting..." : "Start Overtime"}
      </span>
    </Button>
  );

  if (!hasCheckOut) {
    return (
      <Tooltip>
        <TooltipTrigger render={button} />
        <TooltipContent>
          <p>Check out required before starting overtime</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export default OvertimeButton;
