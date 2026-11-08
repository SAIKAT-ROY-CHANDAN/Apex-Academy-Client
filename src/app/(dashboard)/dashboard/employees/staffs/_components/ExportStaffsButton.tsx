"use client";

import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { getStaffs } from "@/services/staff";
import { formatStaffType } from "@/constant/staff/staffType";
import { TStaff } from "@/types/modules/staff/staff.type";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

const ACADEMIC_QUALIFICATION_LABELS: Record<string, string> = {
  SSC: "SSC",
  HSC: "HSC",
  DEGREE_PASS: "Degree Pass",
  DIPLOMA: "Diploma",
  HONORS: "Honours",
  MASTERS: "Masters",
  PHD: "PhD",
};

const formatEnum = (
  value: string | undefined,
  labels: Record<string, string>,
): string => {
  if (!value) return "";
  return labels[value] ?? value.replace(/_/g, " ");
};

type ExportStaffsButtonProps = {
  filter?: Record<string, string>;
  search?: string;
};

const ExportStaffsButton = ({ filter, search }: ExportStaffsButtonProps) => {
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

        const res = await getStaffs(query);
        const staffs: TStaff[] = res?.data ?? [];

        if (staffs.length === 0) {
          toast.error("No staffs to export");
          return;
        }

        const headers = [
          "SN",
          "Full Name",
          "Email",
          "Phone",
          "bKash Number",
          "Gender",
          "Staff Type",
          "Designation",
          "Academic Qualification",
          "Address",
          "Active",
        ];

        const csvRows = [
          headers.join(","),
          ...staffs.map((s: TStaff, i: number) => {
            const row = [
              i + 1,
              s.full_name ?? "",
              s.email ?? "",
              s.phone ?? "",
              s.bkash_number ?? "",
              formatEnum(s.gender, GENDER_LABELS),
              s.staff_type ? formatStaffType(s.staff_type) : "",
              s.designation?.name ?? "",
              formatEnum(
                s.academic_qualification,
                ACADEMIC_QUALIFICATION_LABELS,
              ),
              s.address ?? "",
              s.is_active === false ? "No" : "Yes",
            ];
            return row
              .map((cell) => {
                const str = String(cell ?? "");
                if (
                  str.includes(",") ||
                  str.includes('"') ||
                  str.includes("\n")
                ) {
                  return `"${str.replace(/"/g, '""')}"`;
                }
                return str;
              })
              .join(",");
          }),
        ];

        const csvContent = "\uFEFF" + csvRows.join("\n");
        const blob = new Blob([csvContent], {
          type: "text/csv;charset=utf-8;",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `staffs_${new Date().toISOString().split("T")[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        toast.success(`Exported ${staffs.length} staffs to CSV`);
      } catch {
        toast.error("Failed to export staffs");
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

export default ExportStaffsButton;
