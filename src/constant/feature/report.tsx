import {
  BanknoteArrowDown,
  BanknoteArrowUp,
  HandCoins,
  Wallet,
} from "lucide-react";

const CARD_COLORS = [
  {
    bg: "from-blue-500 to-blue-600",
    lightBg: "bg-blue-50",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    hoverBg: "group-hover:from-blue-600 group-hover:to-blue-700",
  },
  {
    bg: "from-emerald-500 to-emerald-600",
    lightBg: "bg-emerald-50",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    hoverBg: "group-hover:from-emerald-600 group-hover:to-emerald-700",
  },
  {
    bg: "from-violet-500 to-violet-600",
    lightBg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    hoverBg: "group-hover:from-violet-600 group-hover:to-violet-700",
  },
  {
    bg: "from-amber-500 to-amber-600",
    lightBg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    hoverBg: "group-hover:from-amber-600 group-hover:to-amber-700",
  },
];

export type FeatureColor = (typeof CARD_COLORS)[number];

export type ReportFeature = {
  name: string;
  icon: React.ReactNode;
  href: string;
  color: FeatureColor;
};

const REPORT_FEATURES: ReportFeature[] = [
  {
    name: "Organization Expense Analytics",
    icon: <BanknoteArrowDown className="h-5 w-5" />,
    href: "/dashboard/finance/reports/organization-expense-analytics",
    color: CARD_COLORS[0],
  },
  {
    name: "Organization Deposit Analytics",
    icon: <BanknoteArrowUp className="h-5 w-5" />,
    href: "/dashboard/finance/reports/organization-deposit-analytics",
    color: CARD_COLORS[1],
  },
  {
    name: "Student Collection Analytics",
    icon: <HandCoins className="h-5 w-5" />,
    href: "/dashboard/finance/reports/student-collection-analytics",
    color: CARD_COLORS[2],
  },
  {
    name: "Student Due Amount Analytics",
    icon: <Wallet className="h-5 w-5" />,
    href: "/dashboard/finance/reports/student-due-amount-analytics",
    color: CARD_COLORS[3],
  },
];

export default REPORT_FEATURES;