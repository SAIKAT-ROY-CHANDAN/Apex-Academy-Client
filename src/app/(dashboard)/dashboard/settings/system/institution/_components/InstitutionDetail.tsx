"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Building2,
  School,
  MapPin,
  Phone,
  Mail,
  Palette,
  CalendarDays,
  LayoutGrid,
  Check,
  Edit,
  Globe,
  Clock,
  Shield,
} from "lucide-react";
import type { TInstitution } from "@/types/modules/institution/institution.type";
import InstitutionEditDialog from "./InstitutionEditDialog";

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

const MODULE_LABELS: Record<string, string> = {
  ACADEMICS: "Academics",
  PAYROLL: "Payroll",
  FINANCE: "Finance",
  HOSTEL: "Hostel",
  QUARTER: "Quarter",
  TRANSPORT: "Transport",
  LIBRARY: "Library",
  COMPLAINT: "Complaint",
  WEBSITE: "Website",
};

const MODULE_COLORS: Record<string, string> = {
  ACADEMICS: "bg-blue-100 text-blue-700",
  PAYROLL: "bg-emerald-100 text-emerald-700",
  FINANCE: "bg-amber-100 text-amber-700",
  HOSTEL: "bg-violet-100 text-violet-700",
  QUARTER: "bg-rose-100 text-rose-700",
  TRANSPORT: "bg-cyan-100 text-cyan-700",
  LIBRARY: "bg-orange-100 text-orange-700",
  COMPLAINT: "bg-pink-100 text-pink-700",
  WEBSITE: "bg-teal-100 text-teal-700",
};

interface InstitutionDetailProps {
  institution: TInstitution | null;
}

const InstitutionDetail = ({ institution }: InstitutionDetailProps) => {
  const [editOpen, setEditOpen] = useState(false);

  if (!institution) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <Building2 className="mb-3 h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm font-medium text-muted-foreground">
            No institution configured yet.
          </p>
          <p className="mt-1 text-xs text-muted-foreground/60">
            Set up your institution to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  const isUniversity = institution.mode === "COLLEGE_UNIVERSITY";

  const parseJsonArray = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) return value as string[];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed as string[];
        if (typeof parsed === "string") return [parsed];
        return [];
      } catch {
        // Fallback for bare strings like "ACADEMICS" or comma-separated values
        if (trimmed.startsWith("[") || trimmed.startsWith('"')) return [];
        if (trimmed.includes(",")) {
          return trimmed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return [trimmed];
      }
    }
    return [];
  };

  const weekendDays = parseJsonArray(institution.weekend_days);
  const activeModules = parseJsonArray(institution.active_modules);

  const formatDate = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-xl">
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -left-16 bottom-0 h-48 w-48 rounded-full bg-sky-400/10 blur-3xl" />

        <div className="relative flex flex-col gap-6 p-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 shadow-lg backdrop-blur-sm">
              {institution.logo ? (
                <Image
                  src={institution.logo}
                  alt={institution.name}
                  fill
                  className="object-contain p-2"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  {isUniversity ? (
                    <Building2 className="h-10 w-10 text-white/60" />
                  ) : (
                    <School className="h-10 w-10 text-white/60" />
                  )}
                </div>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{institution.name}</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge
                  className={`gap-1.5 border-0 px-3 py-1 text-xs font-semibold ${
                    isUniversity
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-emerald-500/20 text-emerald-300"
                  }`}
                >
                  {isUniversity ? (
                    <Building2 className="h-3 w-3" />
                  ) : (
                    <School className="h-3 w-3" />
                  )}
                  {isUniversity ? "College & University" : "School"}
                </Badge>
                <Badge className="border-0 bg-white/10 text-white/80">
                  <Check className="mr-1 h-3 w-3" />
                  Active
                </Badge>
              </div>
            </div>
          </div>

          <Button
            onClick={() => setEditOpen(true)}
            className="gap-2 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
            variant="outline"
          >
            <Edit className="h-4 w-4" />
            Edit Institution
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              {isUniversity ? (
                <Building2 className="h-6 w-6 text-blue-600" />
              ) : (
                <School className="h-6 w-6 text-blue-600" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Type
              </p>
              <p className="mt-1 truncate text-lg font-bold leading-none">
                {isUniversity ? "College/University" : "School"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <LayoutGrid className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active Modules
              </p>
              <p className="mt-1 text-lg font-bold leading-none">
                {activeModules.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <CalendarDays className="h-6 w-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Weekend Days
              </p>
              <p className="mt-1 text-lg font-bold leading-none">
                {weekendDays.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-50">
              <Shield className="h-6 w-6 text-violet-600" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Status
              </p>
              <p className="mt-1 text-lg font-bold leading-none text-emerald-600">
                {institution.is_setup_completed ? "Completed" : "Pending"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contact Information */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Globe className="h-5 w-5 text-muted-foreground" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <MapPin className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Address
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {institution.address || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                <Phone className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {institution.phone || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
                <Mail className="h-4 w-4 text-amber-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </p>
                <p className="mt-0.5 text-sm font-medium text-foreground">
                  {institution.email || "Not provided"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                <Palette className="h-4 w-4 text-violet-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Color Theme
                </p>
                <div className="mt-1 flex items-center gap-2">
                  {institution.color_scheme ? (
                    <>
                      <div
                        className="h-5 w-5 rounded-full border border-border shadow-sm"
                        style={{ backgroundColor: institution.color_scheme }}
                      />
                      <span className="text-sm font-medium text-foreground font-mono">
                        {institution.color_scheme}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekend Days & Schedule */}
        <Card className="border-border/50 shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Clock className="h-5 w-5 text-muted-foreground" />
              Schedule & Modules
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekend Days */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Weekend Days
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries({
                  SUNDAY: "Sun",
                  MONDAY: "Mon",
                  TUESDAY: "Tue",
                  WEDNESDAY: "Wed",
                  THURSDAY: "Thu",
                  FRIDAY: "Fri",
                  SATURDAY: "Sat",
                }).map(([key, label]) => {
                  const isWeekend = weekendDays.includes(key);
                  return (
                    <div
                      key={key}
                      className={`flex h-10 w-12 items-center justify-center rounded-lg border-2 text-xs font-semibold transition-all ${
                        isWeekend
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-muted/50 text-muted-foreground"
                      }`}
                    >
                      {label}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Modules */}
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Active Modules
              </p>
              <div className="flex flex-wrap gap-2">
                {activeModules.length > 0 ? (
                  activeModules.map((mod: string) => (
                    <Badge
                      key={mod}
                      variant="secondary"
                      className={`gap-1.5 px-3 py-1 text-xs font-semibold ${MODULE_COLORS[mod] ?? "bg-gray-100 text-gray-700"}`}
                    >
                      <Check className="h-3 w-3" />
                      {MODULE_LABELS[mod] ?? mod}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No modules active</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Info */}
        <Card className="border-border/50 shadow-sm lg:col-span-2">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <Shield className="h-5 w-5 text-muted-foreground" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Institution ID
                </p>
                <p className="mt-1 font-mono text-sm font-medium text-foreground">
                  {institution.id}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Created
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDate(institution.created_at)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Last Updated
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {formatDateTime(institution.updated_at)}
                </p>
              </div>
              <div className="rounded-xl border border-border/50 bg-muted/30 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Setup Status
                </p>
                <div className="mt-1">
                  <Badge
                    variant="secondary"
                    className={
                      institution.is_setup_completed
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }
                  >
                    {institution.is_setup_completed ? "Completed" : "Pending"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <InstitutionEditDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        institution={institution}
      />
    </>
  );
};

export default InstitutionDetail;
