"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AssignRoomsHeader, {
  FloorOption,
  RoomRow,
} from "./_components/AssignRoomsHeader";
import {
  assignRoomsToFloor,
  getHostelConfigurationById,
} from "@/services/hostelConfiguration";
import { Download, Edit, Plus } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

export type HostelRoom = {
  id?: string;
  hostel_room_number: string;
  available_sits: number;
};

export type HostelFloor = {
  id?: string;
  hostel_configuration_id?: string;
  floor_number?: number;
  total_rooms?: number;
  hostelRooms?: HostelRoom[];
};

export type HostelConfigurationDetail = {
  id: string;
  building_name: string;
  total_floors: number;
  hostelFloors?: HostelFloor[];
};

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const AssignRoomsPage = ({
  params,
}: {
  params: Promise<{ buildingId: string }>;
}) => {
  const [buildingId, setBuildingId] = useState<string>("");
  const [config, setConfig] = useState<HostelConfigurationDetail | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [isSaving, startSaveTransition] = useTransition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [rooms, setRooms] = useState<RoomRow[]>([
    { key: 1, roomNumber: "", availableSit: "" },
  ]);

  useEffect(() => {
    (async () => {
      const resolved = await params;
      setBuildingId(resolved.buildingId);
    })();
  }, [params]);

  const loadBuilding = () => {
    if (!buildingId) return;
    setLoading(true);
    getHostelConfigurationById(buildingId)
      .then((res) => {
        const data = (res?.data ?? res) as HostelConfigurationDetail;
        if (data && data.id) {
          setConfig(data);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (buildingId) loadBuilding();
  }, [buildingId]);

  const floorByNumber = useMemo(() => {
    const map = new Map<number, HostelFloor>();
    (config?.hostelFloors ?? []).forEach((floor) => {
      if (typeof floor.floor_number === "number") {
        map.set(floor.floor_number, floor);
      }
    });
    return map;
  }, [config]);

  const floorOptions = useMemo<FloorOption[]>(() => {
    const total = config?.total_floors ?? 0;
    return Array.from({ length: total }, (_, i) => {
      const floorNumber = i + 1;
      const existing = floorByNumber.get(floorNumber);
      const isConfigured = Boolean(
        existing &&
          ((existing.hostelRooms && existing.hostelRooms.length > 0) ||
            (existing.total_rooms ?? 0) > 0),
      );
      return {
        value: existing?.id
          ? `id:${existing.id}`
          : `floor:${floorNumber}`,
        label: `Floor No. ${pad(floorNumber)}${isConfigured ? " (Configured)" : ""}`,
        floorNumber,
        floorId: existing?.id ?? null,
        isConfigured,
        totalRooms: existing?.hostelRooms?.length ?? existing?.total_rooms ?? 0,
      };
    });
  }, [config, floorByNumber]);

  const resolveFloorSelection = (
    value: string,
  ): { floorNumber: number; floorId: string | null } | null => {
    const match = floorOptions.find((f) => f.value === value);
    if (!match) return null;
    return { floorNumber: match.floorNumber, floorId: match.floorId };
  };

  const openConfigureFloor = () => {
    const availableFloors = floorOptions.filter((f) => !f.isConfigured);
    if (availableFloors.length === 0) {
      toast.info(
        "All floors in this building are already configured. Use the edit button in the table to modify a floor.",
      );
      return;
    }
    setIsEditMode(false);
    setSelectedFloor(availableFloors[0].value);
    setRooms([{ key: 1, roomNumber: "", availableSit: "" }]);
    setDialogOpen(true);
  };

  const handleConfigureSpecificFloor = (floorNumber: number) => {
    const option = floorOptions.find((f) => f.floorNumber === floorNumber);
    if (!option) return;
    setIsEditMode(false);
    setSelectedFloor(option.value);
    setRooms([{ key: 1, roomNumber: "", availableSit: "" }]);
    setDialogOpen(true);
  };

  const handleEditFloor = (floor: HostelFloor) => {
    const floorNumber = floor.floor_number;
    let targetValue = "";
    if (floorNumber != null) {
      const option = floorOptions.find((f) => f.floorNumber === floorNumber);
      if (option) targetValue = option.value;
    }
    setIsEditMode(true);
    setSelectedFloor(targetValue);
    setRooms(
      floor.hostelRooms && floor.hostelRooms.length > 0
        ? floor.hostelRooms.map((r, i) => ({
            key: i + 1,
            id: r.id,
            roomNumber: r.hostel_room_number,
            availableSit: String(r.available_sits),
          }))
        : [{ key: 1, roomNumber: "", availableSit: "" }],
    );
    setDialogOpen(true);
  };

  const addRoomRow = () => {
    setRooms((prev) => [
      ...prev,
      {
        key: Date.now(),
        roomNumber: "",
        availableSit: "",
      },
    ]);
  };

  const removeRoomRow = (key: number) => {
    setRooms((prev) =>
      prev.length > 1 ? prev.filter((r) => r.key !== key) : prev,
    );
  };

  const updateRoom = (
    key: number,
    field: "roomNumber" | "availableSit",
    value: string,
  ) => {
    setRooms((prev) =>
      prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)),
    );
  };

  const handleFloorChange = (value: string | null) => {
    const val = value ?? "";
    setSelectedFloor(val);
    if (!isEditMode && val) {
      const resolved = resolveFloorSelection(val);
      if (resolved) {
        const floor = floorByNumber.get(resolved.floorNumber);
        const isConfigured = Boolean(
          floor &&
            ((floor.hostelRooms && floor.hostelRooms.length > 0) ||
              (floor.total_rooms ?? 0) > 0),
        );
        if (isConfigured && floor?.hostelRooms && floor.hostelRooms.length > 0) {
          setIsEditMode(true);
          setRooms(
            floor.hostelRooms.map((r, i) => ({
              key: i + 1,
              id: r.id,
              roomNumber: r.hostel_room_number,
              availableSit: String(r.available_sits),
            })),
          );
        }
      }
    }
  };

  const handleSave = () => {
    if (!selectedFloor) {
      toast.error("Please select a floor");
      return;
    }
    const resolved = resolveFloorSelection(selectedFloor);
    if (!resolved) {
      toast.error("Invalid floor selection");
      return;
    }
    const { floorNumber, floorId } = resolved;
    const hasIncompleteRoom = rooms.some(
      (r) => !r.roomNumber.trim() || !r.availableSit.trim(),
    );
    if (hasIncompleteRoom) {
      toast.error("Fill in Room No. and Available Sit for all rooms");
      return;
    }
    const hasInvalidSit = rooms.some(
      (r) =>
        Number.isNaN(Number(r.availableSit)) || Number(r.availableSit) <= 0,
    );
    if (hasInvalidSit) {
      toast.error("Available sit must be a positive number");
      return;
    }
    const roomNumbers = rooms.map((r) => r.roomNumber.trim());
    const duplicateRoom = roomNumbers.find(
      (num, idx) => roomNumbers.indexOf(num) !== idx,
    );
    if (duplicateRoom) {
      toast.error(
        `Duplicate room number "${duplicateRoom}" detected on this floor`,
      );
      return;
    }
    if (!buildingId) {
      toast.error("Building id is missing");
      return;
    }

    startSaveTransition(async () => {
      try {
        const payload: Record<string, unknown> = {
          hostel_configuration_id: buildingId,
          floor_number: floorNumber,
          total_rooms: rooms.length,
          rooms: rooms.map((r) => {
            const room: Record<string, unknown> = {
              hostel_room_number: r.roomNumber.trim(),
              available_sits: Number(r.availableSit),
            };
            if (r.id) {
              room.id = r.id;
            }
            return room;
          }),
        };
        if (floorId) {
          payload.hostel_floor_id = floorId;
        }
        const response = await assignRoomsToFloor(payload);
        if (!response.success) {
          toast.error(response.message ?? "Failed to assign rooms");
          return;
        }
        toast.success(response.message ?? "Rooms assigned successfully");
        setDialogOpen(false);
        setIsEditMode(false);
        setSelectedFloor("");
        setRooms([{ key: 1, roomNumber: "", availableSit: "" }]);
        loadBuilding();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to assign rooms",
        );
      }
    });
  };

  const displayFloors = useMemo(() => {
    const total = config?.total_floors ?? 0;
    return Array.from({ length: total }, (_, i) => {
      const floorNumber = i + 1;
      const floor = floorByNumber.get(floorNumber);
      const floorRooms = floor?.hostelRooms ?? [];
      const isConfigured = Boolean(
        floor &&
          (floorRooms.length > 0 || (floor.total_rooms ?? 0) > 0),
      );
      return {
        key: floor?.id ?? `floor-${floorNumber}`,
        sl: pad(i + 1),
        floorNo: pad(floorNumber),
        totalRoom: floorRooms.length,
        roomSummary:
          floorRooms.length > 0
            ? floorRooms
                .map(
                  (r) => `${r.hostel_room_number}-${r.available_sits}`,
                )
                .join(" | ")
            : "",
        floor: (floor ?? {
          floor_number: floorNumber,
          total_rooms: 0,
          hostelRooms: [],
        }) as HostelFloor,
        configured: isConfigured,
      };
    });
  }, [config, floorByNumber]);

  const buildingTitle = config
    ? `${config.building_name}: Configure Floor`
    : "Configure Floor";

  return (
    <div className="space-y-8">
      <AssignRoomsHeader
        buildingName={config?.building_name ?? null}
        floorOptions={floorOptions}
        dialogOpen={dialogOpen}
        setDialogOpen={(open) => {
          setDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
          }
        }}
        onOpenConfigureFloor={openConfigureFloor}
        selectedFloor={selectedFloor}
        onFloorChange={handleFloorChange}
        rooms={rooms}
        onAddRoom={addRoomRow}
        onRemoveRoom={removeRoomRow}
        onUpdateRoom={updateRoom}
        onSave={handleSave}
        isSaving={isSaving}
        isEditMode={isEditMode}
      />

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            {buildingTitle}
          </CardTitle>
          <Button className="h-9 gap-2 bg-blue-600 hover:bg-blue-700">
            Export
            <Download className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Loading floors...
              </p>
            </div>
          ) : displayFloors.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                No floors configured yet.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Click "Configure Floor" above to assign your first rooms.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-12 w-20 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SL No.
                  </TableHead>
                  <TableHead className="h-12 w-32 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Floor
                  </TableHead>
                  <TableHead className="h-12 w-36 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Room
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Room No.- Available Sit
                  </TableHead>
                  <TableHead className="h-12 w-40 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayFloors.map((row) => (
                  <TableRow
                    key={row.key}
                    className={`group transition-colors hover:bg-muted/20 ${
                      !row.configured ? "bg-slate-50/40 dark:bg-slate-900/20" : ""
                    }`}
                  >
                    <TableCell className="px-4 text-sm font-medium text-muted-foreground">
                      {row.sl}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium">
                      {row.floorNo}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium">
                      {row.totalRoom}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium text-muted-foreground">
                      {row.roomSummary || (
                        <span className="italic text-muted-foreground/60">
                          Not configured yet
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-center gap-1">
                        {row.configured ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-green-600 opacity-70 transition-opacity hover:bg-green-50 hover:text-green-700 hover:opacity-100 dark:hover:bg-green-950/30"
                            title="Edit floor"
                            onClick={() => handleEditFloor(row.floor)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 opacity-70 transition-opacity hover:bg-blue-50 hover:text-blue-700 hover:opacity-100 dark:hover:bg-blue-950/30"
                            title="Configure this floor"
                            onClick={() =>
                              handleConfigureSpecificFloor(
                                row.floor.floor_number ?? 0,
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AssignRoomsPage;
