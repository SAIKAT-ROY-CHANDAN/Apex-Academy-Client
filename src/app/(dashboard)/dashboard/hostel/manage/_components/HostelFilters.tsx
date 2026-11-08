"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HostelBuilding, HostelFloor, HostelRoom } from "./types";

type HostelFiltersProps = {
  buildingValue: string;
  floorValue: string;
  roomValue: string;
  buildingOptions: HostelBuilding[];
  floorOptions: HostelFloor[];
  roomOptions: HostelRoom[];
  onBuildingChange: (value: string) => void;
  onFloorChange: (value: string) => void;
  onRoomChange: (value: string) => void;
  onClear: () => void;
  onConfirm: () => void;
};

export default function HostelFilters({
  buildingValue,
  floorValue,
  roomValue,
  buildingOptions,
  floorOptions,
  roomOptions,
  onBuildingChange,
  onFloorChange,
  onRoomChange,
  onClear,
  onConfirm,
}: HostelFiltersProps) {
  return (
    <Card className="overflow-hidden border-slate-200/70 p-0 shadow-sm">
      <CardContent className="space-y-5 p-4 md:p-5">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-linear-to-r h-px flex-1 from-slate-200 to-transparent" />
            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">
              Building Wise Filter
            </span>
            <div className="bg-linear-to-l h-px flex-1 from-slate-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Building</Label>
              <Select
                value={buildingValue}
                onValueChange={(value) => onBuildingChange(value ?? "")}
                items={Object.fromEntries(
                  buildingOptions.map((building) => [building.id, building.building_name]),
                )}
              >
                <SelectTrigger className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs shadow-none focus:ring-2 focus:ring-primary/30">
                  <SelectValue placeholder="Building" />
                </SelectTrigger>
                <SelectContent>
                  {buildingOptions.length === 0 ? (
                    <SelectItem value="" key="empty-building">
                      No buildings
                    </SelectItem>
                  ) : (
                    buildingOptions.map((building) => (
                      <SelectItem key={building.id} value={building.id}>
                        {building.building_name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Floor No.</Label>
              <Select
                value={floorValue}
                onValueChange={(value) => onFloorChange(value ?? "")}
                items={Object.fromEntries(
                  floorOptions.map((floor) => [floor.id, `Floor ${floor.floor_number}`]),
                )}
              >
                <SelectTrigger className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs shadow-none focus:ring-2 focus:ring-primary/30">
                  <SelectValue placeholder="Floor" />
                </SelectTrigger>
                <SelectContent>
                  {floorOptions.length === 0 ? (
                    <SelectItem value="" key="empty-floor">
                      No floors
                    </SelectItem>
                  ) : (
                    floorOptions.map((floor) => (
                      <SelectItem key={floor.id} value={floor.id}>
                        Floor {floor.floor_number}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-slate-600">Room No.</Label>
              <Select
                value={roomValue}
                onValueChange={(value) => onRoomChange(value ?? "")}
                items={Object.fromEntries(
                  roomOptions.map((room) => [room.id, room.hostel_room_number]),
                )}
              >
                <SelectTrigger className="h-9 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs shadow-none focus:ring-2 focus:ring-primary/30">
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent>
                  {roomOptions.length === 0 ? (
                    <SelectItem value="" key="empty-room">
                      No rooms
                    </SelectItem>
                  ) : (
                    roomOptions.map((room) => (
                      <SelectItem key={room.id} value={room.id}>
                        {room.hostel_room_number}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2 flex items-end justify-start lg:col-span-2 md:justify-end">
              <div className="flex w-full gap-2 md:w-auto">
                <Button
                  variant="outline"
                  onClick={onClear}
                  className="h-9 flex-1 rounded-md border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50 md:flex-none"
                >
                  Clear Filter
                </Button>
                <Button
                  onClick={onConfirm}
                  className="h-9 flex-1 rounded-md bg-primary px-5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/80 md:flex-none"
                >
                  Confirm
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}