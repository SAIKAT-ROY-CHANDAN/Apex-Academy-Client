"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { getTeachers } from "@/services/teacher";
import { ADMINISTRATIVE_POSITION_LABELS } from "../_constants";
import { formatTeacherType } from "@/constant/teacher/teacherType";
import { TTeacher } from "@/types/modules/teacher/teacher.type";

type ExportTeachersButtonProps = {
  filter?: Record<string, string>;
  search?: string;
};

const ExportTeachersButton = ({ filter, search }: ExportTeachersButtonProps) => {
  const [isPending, startTransition] = useTransition();

  const handleExport = () => {
    startTransition(async () => {
      try {
        const query: { label: string; value: string }[] = [
          { label: "limit", value: "10000" },
        ];

        if (search) {
          query.push({ label: "searchTerm", value: search });
        }

        if (filter && Object.keys(filter).length > 0) {
          query.push({ label: "filter", value: JSON.stringify(filter) });
        }

        const res = await getTeachers(query);
        const teachers: TTeacher[] = res?.data ?? [];

        if (teachers.length === 0) {
          toast.error("No teachers to export");
          return;
        }

        const headers = [
          "SN",
          "Full Name",
          "Email",
          "Phone",
          "bKash Number",
          "Gender",
          "Teacher Type",
          "Administrative Position",
          "Designation",
          "Shift",
          "Department",
          "Address",
          "Last Qualification",
          "Active",
        ];

        const csvRows = [
          headers.join(","),
          ...teachers.map((t: TTeacher, i: number) => {
            const row = [
              i + 1,
              t.full_name ?? "",
              t.email ?? "",
              t.phone ?? "",
              t.bkash_number ?? "",
              t.gender ?? "",
              t.teacher_type ? formatTeacherType(t.teacher_type) : "",
              t.administrative_position
                ? ADMINISTRATIVE_POSITION_LABELS[t.administrative_position] ??
                  t.administrative_position
                : "",
              t.designation?.name ?? "",
              t.shift?.name ?? "",
              t.department?.department_name ?? "",
              t.address ?? "",
              t.last_qualification ?? "",
              t.is_active === false ? "No" : "Yes",
            ];
            return row
              .map((cell) => {
                const str = String(cell ?? "");
                if (str.includes(",") || str.includes('"') || str.includes("\n")) {
                  return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
              })
              .join(",");
          }),
        ];

        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `teachers_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${teachers.length} teachers to CSV`);
      } catch {
        toast.error("Failed to export teachers");
      }
    });
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isPending}
      className="h-9 gap-1.5"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Download className="h-3.5 w-3.5" />
      )}
      Export CSV
    </Button>
  );
};

export default ExportTeachersButton;
