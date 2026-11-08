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
import type { ExpenseMonth } from "./types/expenseReport";

interface ExpenseMonthlyBarChartProps {
  data: ExpenseMonth[];
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

export function ExpenseMonthlyBarChart({ data }: ExpenseMonthlyBarChartProps) {
  const chartData = data.map((month) => ({
    name: MONTH_NAMES[Number(month.month.split("-")[1]) - 1] ?? month.month,
    totalAmount: month.totalAmount,
    expenseCount: month.expenseCount,
  }));

  const hasData = chartData.length > 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">
          Monthly Expense Trend
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
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "totalAmount") {
                      return [`৳${formatAmount(Number(value ?? 0))}`, "Amount"];
                    }
                    return [String(value ?? 0), "Entries"];
                  }}
                />
                <Bar
                  dataKey="totalAmount"
                  name="totalAmount"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}