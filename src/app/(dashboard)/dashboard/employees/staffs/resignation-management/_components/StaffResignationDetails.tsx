"use client";

import {
  Briefcase,
  CalendarDays,
  Edit,
  FileText,
  Mail,
  Phone,
  Undo2,
  User,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatStaffType } from "@/constant/staff/staffType";
import type { TStaffResignation } from "@/types/modules/staff/staff-resignation.type";
import { formatDateLong, getInitials } from "../_constants";

const GENDER_LABELS: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

type StaffResignationDetailsProps = {
  resignation: TStaffResignation;
};

const StaffResignationDetails = ({
  resignation,
}: StaffResignationDetailsProps) => {
  const router = useRouter();
  const staff = resignation.staff;
  const designationName = staff?.designation?.name ?? null;

  const staffInfoItems = [
    {
      label: "Designation",
      icon: Briefcase,
      value: designationName,
    },
    {
      label: "Staff Type",
      icon: Users,
      value: staff?.staff_type ? formatStaffType(staff.staff_type) : null,
    },
    {
      label: "Email",
      icon: Mail,
      value: staff?.email,
    },
    {
      label: "Phone",
      icon: Phone,
      value: staff?.phone,
    },
    {
      label: "Gender",
      icon: User,
      value: staff?.gender
        ? (GENDER_LABELS[staff.gender] ?? staff.gender)
        : null,
    },
  ];

  const infoItems = [
    {
      label: "Resignation Date",
      value: (
        <span className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          {formatDateLong(resignation.resignation_date)}
        </span>
      ),
    },
    {
      label: "Submitted",
      value: resignation.created_at
        ? new Date(resignation.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
  ];

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-6">
        {/* Staff identity */}
        <div className="flex flex-col gap-5 border-b pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage
                src={staff?.photo ?? undefined}
                alt={staff?.full_name}
              />
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {getInitials(staff?.full_name ?? "ST")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {staff?.full_name ?? "Unknown Staff"}
              </h2>
              {designationName && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4" />
                  {designationName}
                </p>
              )}
              {staff?.phone && (
                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  {staff.phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Staff information */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Staff Information
          </h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {staffInfoItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <item.icon className="h-3.5 w-3.5" />
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {item.value || "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-6 border-t pt-6">
          <h3 className="text-sm font-semibold text-foreground">
            Resignation Information
          </h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {infoItems.map((item) => (
              <div key={item.label} className="space-y-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {item.label}
                </p>
                <p className="text-sm font-medium text-foreground">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Reason */}
        <div className="mt-6 rounded-lg border bg-muted/30 p-5">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">
              Resignation Reason
            </h3>
          </div>
          <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {resignation.reason || "No reason provided"}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 text-muted-foreground hover:text-foreground"
            onClick={() => router.back()}
          >
            <Undo2 className="h-4 w-4" />
            Back
          </Button>

          <Link
            href={`/dashboard/employees/staffs/resignation-management/${resignation.id}/edit`}
          >
            <Button variant="default" size="lg" className="gap-2">
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default StaffResignationDetails;
