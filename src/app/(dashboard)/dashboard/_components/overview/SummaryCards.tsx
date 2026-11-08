"use client";

import { Users, GraduationCap, Briefcase, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { SummaryData } from "@/types/dashboard/overview.type";

interface SummaryCardsProps {
  summary: SummaryData;
}

const cardConfigs = [
  { label: "Total Students", key: "totalStudents" as const, icon: GraduationCap, iconBg: "bg-blue-50", color: "text-blue-600" },
  { label: "Total Teachers", key: "totalTeachers" as const, icon: Users, iconBg: "bg-green-50", color: "text-green-600" },
  { label: "Total Staff", key: "totalStaff" as const, icon: Briefcase, iconBg: "bg-purple-50", color: "text-purple-600" },
  { label: "Student Leaves", key: "totalStudentLeaves" as const, icon: FileText, iconBg: "bg-orange-50", color: "text-orange-600" },
  { label: "Teacher Leaves", key: "totalTeacherLeaves" as const, icon: FileText, iconBg: "bg-red-50", color: "text-red-600" },
  { label: "Staff Leaves", key: "totalStaffLeaves" as const, icon: FileText, iconBg: "bg-pink-50", color: "text-pink-600" },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cardConfigs.map(({ label, key, icon: Icon, iconBg, color }) => (
        <Card key={key} className="border-slate-200 shadow-sm">
          <CardContent className="flex items-center justify-between p-5">
            <div className="space-y-1">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="text-2xl font-semibold text-slate-900">{summary[key]}</p>
            </div>
            <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", iconBg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}