"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { LeavesData } from "@/types/dashboard/overview.type";

interface LeaveOverviewProps {
  leaves: LeavesData;
}

export function LeaveOverview({ leaves }: LeaveOverviewProps) {
  const data = [
    {
      name: "Teachers",
      Approved: leaves.teachers.approved,
      Pending: leaves.teachers.pending,
      Rejected: leaves.teachers.rejected,
    },
    {
      name: "Staff",
      Approved: leaves.staff.approved,
      Pending: leaves.staff.pending,
      Rejected: leaves.staff.rejected,
    },
  ];

  const hasData = data.some(
    (item) => item.Approved > 0 || item.Pending > 0 || item.Rejected > 0,
  );

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">Leave Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            Teacher Leaves: {leaves.teachers.total}
          </Badge>
          <Badge variant="outline" className="border-purple-200 bg-purple-50 text-purple-700">
            Staff Leaves: {leaves.staff.total}
          </Badge>
        </div>

        {!hasData ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No leave data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Approved" stackId="a" fill="#22C55E" radius={[0, 0, 0, 0]} />
                <Bar dataKey="Pending" stackId="a" fill="#EAB308" />
                <Bar dataKey="Rejected" stackId="a" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}