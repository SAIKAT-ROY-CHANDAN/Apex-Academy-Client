import {
  CalendarCheck,
  ClipboardList,
  FileCheck2,
  LogOut,
  NotebookPen,
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
];

export type FeatureColor = (typeof CARD_COLORS)[number];

export type TeacherFeature = {
  name: string;
  icon: React.ReactNode;
  href: string;
  color: FeatureColor;
};

const TEACHER_FEATURES: TeacherFeature[] = [
  {
    name: "Class/Year Routine",
    icon: <ClipboardList className="h-5 w-5" />,
    href: "/teacher/class-routine",
    color: CARD_COLORS[0],
  },
  {
    name: "Attendance",
    icon: <CalendarCheck className="h-5 w-5" />,
    href: "/teacher/attendance",
    color: CARD_COLORS[1],
  },
  {
    name: "Daily Homework",
    icon: <NotebookPen className="h-5 w-5" />,
    href: "/teacher/home-work",
    color: CARD_COLORS[2],
  },
  {
    name: "Give Result",
    icon: <FileCheck2 className="h-5 w-5" />,
    href: "/teacher/give-result",
    color: CARD_COLORS[3],
  },
  {
    name: "Leave Request",
    icon: <LogOut className="h-5 w-5" />,
    href: "/teacher/leave-request",
    color: CARD_COLORS[4],
  },
  {
    name: "Resignation Request",
    icon: <LogOut className="h-5 w-5" />,
    href: "/teacher/resignation-request",
    color: CARD_COLORS[4],
  }
];

export default TEACHER_FEATURES;