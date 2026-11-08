import { Briefcase, Wallet } from "lucide-react";

export const PAYROLL_CARDS = [
  {
    section: "Teachers",
    description:
      "Payroll, overtime, allowances and salary processing for teachers.",
    icon: Wallet,
    accentClass: "bg-sky-100 text-sky-600",
    cards: [
      {
        name: "Teacher's Payroll",
        href: "/dashboard/payroll/teachers-payroll",
        color: {
          bg: "from-sky-500 to-blue-600",
          lightBg: "bg-sky-50",
          iconBg: "bg-sky-100",
          iconColor: "text-sky-600",
          hoverBg: "group-hover:from-sky-600 group-hover:to-blue-700",
        },
      },
    ],
  },
  {
    section: "Staffs",
    description:
      "Payroll, overtime and monthly compensation for staff members.",
    icon: Briefcase,
    accentClass: "bg-amber-100 text-amber-600",
    cards: [
      {
        name: "Staff's Payroll",
        href: "/dashboard/payroll/staff-payroll",
        color: {
          bg: "from-amber-500 to-orange-600",
          lightBg: "bg-amber-50",
          iconBg: "bg-amber-100",
          iconColor: "text-amber-600",
          hoverBg: "group-hover:from-amber-600 group-hover:to-orange-700",
        },
      },
    ],
  },
];
