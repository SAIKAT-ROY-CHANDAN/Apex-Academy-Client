"use client";

import { CalendarClock, History, Loader2, MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getStudentAllocationHistory } from "@/services/hostelAllocation";
import type { HostelAllocationHistory, HostelStudentRecord } from "./types";

interface AllocationHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: HostelStudentRecord | null;
}

const statusMeta: Record<
  HostelAllocationHistory["status"],
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Current",
    className: "bg-green-100 text-green-700",
  },
  RELOCATED: {
    label: "Relocated",
    className: "bg-amber-100 text-amber-700",
  },
  CHECKED_OUT: {
    label: "Checked out",
    className: "bg-slate-100 text-slate-600",
  },
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AllocationHistoryModal({
  open,
  onOpenChange,
  student,
}: AllocationHistoryModalProps) {
  const [history, setHistory] = useState<HostelAllocationHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (next && student && loadedFor !== student.id) {
      setLoading(true);
      setHistory([]);
      (async () => {
        try {
          const response = await getStudentAllocationHistory(student.id);
          if (response?.success === false) {
            toast.error(
              response?.message ?? "Failed to load allocation history",
            );
            return;
          }
          setHistory((response?.data ?? []) as HostelAllocationHistory[]);
          setLoadedFor(student.id);
        } catch (error) {
          console.error("Failed to load allocation history", error);
          toast.error("Failed to load allocation history");
        } finally {
          setLoading(false);
        }
      })();
    } else if (!next) {
      setLoadedFor(null);
      setHistory([]);
    }
    onOpenChange(next);
  };

  const rows = useMemo(() => history, [history]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-h-[85vh] max-w-2xl overflow-x-hidden overflow-y-auto rounded-xl p-0 sm:w-full">
        <div className="relative p-4 sm:p-6">
          <DialogHeader className="space-y-1 pb-4 pr-8 text-left">
            <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-800 sm:text-2xl">
              <History className="h-5 w-5 text-primary" />
              Allocation History
            </DialogTitle>
            {student && (
              <DialogDescription className="text-sm text-slate-500">
                {student.name}
              </DialogDescription>
            )}
          </DialogHeader>

          {loading ? (
            <div className="flex min-h-40 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : rows.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center gap-2 text-center">
              <History className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">
                No hostel allocation history found.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((item) => {
                const building =
                  item.hostelRoom.hostelFloor.hostelConfiguration.building_name;
                const floor = item.hostelRoom.hostelFloor.hostel_floor_number;
                const room = item.hostelRoom.hostel_room_number;
                const meta = statusMeta[item.status];
                const location = [
                  building,
                  floor != null
                    ? `Floor-${String(floor).padStart(2, "0")}`
                    : null,
                  room ? `Room No.- ${room}` : null,
                  item.sit ? `Sit No.- ${item.sit}` : null,
                ]
                  .filter(Boolean)
                  .join(" | ");

                return (
                  <div
                    key={item.id}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2 text-sm font-semibold text-slate-800">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{location || "No seat specified"}</span>
                      </div>
                      <Badge className={meta.className}>{meta.label}</Badge>
                    </div>
                    <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 sm:flex-row sm:items-center sm:gap-4">
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        Allocated: {formatDate(item.allocated_at)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {item.released_at
                          ? `Released: ${formatDate(item.released_at)}`
                          : "Released: — (currently occupying)"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <DialogFooter className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto sm:min-w-40 sm:flex-1"
            >
              Close
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
