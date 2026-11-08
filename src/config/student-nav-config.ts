import type { LucideIcon } from "lucide-react";
import {
  BedDouble,
  BookOpen,
  Calendar,
  CalendarCheck,
  GraduationCap,
  LayoutDashboard,
  UserCircle,
} from "lucide-react";

export type StudentNavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
};

export type StudentNavSection = {
  id: string;
  label: string;
  items: StudentNavItem[];
};

export const studentNavSections: StudentNavSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      { title: "Overview", url: "/student-dashboard", icon: LayoutDashboard },
      {
        title: "My Profile",
        url: "/student-dashboard/profile",
        icon: UserCircle,
      },
    ],
  },
  {
    id: "academics",
    label: "Academics",
    items: [
      // { title: "My Classes", url: "/student-dashboard/classes", icon: BookOpen },
      {
        title: "Hostel Payment",
        url: "/hostel-payment",
        icon: BedDouble,
      },
      {
        title: "My Home-work",
        url: "/student-dashboard/homework",
        icon: BookOpen,
      },
      {
        title: "My Results",
        url: "/student-dashboard/results",
        icon: GraduationCap,
      },
      {
        title: "Attendance",
        url: "/student-dashboard/attendance",
        icon: CalendarCheck,
      },
      {
        title: "Class Routine",
        url: "/student-dashboard/class-routine",
        icon: Calendar,
      },
      {
        title: "Leave Request",
        url: "/student-dashboard/leave-request",
        icon: Calendar,
      }
    ],
  },
];

/** Flat list of every student nav item, used for breadcrumb / page-title lookups. */
const allStudentNavItems: StudentNavItem[] = studentNavSections.flatMap(
  (section) => section.items,
);

export function findStudentNavItemByPath(
  pathname: string,
): StudentNavItem | undefined {
  const exact = allStudentNavItems.find((item) => item.url === pathname);
  if (exact) return exact;

  return allStudentNavItems
    .filter(
      (item) =>
        item.url !== "/student-dashboard" &&
        pathname.startsWith(`${item.url}/`),
    )
    .sort((a, b) => b.url.length - a.url.length)[0];
}
