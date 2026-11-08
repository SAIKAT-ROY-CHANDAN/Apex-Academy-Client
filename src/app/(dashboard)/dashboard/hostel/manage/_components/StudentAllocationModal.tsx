"use client";

import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  createHostelAllocation,
  updateHostelAllocation,
} from "@/services/hostelAllocation";
import {
  getHostelConfigurationById,
  getHostelConfigurations,
  getHostelFloorById,
} from "@/services/hostelConfiguration";
import { searchStudents } from "@/services/student";
import type {
  HostelBuilding,
  HostelFloor,
  HostelRoom,
  HostelStudentRecord,
  StudentSearchByEmailResult,
} from "./types";
import { formatStudentSearchLabel } from "./types";

interface StudentAllocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingStudent?: HostelStudentRecord | null;
  allocatedStudents?: HostelStudentRecord[];
}

export default function StudentAllocationModal({
  open,
  onOpenChange,
  editingStudent,
  allocatedStudents = [],
}: StudentAllocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentSearchByEmailResult[]>([]);
  const [student, setStudent] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [filterApplied, setFilterApplied] = useState(false);

  const [buildingOptions, setBuildingOptions] = useState<HostelBuilding[]>([]);
  const [building, setBuilding] = useState("");

  const [floorOptions, setFloorOptions] = useState<HostelFloor[]>([]);
  const [floorId, setFloorId] = useState("");
  const [loadingFloors, setLoadingFloors] = useState(false);

  const [roomOptions, setRoomOptions] = useState<HostelRoom[]>([]);
  const [roomId, setRoomId] = useState("");
  const [loadingRooms, setLoadingRooms] = useState(false);

  const [seatOptions, setSeatOptions] = useState<string[]>([]);
  const [seat, setSeat] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const router = useRouter();

  const alreadyAssigned = useMemo(
    () =>
      student
        ? allocatedStudents.find((record) => record.id === student) ?? null
        : null,
    [student, allocatedStudents],
  );

  const handleReset = () => {
    setSearchQuery("");
    setStudents([]);
    setStudent("");
    setFilterApplied(false);
    setBuilding("");
    setFloorOptions([]);
    setFloorId("");
    setRoomOptions([]);
    setRoomId("");
    setSeatOptions([]);
    setSeat("");
  };

  const handleBuildingChange = (value: string) => {
    setBuilding(value);
    setFloorId("");
    setRoomId("");
  };

  const handleFloorChange = (value: string) => {
    setFloorId(value);
    setRoomId("");
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const fetchStudents = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter an email or registration/roll number");
      return;
    }

    setLoadingStudents(true);
    try {
      const response = await searchStudents(searchQuery.trim());
      if (response?.success === false) {
        toast.error(response?.message ?? "Failed to search students");
        return;
      }

      const results: StudentSearchByEmailResult[] = response?.data ?? [];
      setStudents(results);
      setStudent(results.length === 1 ? results[0].id : "");
      setFilterApplied(true);

      if (results.length === 0) {
        toast.error("No students found");
      }
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast.error("Failed to search students");
    } finally {
      setLoadingStudents(false);
    }
  };

  // Load buildings on open
  useEffect(() => {
    (async () => {
      try {
        const response = await getHostelConfigurations([]);
        const results: HostelBuilding[] = response?.data ?? [];
        setBuildingOptions(results);
      } catch (error) {
        console.error("Failed to fetch buildings", error);
      }
    })();
  }, []);

  // Prefill the current allocation when editing, reset when creating
  useEffect(() => {
    if (!open) return;

    if (editingStudent) {
      setSearchQuery("");
      setStudents([]);
      setStudent(editingStudent.id);
      setFilterApplied(true);
      setBuilding(editingStudent.building_id ?? "");
      setFloorId(editingStudent.floor_id ?? "");
      setRoomId(editingStudent.room_id ?? "");
      setSeat(editingStudent.sit ?? "");
    } else {
      setSearchQuery("");
      setStudents([]);
      setStudent("");
      setFilterApplied(false);
      setBuilding("");
      setFloorOptions([]);
      setFloorId("");
      setRoomOptions([]);
      setRoomId("");
      setSeatOptions([]);
      setSeat("");
    }
  }, [open, editingStudent]);

  // Load floors for the selected building
  useEffect(() => {
    if (!building) {
      setFloorOptions([]);
      setFloorId("");
      return;
    }

    let cancelled = false;
    setLoadingFloors(true);
    (async () => {
      try {
        const response = await getHostelConfigurationById(building);
        if (cancelled) return;
        const config: HostelBuilding = response?.data ?? response;
        const floors = config.hostelFloors ?? [];
        setFloorOptions(floors);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch floors", error);
        setFloorOptions([]);
        setFloorId("");
      } finally {
        if (!cancelled) setLoadingFloors(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [building]);

  // Load rooms for the selected floor
  useEffect(() => {
    if (!floorId) {
      setRoomOptions([]);
      setRoomId("");
      return;
    }

    let cancelled = false;
    setLoadingRooms(true);
    (async () => {
      try {
        const response = await getHostelFloorById(floorId);
        if (cancelled) return;
        const floor: HostelFloor = response?.data ?? response;
        const rooms = floor.hostelRooms ?? [];
        setRoomOptions(rooms);
      } catch (error) {
        if (cancelled) return;
        console.error("Failed to fetch rooms for floor", error);
        setRoomOptions([]);
        setRoomId("");
      } finally {
        if (!cancelled) setLoadingRooms(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [floorId]);

  // Derive selectable seats from the selected room, excluding occupied ones
  useEffect(() => {
    if (!roomId) {
      setSeatOptions([]);
      setSeat("");
      return;
    }

    const selected = roomOptions.find((room) => room.id === roomId);
    const seatCount = selected?.available_sits ?? 0;

    const occupied = new Set(
      allocatedStudents
        .filter(
          (s) =>
            s.room_id === roomId &&
            !!s.sit &&
            (!editingStudent ||
              s.allocation_id !== editingStudent.allocation_id),
        )
        .map((s) => s.sit as string),
    );

    const options =
      seatCount > 0
        ? Array.from({ length: seatCount }, (_, index) =>
            String(index + 1).padStart(2, "0"),
          )
        : [];

    const availableSeats = options.filter((option) => !occupied.has(option));

    setSeatOptions(availableSeats);
    setSeat((current) => {
      if (current && availableSeats.includes(current)) return current;
      const assigned = editingStudent?.sit;
      if (assigned && availableSeats.includes(assigned)) return assigned;
      return "";
    });
  }, [roomId, roomOptions, allocatedStudents, editingStudent]);

  const handleNext = async () => {
    if (!student) {
      toast.error("Please select a student");
      return;
    }
    if (!roomId) {
      toast.error("Please select a room to allocate");
      return;
    }

    const payload: Record<string, unknown> = {
      hostel_room_id: roomId,
      allocated_at: new Date().toISOString(),
    };
    if (seat) payload.sit = seat;

    setSubmitting(true);
    try {
      const isUpdate = editingStudent?.allocation_id
        ? updateHostelAllocation(editingStudent.allocation_id, payload)
        : alreadyAssigned?.allocation_id
          ? updateHostelAllocation(alreadyAssigned.allocation_id, payload)
          : null;

      const result = isUpdate
        ? await isUpdate
        : await createHostelAllocation({ ...payload, student_id: student });

      if (!result?.success) {
        console.error("Allocation failed", result);
        toast.error(
          result?.message ??
            result?.errorSources?.[0]?.message ??
            "Allocation failed",
        );
        return;
      }

      toast.success(
        isUpdate
          ? "Allocation updated successfully"
          : "Student allocated successfully",
      );
      router.refresh();
      handleReset();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save allocation", error);
      toast.error("Failed to save allocation");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-2rem)] max-h-[90vh] max-w-2xl overflow-x-hidden overflow-y-auto rounded-xl p-0 sm:w-full">
        <div className="relative p-4 sm:p-6">
          <DialogHeader className="space-y-1 pb-4 pr-8 text-left">
            <DialogTitle className="text-xl font-bold text-slate-800 sm:text-2xl">
              {editingStudent ? "Edit Allocation" : "Student Allocation"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 pt-2">
            {!editingStudent && (
              <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label className="text-sm font-semibold text-slate-700">
                    Email / Reg No / Roll No
                  </Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="text"
                      placeholder="Search by email, reg no, or roll no..."
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      className="h-11 w-full min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                    <Button
                      onClick={fetchStudents}
                      disabled={loadingStudents}
                      className={cn(
                        "h-11 shrink-0 rounded-lg px-6 text-sm font-semibold",
                        loadingStudents
                          ? "bg-slate-200 text-slate-600"
                          : "bg-primary text-primary-foreground hover:bg-primary/80",
                      )}
                    >
                      {loadingStudents ? "Searching..." : "Search"}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {editingStudent ? (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Student
                </Label>
                <div className="flex h-11 w-full items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800">
                  {editingStudent.name}
                  {editingStudent.sit
                    ? ` • Sit No.- ${editingStudent.sit}`
                    : ""}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Student
                </Label>
                <Select
                  value={student}
                  onValueChange={(value) => setStudent(value ?? "")}
                  items={Object.fromEntries(
                    students.map((item) => [
                      item.id,
                      formatStudentSearchLabel(item),
                    ]),
                  )}
                >
                  <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30">
                    <SelectValue
                      placeholder={
                        filterApplied
                          ? "Select Student"
                          : "Search to load students"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {students.length === 0 ? (
                      <SelectItem value="" key="empty">
                        No students
                      </SelectItem>
                    ) : (
                      students.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {formatStudentSearchLabel(item)}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>

                {alreadyAssigned && (
                  <div className="flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800">
                    <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                    <p className="leading-relaxed">
                      <span className="font-semibold">
                        {alreadyAssigned.name}
                      </span>{" "}
                      is already assigned to{" "}
                      <span className="font-medium">
                        {[
                          alreadyAssigned.building_name,
                          alreadyAssigned.hostel_room_number,
                          alreadyAssigned.sit
                            ? `Sit No.- ${alreadyAssigned.sit}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(" | ") || "a seat"}
                      </span>
                      . Only update them to the new seat.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 sm:gap-x-6">
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Building
                </Label>
                <Select
                  value={building}
                  onValueChange={(value) => handleBuildingChange(value ?? "")}
                  items={Object.fromEntries(
                    buildingOptions.map((item) => [
                      item.id,
                      item.building_name,
                    ]),
                  )}
                >
                  <SelectTrigger className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/30">
                    <SelectValue placeholder="Select building" />
                  </SelectTrigger>
                  <SelectContent>
                    {buildingOptions.length === 0 ? (
                      <SelectItem value="" key="empty-building">
                        No buildings
                      </SelectItem>
                    ) : (
                      buildingOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.building_name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Floor
                </Label>
                <Select
                  value={floorId}
                  onValueChange={(value) => handleFloorChange(value ?? "")}
                  items={Object.fromEntries(
                    floorOptions.map((item) => [
                      item.id,
                      `Floor ${item.floor_number}`,
                    ]),
                  )}
                >
                <SelectTrigger
                  disabled={!building || loadingFloors}
                  className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/30"
                  >
                    <SelectValue
                      placeholder={
                        !building
                          ? "Select building first"
                          : loadingFloors
                            ? "Loading..."
                            : "Floor"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {floorOptions.length === 0 ? (
                      <SelectItem value="" key="empty-floor">
                        No floors
                      </SelectItem>
                    ) : (
                      floorOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          Floor {item.floor_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Room
                </Label>
                <Select
                  value={roomId}
                  onValueChange={(value) => setRoomId(value ?? "")}
                  items={Object.fromEntries(
                    roomOptions.map((item) => [
                      item.id,
                      item.hostel_room_number,
                    ]),
                  )}
                >
                  <SelectTrigger
                    disabled={loadingRooms || !floorId}
                    className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/30"
                  >
                    <SelectValue
                      placeholder={
                        !floorId
                          ? "Select floor first"
                          : loadingRooms
                            ? "Loading..."
                            : "Room"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {roomOptions.length === 0 ? (
                      <SelectItem value="" key="empty-room">
                        No rooms
                      </SelectItem>
                    ) : (
                      roomOptions.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.hostel_room_number}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-slate-700">
                  Sit
                </Label>
                <Select
                  value={seat}
                  onValueChange={(value) => setSeat(value ?? "")}
                >
                  <SelectTrigger
                    disabled={!roomId}
                    className="h-11 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus:ring-2 focus:ring-primary/30"
                  >
                    <SelectValue
                      placeholder={!roomId ? "Select room first" : "Sit"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {seatOptions.length === 0 ? (
                      <SelectItem value="" key="empty-seat">
                        No seats available
                      </SelectItem>
                    ) : (
                      seatOptions.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white text-base font-semibold text-slate-700 hover:bg-slate-50 sm:w-auto sm:min-w-40 sm:flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={submitting}
              className="h-12 w-full rounded-xl bg-primary text-base font-semibold text-primary-foreground shadow-lg hover:bg-primary/80 sm:w-auto sm:min-w-40 sm:flex-1"
            >
              {submitting ? "Saving..." : editingStudent ? "Update" : "Next"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
