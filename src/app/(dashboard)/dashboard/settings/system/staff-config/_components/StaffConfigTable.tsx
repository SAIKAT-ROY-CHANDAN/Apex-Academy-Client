"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { formatStaffType } from "@/constant/staff/staffType";
import { TStaff } from "@/types/modules/staff/staff.type";
import { Settings, Users } from "lucide-react";
import { useState } from "react";
import StaffConfigDialog from "./StaffConfigDialog";

type StaffConfigTableProps = {
  staffs: TStaff[];
};

const StaffConfigTable = ({ staffs }: StaffConfigTableProps) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<TStaff | null>(null);

  const handleConfigClick = (staff: TStaff) => {
    setSelectedStaff(staff);
    setConfigDialogOpen(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getConfig = (staff: TStaff) => staff.overtimeStaffConfigs?.[0];

  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Overtime Config - Staff
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!staffs || staffs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No staff found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                No staff are available for overtime configuration.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    SN
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Name
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Type
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Designation
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Hourly Rate
                  </TableHead>
                  <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffs.map((staff, index) => {
                  const config = getConfig(staff);
                  return (
                    <TableRow
                      key={staff.id}
                      className="group transition-colors hover:bg-muted/20"
                    >
                      <TableCell className="text-center text-xs text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={staff.photo}
                              alt={staff.full_name}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(staff.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{staff.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground capitalize">
                          {formatStaffType(staff.staff_type)}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {staff.designation?.name ?? "N/A"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {config?.overtime_hourly_amount !== undefined
                          ? `BDT ${config.overtime_hourly_amount.toFixed(2)}`
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                            onClick={() => handleConfigClick(staff)}
                            title="Configure overtime"
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedStaff && (
        <StaffConfigDialog
          staffId={selectedStaff.id}
          overtime_hourly_amount={
            getConfig(selectedStaff)?.overtime_hourly_amount ?? 0
          }
          id={getConfig(selectedStaff)?.id ?? undefined}
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          staffName={selectedStaff.full_name}
        />
      )}
    </>
  );
};

export default StaffConfigTable;
