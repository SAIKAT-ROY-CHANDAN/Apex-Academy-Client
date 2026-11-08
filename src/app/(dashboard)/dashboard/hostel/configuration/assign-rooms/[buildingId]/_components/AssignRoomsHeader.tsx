"use client";

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
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";

export type RoomRow = {
  key: number;
  id?: string;
  roomNumber: string;
  availableSit: string;
};

export type FloorOption = {
  value: string;
  label: string;
  floorNumber: number;
  floorId: string | null;
  isConfigured?: boolean;
  totalRooms?: number;
};

export type AssignRoomsHeaderProps = {
  buildingName: string | null;
  floorOptions: FloorOption[];
  dialogOpen: boolean;
  setDialogOpen: (open: boolean) => void;
  onOpenConfigureFloor?: () => void;
  selectedFloor: string;
  onFloorChange: (value: string | null) => void;
  rooms: RoomRow[];
  onAddRoom: () => void;
  onRemoveRoom: (key: number) => void;
  onUpdateRoom: (
    key: number,
    field: "roomNumber" | "availableSit",
    value: string,
  ) => void;
  onSave: () => void;
  isSaving?: boolean;
  isEditMode?: boolean;
};


export const AssignRoomsHeader = ({
  buildingName,
  floorOptions,
  dialogOpen,
  setDialogOpen,
  onOpenConfigureFloor,
  selectedFloor,
  onFloorChange,
  rooms,
  onAddRoom,
  onRemoveRoom,
  onUpdateRoom,
  onSave,
  isSaving,
  isEditMode,
}: AssignRoomsHeaderProps) => {
  const headerTitle = buildingName ?? "Assign Rooms";

  return (
    <header className="relative overflow-hidden p-6">
      <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-16 bottom-0 h-40 w-40 rounded-full bg-sky-400/10 blur-3xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-4">
          <nav className="flex flex-wrap items-center gap-1 text-sm">
            <Link
              href="/dashboard"
              className="flex items-center gap-1 rounded-full border border-white/20 bg-white/60 px-2.5 py-1 text-slate-500 backdrop-blur transition hover:bg-primary hover:text-white dark:bg-white/10 dark:text-slate-300"
            >
              <Home className="h-3.5 w-3.5" />
            </Link>

            <div className="flex items-center">
              <ChevronRight className="mx-1 h-3.5 w-3.5 text-slate-300" />
              <Link
                href="/dashboard/hostel"
                className="rounded-full px-2 py-1 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
              >
                Hostel
              </Link>
            </div>

            <div className="flex items-center">
              <ChevronRight className="mx-1 h-3.5 w-3.5 text-slate-300" />
              <Link
                href="/dashboard/hostel/configuration"
                className="rounded-full px-2 py-1 text-slate-500 transition hover:bg-primary/10 hover:text-primary"
              >
                Configuration
              </Link>
            </div>

            <div className="flex items-center">
              <ChevronRight className="mx-1 h-3.5 w-3.5 text-slate-300" />
              <span className="rounded-full bg-primary/10 px-3 py-1 font-medium text-primary">
                Assign Rooms
              </span>
            </div>
          </nav>

          <div className="space-y-1">
            <h1 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
              {headerTitle}
            </h1>

            <p className="text-sm text-slate-500">
              Manage and monitor everything related to{" "}
              <span className="font-medium text-primary">{headerTitle}</span>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/dashboard/hostel/configuration"
            className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back
          </Link>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <button
              type="button"
              onClick={() => {
                if (onOpenConfigureFloor) {
                  onOpenConfigureFloor();
                } else {
                  setDialogOpen(true);
                }
              }}
              className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
              Configure Floor
              <Plus className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </button>
            <DialogContent className="flex max-h-[calc(100dvh-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-3xl">
              <DialogHeader className="space-y-1 border-b px-6 py-4 pr-14">
                <DialogTitle className="text-xl font-semibold">
                  {isEditMode ? "Edit Floor Rooms" : "Configure Floor"}
                </DialogTitle>
              </DialogHeader>
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-contain px-6 py-5">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Select Floor</Label>
                    <Select
                      value={selectedFloor}
                      onValueChange={onFloorChange}
                      disabled={isEditMode}
                    >
                      <SelectTrigger className="w-full h-10 text-sm" disabled={isEditMode}>
                        <SelectValue placeholder="Select Floor">
                          {selectedFloor
                            ? (() => {
                                const opt = floorOptions.find(
                                  (f) => f.value === selectedFloor,
                                );
                                return opt?.label ?? "Select Floor";
                              })()
                            : "Select Floor"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {floorOptions.map((f) => (
                          <SelectItem
                            key={f.value}
                            value={f.value}
                            disabled={!isEditMode && f.isConfigured}
                          >
                            <span className="flex items-center justify-between w-full gap-4">
                              <span>
                                Floor No.{" "}
                                {f.floorNumber < 10
                                  ? `0${f.floorNumber}`
                                  : f.floorNumber}
                              </span>
                              {f.isConfigured ? (
                                <span className="text-xs text-muted-foreground font-normal">
                                  (Already Configured)
                                </span>
                              ) : (
                                <span className="text-xs text-emerald-600 font-medium">
                                  (Available)
                                </span>
                              )}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {isEditMode && (
                      <p className="text-xs text-muted-foreground">
                        Floor number cannot be changed in edit mode.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="total-room">Total Room</Label>
                    <Input
                      id="total-room"
                      type="number"
                      min="1"
                      value={rooms.length}
                      disabled
                      className="h-10 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Auto-counted from rooms added
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {rooms.map((room, idx) => (
                    <div
                      key={room.key}
                      className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_1fr_auto]"
                    >
                      <div className="space-y-2">
                        <Label>Room No.</Label>
                        <Input
                          placeholder="Enter room number"
                          value={room.roomNumber}
                          onChange={(e) =>
                            onUpdateRoom(
                              room.key,
                              "roomNumber",
                              e.target.value,
                            )
                          }
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Available Sit</Label>
                        <Input
                          type="number"
                          min="1"
                          placeholder="Enter available sits"
                          value={room.availableSit}
                          onChange={(e) =>
                            onUpdateRoom(
                              room.key,
                              "availableSit",
                              e.target.value,
                            )
                          }
                          className="h-10 text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        {rooms.length > 1 && (
                          <Button
                            type="button"
                            onClick={() => onRemoveRoom(room.key)}
                            size="icon"
                            className="h-10 w-10 rounded-lg bg-red-500 text-white hover:bg-red-600"
                            title="Remove room"
                          >
                            <Minus className="h-5 w-5" />
                          </Button>
                        )}
                        {idx === rooms.length - 1 && (
                          <Button
                            type="button"
                            onClick={onAddRoom}
                            size="icon"
                            className="h-10 w-10 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                            title="Add room"
                          >
                            <Plus className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <DialogFooter className="gap-2 border-t px-6 py-4">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSaving}
                  className="h-10 rounded-lg"
                >
                  Cancel
                </Button>
                <Button
                  onClick={onSave}
                  disabled={isSaving}
                  className="h-10 rounded-lg bg-blue-600 hover:bg-blue-700"
                >
                  {isSaving ? "Saving..." : isEditMode ? "Update" : "Add"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default AssignRoomsHeader;
