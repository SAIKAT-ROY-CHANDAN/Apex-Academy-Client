// ── Category labels ──────────────────────────────────────────────────
export const CATEGORY_LABELS: Record<string, string> = {
  administration: "Administration",
  settings: "Settings",
  academics: "Academics",
  students: "Students",
  teachers: "Teachers",
  staff: "Staff",
  finance: "Finance",
  hostel: "Hostel",
  quarter: "Quarter",
  transport: "Transport",
  library: "Library",
  complaints: "Complaints",
  feedback: "Feedback",
};

// ── Category icons ────────────────────────────────────────────────────
import {
  BedDouble,
  BookOpen,
  Briefcase,
  Building2,
  Bus,
  Eye,
  Folder,
  GraduationCap,
  type LucideIcon,
  MessageSquare,
  MessageSquareWarning,
  Pencil,
  Plus,
  Presentation,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Users,
  Wallet,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  administration: ShieldCheck,
  settings: Settings,
  academics: GraduationCap,
  students: Users,
  teachers: Presentation,
  staff: Briefcase,
  finance: Wallet,
  hostel: BedDouble,
  quarter: Building2,
  transport: Bus,
  library: BookOpen,
  complaints: MessageSquareWarning,
  feedback: MessageSquare,
};

export function getCategoryIcon(categoryKey: string): LucideIcon {
  return CATEGORY_ICONS[categoryKey] ?? Folder;
}

// ── Action labels ─────────────────────────────────────────────────────
export const ACTION_LABELS: Record<string, string> = {
  create: "Create",
  view: "View",
  edit: "Edit",
  delete: "Delete",
  manage: "Manage",
};

// ── Action icons ──────────────────────────────────────────────────────
export const ACTION_ICONS: Record<string, LucideIcon> = {
  view: Eye,
  create: Plus,
  edit: Pencil,
  delete: Trash2,
  manage: SlidersHorizontal,
};

export function getActionIcon(actionKey: string): LucideIcon {
  return ACTION_ICONS[actionKey] ?? ShieldCheck;
}

// ── Category color mapping ────────────────────────────────────────────
export type CategoryColor = {
  dot: string;
  text: string;
  bg: string;
  border: string;
  ring: string;
};

export const CATEGORY_COLORS: Record<string, CategoryColor> = {
  administration: {
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/20",
    border: "border-blue-200 dark:border-blue-800/40",
    ring: "ring-blue-500/20",
  },
  settings: {
    dot: "bg-slate-500",
    text: "text-slate-600 dark:text-slate-400",
    bg: "bg-slate-50 dark:bg-slate-950/20",
    border: "border-slate-200 dark:border-slate-800/40",
    ring: "ring-slate-500/20",
  },
  academics: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950/20",
    border: "border-emerald-200 dark:border-emerald-800/40",
    ring: "ring-emerald-500/20",
  },
  students: {
    dot: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
    bg: "bg-violet-50 dark:bg-violet-950/20",
    border: "border-violet-200 dark:border-violet-800/40",
    ring: "ring-violet-500/20",
  },
  teachers: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950/20",
    border: "border-amber-200 dark:border-amber-800/40",
    ring: "ring-amber-500/20",
  },
  staff: {
    dot: "bg-orange-500",
    text: "text-orange-600 dark:text-orange-400",
    bg: "bg-orange-50 dark:bg-orange-950/20",
    border: "border-orange-200 dark:border-orange-800/40",
    ring: "ring-orange-500/20",
  },
  finance: {
    dot: "bg-rose-500",
    text: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-50 dark:bg-rose-950/20",
    border: "border-rose-200 dark:border-rose-800/40",
    ring: "ring-rose-500/20",
  },
  hostel: {
    dot: "bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
    bg: "bg-cyan-50 dark:bg-cyan-950/20",
    border: "border-cyan-200 dark:border-cyan-800/40",
    ring: "ring-cyan-500/20",
  },
  quarter: {
    dot: "bg-teal-500",
    text: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-50 dark:bg-teal-950/20",
    border: "border-teal-200 dark:border-teal-800/40",
    ring: "ring-teal-500/20",
  },
  transport: {
    dot: "bg-indigo-500",
    text: "text-indigo-600 dark:text-indigo-400",
    bg: "bg-indigo-50 dark:bg-indigo-950/20",
    border: "border-indigo-200 dark:border-indigo-800/40",
    ring: "ring-indigo-500/20",
  },
  library: {
    dot: "bg-yellow-500",
    text: "text-yellow-600 dark:text-yellow-400",
    bg: "bg-yellow-50 dark:bg-yellow-950/20",
    border: "border-yellow-200 dark:border-yellow-800/40",
    ring: "ring-yellow-500/20",
  },
  complaints: {
    dot: "bg-red-500",
    text: "text-red-600 dark:text-red-400",
    bg: "bg-red-50 dark:bg-red-950/20",
    border: "border-red-200 dark:border-red-800/40",
    ring: "ring-red-500/20",
  },
  feedback: {
    dot: "bg-pink-500",
    text: "text-pink-600 dark:text-pink-400",
    bg: "bg-pink-50 dark:bg-pink-950/20",
    border: "border-pink-200 dark:border-pink-800/40",
    ring: "ring-pink-500/20",
  },
};

