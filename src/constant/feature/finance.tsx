import {
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Banknote,
  CircleDollarSign,
  Landmark,
  ListChecks,
  Receipt,
  ReceiptText,
  TrendingDown,
  TrendingUp,
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
  {
    bg: "from-rose-500 to-rose-600",
    lightBg: "bg-rose-50",
    iconBg: "bg-rose-100",
    iconColor: "text-rose-600",
    hoverBg: "group-hover:from-rose-600 group-hover:to-rose-700",
  },
  {
    bg: "from-cyan-500 to-cyan-600",
    lightBg: "bg-cyan-50",
    iconBg: "bg-cyan-100",
    iconColor: "text-cyan-600",
    hoverBg: "group-hover:from-cyan-600 group-hover:to-cyan-700",
  },
  {
    bg: "from-orange-500 to-orange-600",
    lightBg: "bg-orange-50",
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
    hoverBg: "group-hover:from-orange-600 group-hover:to-orange-700",
  },
  {
    bg: "from-teal-500 to-teal-600",
    lightBg: "bg-teal-50",
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
    hoverBg: "group-hover:from-teal-600 group-hover:to-teal-700",
  },
  {
    bg: "from-pink-500 to-pink-600",
    lightBg: "bg-pink-50",
    iconBg: "bg-pink-100",
    iconColor: "text-pink-600",
    hoverBg: "group-hover:from-pink-600 group-hover:to-pink-700",
  },
  {
    bg: "from-indigo-500 to-indigo-600",
    lightBg: "bg-indigo-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    hoverBg: "group-hover:from-indigo-600 group-hover:to-indigo-700",
  },
  {
    bg: "from-lime-500 to-lime-600",
    lightBg: "bg-lime-50",
    iconBg: "bg-lime-100",
    iconColor: "text-lime-600",
    hoverBg: "group-hover:from-lime-600 group-hover:to-lime-700",
  },
  {
    bg: "from-purple-500 to-purple-600",
    lightBg: "bg-purple-50",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    hoverBg: "group-hover:from-purple-600 group-hover:to-purple-700",
  },
  {
    bg: "from-red-500 to-red-600",
    lightBg: "bg-red-50",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    hoverBg: "group-hover:from-red-600 group-hover:to-red-700",
  },
];

export type FeatureColor = (typeof CARD_COLORS)[number];

export type FinanceFeature = {
  name: string;
  icon: React.ReactNode;
  href: string;
  color: FeatureColor;
};

const FINANCE_FEATURES: FinanceFeature[] = [
  {
    name: "Expense Type",
    icon: <ListChecks className="h-5 w-5" />,
    href: "/dashboard/finance/expense-type",
    color: CARD_COLORS[0],
  },
  {
    name: "Expense",
    icon: <TrendingDown className="h-5 w-5" />,
    href: "/dashboard/finance/expense",
    color: CARD_COLORS[1],
  },
  {
    name: "Deposit Type",
    icon: <CircleDollarSign className="h-5 w-5" />,
    href: "/dashboard/finance/deposit-type",
    color: CARD_COLORS[3],
  },
  {
    name: "Deposit",
    icon: <TrendingUp className="h-5 w-5" />,
    href: "/dashboard/finance/deposit",
    color: CARD_COLORS[4],
  },
  {
    name: "Report",
    icon: <Receipt className="h-5 w-5" />,
    href: "/dashboard/finance/reports",
    color: CARD_COLORS[5],
  },
];

export default FINANCE_FEATURES;