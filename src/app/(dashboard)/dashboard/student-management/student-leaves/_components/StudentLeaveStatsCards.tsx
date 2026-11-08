import { Card, CardContent } from "@/components/ui/card";

type Stats = { total: number; pending: number; approved: number; rejected: number };

const cards = (stats: Stats) => [
  { label: "Total", value: stats.total, icon: "📋", cls: "bg-blue-50 text-blue-600 border-blue-100", iconBg: "bg-blue-100" },
  { label: "Pending", value: stats.pending, icon: "⏳", cls: "bg-amber-50 text-amber-600 border-amber-100", iconBg: "bg-amber-100" },
  { label: "Approved", value: stats.approved, icon: "✅", cls: "bg-green-50 text-green-600 border-green-100", iconBg: "bg-green-100" },
  { label: "Rejected", value: stats.rejected, icon: "❌", cls: "bg-red-50 text-red-600 border-red-100", iconBg: "bg-red-100" },
];

const StudentLeaveStatsCards = ({ stats }: { stats: Stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards(stats).map((c) => (
        <Card key={c.label} className={`border ${c.cls}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{c.label}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
              </div>
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-lg ${c.iconBg}`}>{c.icon}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StudentLeaveStatsCards;