export function getCategoryColor(categoryKey: string): CategoryColor {
  return (
    CATEGORY_COLORS[categoryKey] ?? {
      dot: "bg-gray-500",
      text: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-gray-950/20",
      border: "border-gray-200 dark:border-gray-800/40",
      ring: "ring-gray-500/20",
    }
  );
}

// ── Utility: capital case ─────────────────────────────────────────────
export function capitalCase(str: string): string {
  return str
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

// ── Model label map ───────────────────────────────────────────────────
const MODEL_LABEL_MAP: Record<string, string> = {
  userRole: "User Role",
  rolePermission: "Role Permission",
  institutionConfig: "Institution Config",
  feeType: "Fee Type",
  feeItem: "Fee Item",
  designationBasedSalary: "Designation Based Salary",
  customSalary: "Custom Salary",
  overtimeTeacherConfig: "Overtime Teacher Config",
  overtimeStaffConfig: "Overtime Staff Config",
  academicSession: "Academic Session",
  academicClass: "Academic Class",
  academicSection: "Academic Section",
  academicClassSubject: "Academic Class Subject",
  examConfig: "Exam Config",
  examSchedule: "Exam Schedule",
  gradeSystem: "Grade System",
  classRoutine: "Class Routine",
  classRoutineItem: "Class Routine Item",
  studentEnrollment: "Student Enrollment",
  studentFee: "Student Fee",
  studentFeeCollection: "Student Fee Collection",
  studentFeeCollectionItem: "Student Fee Collection Item",
  idCardGenerateLog: "ID Card Generate Log",
  admitCardLog: "Admit Card Log",
  studentExamResult: "Student Exam Result",
  studentAttendance: "Student Attendance",
  studentLibraryMember: "Student Library Member",
  teacherAttendance: "Teacher Attendance",
  teacherLeaveRequest: "Teacher Leave Request",
  teacherOvertime: "Teacher Overtime",
  teacherResignation: "Teacher Resignation",
  teacherPayroll: "Teacher Payroll",
  salaryAdvance: "Salary Advance",
  staffAttendance: "Staff Attendance",
  staffLeave: "Staff Leave",
  staffOvertime: "Staff Overtime",
  staffResignation: "Staff Resignation",
  staffPayroll: "Staff Payroll",
  payrollCycle: "Payroll Cycle",
  payrollPayment: "Payroll Payment",
  expenseType: "Expense Type",
  expenseItem: "Expense Item",
  depositType: "Deposit Type",
  depositItem: "Deposit Item",
  hostelConfiguration: "Hostel Configuration",
  hostelFloor: "Hostel Floor",
  hostelRoom: "Hostel Room",
  hostelAllocation: "Hostel Allocation",
  hostelFeeCollection: "Hostel Fee Collection",
  hostelFeeCollectionItem: "Hostel Fee Collection Item",
  mealCollection: "Meal Collection",
  hostelExpense: "Hostel Expense",
  hostelExpenseItem: "Hostel Expense Item",
  quarterConfiguration: "Quarter Configuration",
  quarterFloor: "Quarter Floor",
  quarterFlat: "Quarter Flat",
  quarterAllocation: "Quarter Allocation",
  quarterRentCollection: "Quarter Rent Collection",
  quarterExpense: "Quarter Expense",
  quarterExpenseItem: "Quarter Expense Item",
  vehicleDriver: "Vehicle Driver",
  vehicleConfiguration: "Vehicle Configuration",
  vehicleChecking: "Vehicle Checking",
  vehicleExpense: "Vehicle Expense",
  vehicleExpenseItem: "Vehicle Expense Item",
  vehicleVendor: "Vehicle Vendor",
  vendorVehicleConfiguration: "Vendor Vehicle Configuration",
  vendorVehicleChecking: "Vendor Vehicle Checking",
  vendorVehicleExpense: "Vendor Vehicle Expense",
  vendorVehicleExpenseItem: "Vendor Vehicle Expense Item",
  bookShelfConfiguration: "Book Shelf Configuration",
  bookCategory: "Book Category",
  membershipFeeCollection: "Membership Fee Collection",
  borrowedBook: "Borrowed Book",
  libraryExpense: "Library Expense",
  libraryExpenseItem: "Library Expense Item",
  libraryDeposit: "Library Deposit",
  feedbackForm: "Feedback Form",
  feedbackQuestion: "Feedback Question",
  feedbackResponse: "Feedback Response",
  feedbackAnswer: "Feedback Answer",
};

export function modelLabel(key: string): string {
  return MODEL_LABEL_MAP[key] ?? capitalCase(key);
}
