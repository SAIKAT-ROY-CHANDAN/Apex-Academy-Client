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

interface BarChartCardProps {
  title: string;
  data: Array<Record<string, string | number>>;
  bars: Array<{ dataKey: string; name: string; fill: string; radius?: [number, number, number, number] }>;
  layout?: "vertical" | "horizontal";
  xDataKey?: string;
  yDataKey?: string;
}

export function BarChartCard({
  title,
  data,
  bars,
  layout = "vertical",
  xDataKey = "name",
  yDataKey = "count",
}: BarChartCardProps) {
  const hasData = data.length > 0;

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-sm font-medium text-slate-700">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="flex h-64 items-center justify-center text-sm text-slate-400">
            No data available
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout={layout} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                {layout === "vertical" ? (
                  <>
                    <XAxis dataKey={xDataKey} tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                  </>
                ) : (
                  <>
                    <XAxis type="number" tick={{ fontSize: 12 }} />
                    <YAxis type="category" dataKey={yDataKey} width={100} tick={{ fontSize: 12 }} />
                  </>
                )}
                <Tooltip />
                {bars.length > 1 && <Legend />}
                {bars.map((bar) => (
                  <Bar
                    key={bar.dataKey}
                    dataKey={bar.dataKey}
                    name={bar.name}
                    fill={bar.fill}
                    radius={bar.radius ?? [4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}