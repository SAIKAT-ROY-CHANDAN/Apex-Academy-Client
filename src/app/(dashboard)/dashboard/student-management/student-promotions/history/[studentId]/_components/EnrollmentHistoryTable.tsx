"use client";

import { PencilLine, Plus } from "lucide-react";
import { useState } from "react";
import CreateSupplementaryAttemptDialog from "../../../_components/CreateSupplementaryAttemptDialog";
import type { TPromotionLookups } from "../../../_components/types";
import { Badge } from "@/components/ui/badge";
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
import EditEnrollmentDialog from "./EditEnrollmentDialog";
import type { THistoryEnrollment } from "./types";

interface EnrollmentHistoryTableProps {
  enrollments: THistoryEnrollment[];
  lookups: TPromotionLookups;
}

const EnrollmentHistoryTable = ({
  enrollments,
  lookups,
}: EnrollmentHistoryTableProps) => {
  const [selected, setSelected] = useState<THistoryEnrollment | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [suppTarget, setSuppTarget] = useState<THistoryEnrollment | null>(null);
  const [suppOpen, setSuppOpen] = useState(false);

  const handleEditClick = (enrollment: THistoryEnrollment) => {
    setSelected(enrollment);
    setDialogOpen(true);
  };

  const supplementary = enrollments
    .filter((e) => e.enrollment_type === "SUPPLEMENTARY" && e.enrollment_status === "WITH_BACKLOG")
    .sort((a, b) => {
      const diff = new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime();
      return diff !== 0 ? diff : a.id.localeCompare(b.id);
    });

  const latestSupp = supplementary[supplementary.length - 1] ?? null;

  return (
    <>
      {supplementary.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/40 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  Supplementary Attempts
                  <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200 font-normal">
                    {supplementary.length} {supplementary.length === 1 ? "attempt" : "attempts"}
                  </Badge>
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">Each attempt keeps its own failed count and fee. Old attempts stay as history.</p>
              </div>
              {latestSupp && (
                <Button size="sm" className="h-8 rounded-full gap-1.5" onClick={() => { setSuppTarget(latestSupp); setSuppOpen(true); }}>
                  <Plus className="h-3.5 w-3.5" /> New supplementary attempt
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {supplementary.map((s, idx) => {
              const isLatest = idx === supplementary.length - 1;
              return (
                <div
                  key={s.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border px-4 py-3 ${isLatest ? "bg-white border-amber-200 shadow-sm" : "bg-white/70 border-border"}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${isLatest ? "bg-primary text-primary-foreground" : "bg-slate-100 text-slate-600 border"}`}>
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 text-sm">
                        <span className="font-semibold text-slate-900">Attempt #{idx + 1}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>
                          <span className="font-bold text-slate-900">{s.subject_fail_count ?? 0}</span>
                          <span className="text-muted-foreground"> subject{(s.subject_fail_count ?? 0) === 1 ? "" : "s"} failed</span>
                        </span>
                        {isLatest && <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50">Current</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.academicClass?.class_name ?? "—"} • {s.academicSession?.session_name ?? "—"} • {new Date(s.created_at ?? 0).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs font-normal">History kept</Badge>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
      <Card className="border-border/50 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            All Enrollments{" "}
            <span className="text-sm font-normal text-muted-foreground">
              ({enrollments.length})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="h-10 w-12 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  #
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Session
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Class
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Section / Batch / Shift
                </TableHead>
                <TableHead className="h-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Roll & REG
                </TableHead>
                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Status / Type
                </TableHead>
                <TableHead className="h-10 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Current
                </TableHead>
                <TableHead className="h-10 w-24 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment, index) => (
                <TableRow
                  key={enrollment.id}
                  className="transition-colors hover:bg-muted/20"
                >
                  <TableCell className="text-center text-xs text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell className="text-xs font-medium">
                    {enrollment.academicSession?.session_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs">
                    {enrollment.academicClass?.class_name || "N/A"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {enrollment.academicSection?.section_name || "—"}
                    <span className="block">
                      {enrollment.batch?.batch_name || "—"}
                      {enrollment.shift?.name
                        ? ` · ${enrollment.shift.name}`
                        : ""}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs font-normal text-muted-foreground">
                      Roll: {enrollment.roll_number || "N/A"}
                    </div>
                    <div className="text-xs font-normal text-muted-foreground">
                      REG: {enrollment.registration_number || "N/A"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {enrollment.enrollment_status || "ACTIVE"}
                    </Badge>
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      {enrollment.enrollment_type || "REGULAR"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {enrollment.is_primary ? (
                      <Badge variant="default">Current</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 rounded-full px-3 text-xs"
                      onClick={() => handleEditClick(enrollment)}
                      type="button"
                      title="Edit this enrollment"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <EditEnrollmentDialog
        enrollment={selected}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lookups={lookups}
        onUpdated={() => setSelected(null)}
      />
      <CreateSupplementaryAttemptDialog
        enrollment={suppTarget as any}
        open={suppOpen}
        onOpenChange={setSuppOpen}
        onCreated={() => setSuppTarget(null)}
      />
    </>
  );
};

export default EnrollmentHistoryTable;
