"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { StudentDue } from "./types/dueReport";

interface DueAmountByClassChartProps {
  students: StudentDue[];
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export function DueAmountByClassChart({ students }: DueAmountByClassChartProps) {
  const chartData = students.reduce(
    (acc: Record<string, { class: string; due: number; count: number }>, student) => {
      const key = student.class_name || "Unassigned";
      if (!acc[key]) {
        acc[key] = { class: key, due: 0, count: 0 };
      }
      acc[key].due += student.dueAmount;
      acc[key].count += 1;
      return acc;
    },
    {},
  );

  const data = Object.values(chartData).sort((a, b) => b.due - a.due);

  const hasData = data.length > 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Due Amount by Class
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="class"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={150}
                />
                <Tooltip
                  formatter={(value) => [
                    `৳${formatAmount(Number(value ?? 0))}`,
                    "Due Amount",
                  ]}
                />
                <Bar
                  dataKey="due"
                  name="due"
                  fill="#f43f5e"
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
