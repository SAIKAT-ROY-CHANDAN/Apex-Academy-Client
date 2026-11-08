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
import { TTeacher } from "@/types/modules/teacher/teacher.type";
import { Settings, Users } from "lucide-react";
import { useState } from "react";
import ConfigDialog from "./ConfigDialog";
import { formatTeacherType } from "@/constant/teacher/teacherType";

type ConfigTeacherTableProps = {
  teachers: TTeacher[];
  mode: string;
};

const ConfigTeacherTable = ({ teachers, mode }: ConfigTeacherTableProps) => {
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<TTeacher | null>(null);

  const handleConfigClick = (teacher: TTeacher) => {
    setSelectedTeacher(teacher);
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
  return (
    <>
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between gap-4 pb-4">
          <CardTitle className="text-lg font-semibold">
            Overtime Config - Teachers
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!teachers || teachers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="mb-3 h-10 w-10 text-muted-foreground/50" />
              <p className="text-sm font-medium text-muted-foreground">
                No teachers found.
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                No teachers are available for overtime configuration.
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
                  {mode === "COLLEGE_UNIVERSITY" ? (
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Department
                    </TableHead>
                  ) : (
                    <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Class
                    </TableHead>
                  )}
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Designation
                  </TableHead>
                  <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Shift
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
                {teachers.map((teacher, index) => (
                  <TableRow
                    key={teacher.id}
                    className="group transition-colors hover:bg-muted/20"
                  >
                    <TableCell className="text-center text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={teacher.photo}
                            alt={teacher.full_name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(teacher.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{teacher.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        {formatTeacherType(teacher.teacher_type)}
                      </span>
                    </TableCell>
                    {mode === "COLLEGE_UNIVERSITY" ? (
                      <TableCell className="text-sm text-muted-foreground">
                        {teacher.department?.department_name ?? "N/A"}
                      </TableCell>
                    ) : (
                      <TableCell className="text-sm text-muted-foreground">
                        {teacher.department?.department_name ?? "N/A"}
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.designation?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.shift?.name ?? "N/A"}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {teacher.overtimeTeacherConfig?.overtime_hourly_amount !==
                      undefined
                        ? `BDT ${teacher.overtimeTeacherConfig.overtime_hourly_amount.toFixed(
                            2,
                          )}`
                        : "N/A"}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
                          onClick={() => handleConfigClick(teacher)}
                          title="Configure overtime"
                        >
                          <Settings className="h-4 w-4" />
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

      {selectedTeacher && (
        <ConfigDialog
          teacherId={selectedTeacher.id}
          overtime_hourly_amount={
            selectedTeacher?.overtimeTeacherConfig?.overtime_hourly_amount ?? 0
          }
          id={selectedTeacher?.overtimeTeacherConfig?.id ?? undefined}
          open={configDialogOpen}
          onOpenChange={setConfigDialogOpen}
          teacherName={selectedTeacher.full_name}
        />
      )}
    </>
  );
};

export default ConfigTeacherTable;
