"use client";

import {
  ChevronLeft,
  ChevronRight,
  Edit,
  History,
  LogOut,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  checkoutHostelAllocation,
  deleteHostelAllocation,
} from "@/services/hostelAllocation";
import AllocationHistoryModal from "./AllocationHistoryModal";
import HostelFilters from "./HostelFilters";
import StudentAllocationModal from "./StudentAllocationModal";
import type { HostelBuilding, HostelStudentRecord } from "./types";

const PAGE_SIZE = 10;

type DisplayRow = HostelStudentRecord & {
  sl: string;
  fullName: string;
  allocated: string;
};

type PaginationButton = {
  key: string;
  label: number | "...";
};

type ManageHostelClientProps = {
  students: HostelStudentRecord[];
  buildings: HostelBuilding[];
};

const pad = (value: number) => (value < 10 ? `0${value}` : `${value}`);

const initials = (student: HostelStudentRecord) => {
  const parts = student.name?.trim().split(/\s+/).filter(Boolean) ?? [];
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST"
  );
};

const buildSearchText = (student: HostelStudentRecord) =>
  [
    student.name,
    student.class_name,
    student.department_name,
    student.batch_name,
    student.year_name,
    student.section_name,
  ]
    .join(" ")
    .toLowerCase();

const buildDeleteDescription = (student: HostelStudentRecord) => {
  const details = [
    student.building_name,
    student.floor_number != null
      ? `Floor-${String(student.floor_number).padStart(2, "0")}`
      : null,
    student.hostel_room_number
      ? `Room No.- ${student.hostel_room_number}`
      : null,
    student.sit ? `Sit No.- ${student.sit}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return details
    ? `Are you sure you want to remove "${student.name}"'s allocation (${details})? This action permanently deletes the record.`
    : "Are you sure you want to remove this allocation? This action permanently deletes the record.";
};

const buildCheckoutDescription = (student: HostelStudentRecord) => {
  const details = [
    student.building_name,
    student.floor_number != null
      ? `Floor-${String(student.floor_number).padStart(2, "0")}`
      : null,
    student.hostel_room_number
      ? `Room No.- ${student.hostel_room_number}`
      : null,
    student.sit ? `Sit No.- ${student.sit}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return details
    ? `Check out "${student.name}" from ${details}? The seat will be freed and their stay will be kept in history.`
    : "Are you sure you want to check out this student? The seat will be freed and the stay kept in history.";
};

export default function ManageHostelClient({
  students,
  buildings,
}: ManageHostelClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] =
    useState<HostelStudentRecord | null>(null);
  const [allocationToDelete, setAllocationToDelete] =
    useState<HostelStudentRecord | null>(null);
  const [allocationToCheckout, setAllocationToCheckout] =
    useState<HostelStudentRecord | null>(null);
  const [historyStudent, setHistoryStudent] =
    useState<HostelStudentRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [buildingFilter, setBuildingFilter] = useState("");
  const [floorFilter, setFloorFilter] = useState("");
  const [roomFilter, setRoomFilter] = useState("");

  const router = useRouter();

  const selectedBuilding = useMemo(
    () => buildings.find((building) => building.id === buildingFilter),
    [buildings, buildingFilter],
  );

  const floorOptions = selectedBuilding?.hostelFloors ?? [];

  const selectedFloor = useMemo(
    () => floorOptions.find((floor) => floor.id === floorFilter),
    [floorOptions, floorFilter],
  );

  const roomOptions = selectedFloor?.hostelRooms ?? [];

  const handleBuildingChange = (value: string) => {
    setBuildingFilter(value);
    setFloorFilter("");
    setRoomFilter("");
  };

  const handleFloorChange = (value: string) => {
    setFloorFilter(value);
    setRoomFilter("");
  };

  const handleClearBuildingFilter = () => {
    setBuildingFilter("");
    setFloorFilter("");
    setRoomFilter("");
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (student: HostelStudentRecord) => {
    setEditingStudent(student);
    setModalOpen(true);
  };

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setEditingStudent(null);
      router.refresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!allocationToDelete) return;
    if (!allocationToDelete.allocation_id) {
      toast.error("No allocation found for this student");
      setAllocationToDelete(null);
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteHostelAllocation(
        allocationToDelete.allocation_id,
      );
      if (!result?.success) {
        toast.error(
          result?.message ??
            result?.errorSources?.[0]?.message ??
            "Failed to remove allocation",
        );
        return;
      }
      toast.success("Allocation removed successfully");
      setAllocationToDelete(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to remove allocation", error);
      toast.error("Failed to remove allocation");
    } finally {
      setDeleting(false);
    }
  };

  const handleConfirmCheckout = async () => {
    if (!allocationToCheckout) return;
    if (!allocationToCheckout.allocation_id) {
      toast.error("No allocation found for this student");
      setAllocationToCheckout(null);
      return;
    }

    setCheckingOut(true);
    try {
      const result = await checkoutHostelAllocation(
        allocationToCheckout.allocation_id,
      );
      if (!result?.success) {
        toast.error(
          result?.message ??
            result?.errorSources?.[0]?.message ??
            "Failed to check out student",
        );
        return;
      }
      toast.success("Student checked out successfully");
      setAllocationToCheckout(null);
      router.refresh();
    } catch (error) {
      console.error("Failed to check out student", error);
      toast.error("Failed to check out student");
    } finally {
      setCheckingOut(false);
    }
  };

  const filteredStudents = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return students.filter((student) => {
      if (buildingFilter && student.building_id !== buildingFilter) {
        return false;
      }
      if (floorFilter && student.floor_id !== floorFilter) {
        return false;
      }
      if (roomFilter && student.room_id !== roomFilter) {
        return false;
      }
      if (query && !buildSearchText(student).includes(query)) {
        return false;
      }
      return true;
    });
  }, [searchQuery, students, buildingFilter, floorFilter, roomFilter]);

  const displayRows = useMemo<DisplayRow[]>(
    () =>
      filteredStudents.map((student, index) => ({
        ...student,
        sl: pad(index + 1),
        fullName: student.name,
        allocated: [
          student.building_name,
          student.floor_number != null
            ? `Floor-${String(student.floor_number).padStart(2, "0")}`
            : null,
          student.hostel_room_number
            ? `Room No.- ${student.hostel_room_number}`
            : null,
          student.sit ? `Sit No.- ${student.sit}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      })),
    [filteredStudents],
  );

  const totalPages = Math.max(1, Math.ceil(displayRows.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const visibleRows = useMemo(
    () =>
      displayRows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [currentPage, displayRows],
  );

  const paginationButtons = useMemo<PaginationButton[]>(() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => ({
        key: `page-${index + 1}`,
        label: index + 1,
      }));
    }

    const candidates = new Set<number>([
      1,
      totalPages,
      currentPage - 1,
      currentPage,
      currentPage + 1,
    ]);

    return Array.from(candidates)
      .filter((page) => page > 0 && page <= totalPages)
      .sort((left, right) => left - right)
      .reduce<PaginationButton[]>((pages, page, index, array) => {
        if (index > 0 && page - array[index - 1] > 1) {
          pages.push({
            key: `ellipsis-${array[index - 1]}-${page}`,
            label: "...",
          });
        }
        pages.push({ key: `page-${page}`, label: page });
        return pages;
      }, []);
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Hostel"
        backHref="/dashboard/hostel"
        components={
          <>
            <StudentAllocationModal
              open={modalOpen}
              onOpenChange={handleModalOpenChange}
              editingStudent={editingStudent}
              allocatedStudents={students}
            />
            <AllocationHistoryModal
              open={!!historyStudent}
              onOpenChange={(open) => {
                if (!open) setHistoryStudent(null);
              }}
              student={historyStudent}
            />
            <button
              type="button"
              onClick={handleOpenCreate}
              className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
              Allocate Student
              <Plus className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </>
        }
      />

      <div className="space-y-4">
        <HostelFilters
          buildingValue={buildingFilter}
          floorValue={floorFilter}
          roomValue={roomFilter}
          buildingOptions={buildings}
          floorOptions={floorOptions}
          roomOptions={roomOptions}
          onBuildingChange={handleBuildingChange}
          onFloorChange={handleFloorChange}
          onRoomChange={setRoomFilter}
          onClear={handleClearBuildingFilter}
          onConfirm={() => setCurrentPage(1)}
        />

        <Card className="overflow-hidden border-slate-200/70 shadow-sm">
          <CardContent className="p-4 md:p-5">
            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="relative w-full sm:max-w-sm">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Search here..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-10 rounded-lg border border-slate-200 bg-white pl-9 pr-4 text-xs shadow-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>
            </div>
          </CardContent>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/70 hover:bg-slate-50/70">
                  <TableHead className="h-12 w-20 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    SL No.
                  </TableHead>
                  <TableHead className="h-12 min-w-45 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Name
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Class
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Group/Department
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Batch
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Year
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Section
                  </TableHead>
                  <TableHead className="h-12 min-w-75 px-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Allocated
                  </TableHead>
                  <TableHead className="h-12 w-44 px-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group transition-colors hover:bg-slate-50/50"
                  >
                    <TableCell className="px-4 text-sm font-medium text-slate-500">
                      {row.sl}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-linear-to-br from-slate-200 to-slate-300 text-xs font-semibold text-slate-700">
                            {initials(row)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-semibold text-slate-800">
                          {row.fullName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium text-slate-700">
                      {row.class_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium text-slate-700">
                      {row.department_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium text-slate-700">
                      {row.batch_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium text-slate-700">
                      {row.year_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium text-slate-700">
                      {row.section_name ?? "—"}
                    </TableCell>
                    <TableCell className="px-4 text-xs font-medium text-slate-600">
                      {row.allocated}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 opacity-70 transition-opacity hover:bg-blue-50 hover:text-blue-700 hover:opacity-100"
                          title="View allocation history"
                          onClick={() => setHistoryStudent(row)}
                        >
                          <History className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 opacity-70 transition-opacity hover:bg-green-50 hover:text-green-700 hover:opacity-100"
                          title="Relocate / edit allocation"
                          onClick={() => handleOpenEdit(row)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600 opacity-70 transition-opacity hover:bg-amber-50 hover:text-amber-700 hover:opacity-100"
                          title="Check out from hostel"
                          onClick={() => setAllocationToCheckout(row)}
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 opacity-70 transition-opacity hover:bg-red-50 hover:text-red-600 hover:opacity-100"
                          title="Remove allocation (permanent)"
                          onClick={() => setAllocationToDelete(row)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-4 py-3 sm:flex-row md:px-5 md:py-4">
            <Button
              variant="outline"
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              disabled={currentPage === 1}
              className="h-8 gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {paginationButtons.map((button) =>
                button.label === "..." ? (
                  <span
                    key={button.key}
                    className="flex h-8 w-8 items-center justify-center text-xs text-slate-400"
                  >
                    &hellip;
                  </span>
                ) : (
                  <button
                    type="button"
                    key={button.key}
                    onClick={() => setCurrentPage(button.label as number)}
                    className={`flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-all ${
                      currentPage === button.label
                        ? "bg-primary text-primary-foreground shadow-sm hover:bg-primary/80"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {button.label}
                  </button>
                ),
              )}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage((page) => Math.min(totalPages, page + 1))
              }
              disabled={currentPage === totalPages}
              className="h-8 gap-1 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={!!allocationToDelete}
        onOpenChange={(open) => {
          if (!open) setAllocationToDelete(null);
        }}
        title="Remove hostel allocation?"
        description={
          allocationToDelete
            ? buildDeleteDescription(allocationToDelete)
            : "Are you sure you want to remove this allocation? This action permanently deletes the record."
        }
        confirmLabel="Delete"
        variant="destructive"
        isPending={deleting}
        onConfirm={handleConfirmDelete}
      />

      <ConfirmDialog
        open={!!allocationToCheckout}
        onOpenChange={(open) => {
          if (!open) setAllocationToCheckout(null);
        }}
        title="Check out from hostel?"
        description={
          allocationToCheckout
            ? buildCheckoutDescription(allocationToCheckout)
            : "Are you sure you want to check out this student?"
        }
        confirmLabel="Check out"
        variant="destructive"
        isPending={checkingOut}
        onConfirm={handleConfirmCheckout}
      />
    </div>
  );
}
