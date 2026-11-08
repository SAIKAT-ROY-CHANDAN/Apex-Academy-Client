"use client";

import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createHostelConfiguration,
  deleteHostelConfiguration,
  getHostelConfigurations,
  updateHostelConfiguration,
} from "@/services/hostelConfiguration";
import { Edit, Plus, Settings2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

export type HostelConfiguration = {
  id: string;
  building_name: string;
  total_floors: number;
  createdAt?: string;
  updatedAt?: string;
};

const PAGE_SIZE = 10;

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const ConfigurationPage = () => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<{
    id: string;
    building_name: string;
    total_floors: number;
  } | null>(null);
  const [buildingName, setBuildingName] = useState("");
  const [totalFloor, setTotalFloor] = useState("");

  const [configurations, setConfigurations] = useState<HostelConfiguration[]>(
    [],
  );
  const [loading, setLoading] = useState(false);
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const loadConfigurations = () => {
    setLoading(true);
    getHostelConfigurations([
      { label: "page", value: 1 },
      { label: "limit", value: PAGE_SIZE },
    ])
      .then((res) => {
        const data = (res?.data ?? []) as HostelConfiguration[];
        setConfigurations(data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConfigurations();
  }, []);

  const handleConfigureBuilding = () => {
    setEditMode(null);
    setBuildingName("");
    setTotalFloor("");
    setDialogOpen(true);
  };

  const handleEditClick = (config: HostelConfiguration) => {
    setEditMode({
      id: config.id,
      building_name: config.building_name,
      total_floors: config.total_floors,
    });
    setBuildingName(config.building_name);
    setTotalFloor(String(config.total_floors));
    setDialogOpen(true);
  };

  const handleDeleteClick = (config: HostelConfiguration) => {
    const ok = window.confirm(
      `Are you sure you want to delete "${config.building_name}"? This action cannot be undone.`,
    );
    if (!ok) return;

    startDeleteTransition(async () => {
      try {
        const response = await deleteHostelConfiguration(config.id);
        if (!response.success) {
          toast.error(response.message ?? "Failed to delete building");
          return;
        }
        toast.success(response.message ?? "Building deleted successfully");
        loadConfigurations();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to delete building",
        );
      }
    });
  };

  const handleSave = () => {
    if (!buildingName.trim()) {
      toast.error("Building name is required");
      return;
    }
    const totalFloorNum = Number(totalFloor);
    if (!totalFloor || Number.isNaN(totalFloorNum) || totalFloorNum < 1) {
      toast.error("Total floor must be at least 1");
      return;
    }

    startSubmitTransition(async () => {
      try {
        const payload = {
          buildingName: buildingName.trim(),
          totalFloor: totalFloorNum,
        };
        let response;
        if (editMode) {
          response = await updateHostelConfiguration(editMode.id, payload);
        } else {
          response = await createHostelConfiguration(payload);
        }

        if (!response.success) {
          toast.error(
            response.message ??
              (editMode
                ? "Failed to update building"
                : "Failed to create building"),
          );
          return;
        }
        toast.success(
          response.message ??
            (editMode
              ? "Building updated successfully"
              : "Building created successfully"),
        );
        setDialogOpen(false);
        setBuildingName("");
        setTotalFloor("");
        setEditMode(null);
        loadConfigurations();
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : editMode
              ? "Failed to update building"
              : "Failed to create building",
        );
      }
    });
  };

  const displayRows = useMemo(
    () =>
      configurations.map((c, idx) => ({
        id: c.id,
        sl: pad(idx + 1),
        name: c.building_name,
        totalFloor: pad(Number(c.total_floors)),
      })),
    [configurations],
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Hostel Configuration"
        backHref="/dashboard/hostel"
        components={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              onClick={handleConfigureBuilding}
              className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-white/20 bg-white/70 px-5 text-sm font-semibold text-slate-700 shadow-lg backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-primary hover:text-white hover:shadow-primary/20 active:scale-95 dark:bg-white/10 dark:text-slate-200"
            >
              Configure Building
              <Plus className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader className="space-y-1 border-b pb-4">
                <DialogTitle className="text-xl font-semibold">
                  {editMode ? "Edit Building" : "Configure Building"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the building details below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="building-name">Building Name</Label>
                  <Input
                    id="building-name"
                    placeholder="Enter building name"
                    value={buildingName}
                    onChange={(e) => setBuildingName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="total-floor">Total Floor</Label>
                  <Input
                    id="total-floor"
                    type="number"
                    placeholder="Enter total floor"
                    min="1"
                    value={totalFloor}
                    onChange={(e) => setTotalFloor(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isSubmitting
                    ? editMode
                      ? "Updating..."
                      : "Saving..."
                    : editMode
                      ? "Update"
                      : "Save"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Configure Building
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-sm font-medium text-muted-foreground">
                Loading buildings...
              </p>
            </div>
          ) : displayRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Settings2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No buildings found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Click "Configure Building" to add your first building.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-12 w-20 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SL No.
                  </TableHead>
                  <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Building Name
                  </TableHead>
                  <TableHead className="h-12 w-40 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Total Floor
                  </TableHead>
                  <TableHead className="h-12 w-40 px-4 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="px-4 text-sm font-medium text-muted-foreground">
                      {row.sl}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium">
                      {row.name}
                    </TableCell>
                    <TableCell className="px-4 text-sm font-medium">
                      {row.totalFloor}
                    </TableCell>
                    <TableCell className="px-4">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 opacity-70 transition-opacity hover:bg-blue-50 hover:text-blue-700 hover:opacity-100"
                          title="Assign rooms to floors"
                          onClick={() => {
                            router.push(
                              `/dashboard/hostel/configuration/assign-rooms/${row.id}`,
                            );
                          }}
                        >
                          <Settings2 className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 opacity-70 transition-opacity hover:bg-green-50 hover:text-green-700 hover:opacity-100"
                          title="Edit building"
                          onClick={() => {
                            const cfg = configurations.find(
                              (c) => c.id === row.id,
                            );
                            if (cfg) handleEditClick(cfg);
                          }}
                        >
                          <Edit className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 opacity-70 transition-opacity hover:bg-red-50 hover:text-red-600 hover:opacity-100"
                          title="Delete building"
                          disabled={isDeleting}
                          onClick={() => {
                            const cfg = configurations.find(
                              (c) => c.id === row.id,
                            );
                            if (cfg) handleDeleteClick(cfg);
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
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

export default ConfigurationPage;
