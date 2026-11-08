import { Card, CardContent } from "@/components/ui/card";
import { Wallet, Users, AlertCircle, ReceiptText } from "lucide-react";

interface DueSummaryCardsProps {
  totalDueAmount: number;
  totalStudentsWithDue: number;
  totalLineAmount: number;
  totalPaidAmount: number;
}

const formatAmount = (value: number) =>
  new Intl.NumberFormat("en-US").format(value);

const CARD_STYLES = [
  {
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  {
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  {
    iconBg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
];

export function DueSummaryCards({
  totalDueAmount,
  totalStudentsWithDue,
  totalLineAmount,
  totalPaidAmount,
}: DueSummaryCardsProps) {
  const cards = [
    {
      label: "Total Due Amount",
      value: `৳${formatAmount(totalDueAmount)}`,
      icon: Wallet,
      styles: CARD_STYLES[0],
    },
    {
      label: "Students With Due",
      value: formatAmount(totalStudentsWithDue),
      icon: Users,
      styles: CARD_STYLES[1],
    },
    {
      label: "Total Amount",
      value: `৳${formatAmount(totalLineAmount)}`,
      icon: ReceiptText,
      styles: CARD_STYLES[2],
    },
    {
      label: "Total Paid Amount",
      value: `৳${formatAmount(totalPaidAmount)}`,
      icon: AlertCircle,
      styles: CARD_STYLES[3],
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, icon: Icon, styles }) => (
        <Card
          key={label}
          className="overflow-hidden border-slate-200/90 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
        >
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium leading-snug text-slate-600">
                {label}
              </p>
              <p className="mt-1 text-xl font-bold tracking-tight text-slate-900">
                {value}
              </p>
            </div>

            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${styles.iconBg} ${styles.iconColor}`}
            >
              <Icon className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}