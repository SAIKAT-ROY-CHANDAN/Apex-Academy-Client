import {
  BarChart3,
  Building2,
  Receipt,
  Settings,
  Wallet,
} from "lucide-react";

const CARD_COLORS = [
  {
    bg: "from-indigo-500 to-indigo-600",
    lightBg: "bg-indigo-50",
    iconBg: "bg-indigo-100",
    iconColor: "text-indigo-600",
    hoverBg: "group-hover:from-indigo-600 group-hover:to-indigo-700",
  },
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
    bg: "from-amber-500 to-amber-600",
    lightBg: "bg-amber-50",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    hoverBg: "group-hover:from-amber-600 group-hover:to-amber-700",
  },
  {
    bg: "from-violet-500 to-violet-600",
    lightBg: "bg-violet-50",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
    hoverBg: "group-hover:from-violet-600 group-hover:to-violet-700",
  },
];

export const HOSTEL_CARDS = [
  {
    section: "Hostel Management",
    description:
      "Configure hostel settings, manage occupancy, track deposits and expenses.",
    icon: Building2,
    accentClass: "bg-blue-100 text-blue-600",
    cards: [
      {
        name: "Hostel Configuration",
        href: "/dashboard/hostel/configuration",
        icon: Settings,
        color: CARD_COLORS[0],
      },
      {
        name: "Manage Hostel",
        href: "/dashboard/hostel/manage",
        icon: Building2,
        color: CARD_COLORS[1],
      },
      {
        name: "Hostel Deposited",
        href: "/dashboard/hostel/deposited",
        icon: Wallet,
        color: CARD_COLORS[2],
      },
      {
        name: "Hostel Expense",
        href: "/dashboard/hostel/expense",
        icon: Receipt,
        color: CARD_COLORS[3],
      },
      {
        name: "Report",
        href: "/dashboard/hostel/report",
        icon: BarChart3,
        color: CARD_COLORS[4],
      },
    ],
  },
];
