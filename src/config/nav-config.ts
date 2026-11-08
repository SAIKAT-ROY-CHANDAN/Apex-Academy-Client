import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  ClipboardCheck,
  Globe,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  UserCircle,
  Users,
  Wallet,
} from "lucide-react";
import {
  collectPermissions,
  type Permission,
  permissions,
} from "@/constant/permissions";

export type NavItem = {
  title: string;
  url: string;
  icon: LucideIcon;
  /** Omit for items every logged-in admin should see (e.g. Overview, My Account). */
  permissions?: Permission[];
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

// Small local helper so we don't need to cast collectPermissions' return type at every call site.
const group = (value: unknown) => collectPermissions(value) as Permission[];

export const navSections: NavSection[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    items: [
      { title: "Overview", url: "/dashboard", icon: LayoutDashboard },
      {
        title: "Student Management",
        url: "/dashboard/student-management",
        icon: GraduationCap,
        permissions: group(permissions.students),
      },
      {
        title: "Student Approvals",
        url: "/dashboard/student-management/student-approval",
        icon: ClipboardCheck,
        permissions: [permissions.students.studentApproval.manage],
      },
      {
        title: "Employee Management",
        url: "/dashboard/employees",
        icon: Users,
        permissions: [
          ...group(permissions.teachers),
          ...group(permissions.staff),
        ],
      },
      {
        title: "Academic Department",
        url: "/dashboard/academics",
        icon: BookOpen,
        permissions: group(permissions.academics),
      },
      {
        title: "Payroll & Overtime",
        url: "/dashboard/payroll",
        icon: Wallet,
        permissions: [
          permissions.finance.payrollCycle.view,
          permissions.finance.payrollPayment.view,
          permissions.teachers.teacherPayroll.view,
          permissions.staff.staffPayroll.view,
          permissions.teachers.teacherOvertime.view,
          permissions.staff.staffOvertime.view,
          permissions.academics.overtimeTeacherConfig.view,
          permissions.academics.overtimeStaffConfig.view,
        ],
      },
      {
        title: "Accounting & Finance",
        url: "/dashboard/finance",
        icon: Landmark,
        permissions: group(permissions.finance),
      },
      {
        title: "Hostel Management",
        url: "/dashboard/hostel",
        icon: Building2,
        permissions: group(permissions.hostel),
      },
      {
        // No backend permission group exists for this yet — visible to everyone
        // until you add one (e.g. permissions.announcement) on the backend.
        title: "Message & Announcement",
        url: "/dashboard/messages",
        icon: MessageSquare,
      },
    ],
  },
  {
    id: "accounts",
    label: "Accounts",
    items: [
      { title: "My Account", url: "/dashboard/account", icon: UserCircle },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    items: [
      {
        title: "System Configuration",
        url: "/dashboard/settings/system",
        icon: Settings2,
        permissions: group(permissions.settings),
      },
      {
        title: "Website Settings",
        url: "/dashboard/website",
        icon: Globe,
        // No dedicated backend group yet — gated behind administrator.edit as a
        // sensible default. Swap this for a real "websiteSettings" permission
        // once the backend exposes one.
        permissions: [permissions.administration.administrator.edit],
      },
    ],
  },
];

/** Flat list of every nav item, used for breadcrumb / page-title lookups. */
const allNavItems: NavItem[] = navSections.flatMap((section) => section.items);

export function findNavItemByPath(pathname: string): NavItem | undefined {
  // Prefer an exact match, then fall back to the longest matching prefix so
  // nested routes (e.g. /dashboard/students/123) still resolve correctly.
  const exact = allNavItems.find((item) => item.url === pathname);
  if (exact) return exact;

  return allNavItems
    .filter(
      (item) =>
        item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`),
    )
    .sort((a, b) => b.url.length - a.url.length)[0];
}
