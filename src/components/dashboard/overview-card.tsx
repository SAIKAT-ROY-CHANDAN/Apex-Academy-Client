import { GraduationCap, Users, Wallet } from "lucide-react";
import { permissions } from "@/constant/permissions";
import { RequirePermission } from "../shared/require-permission";
import { StatCard } from "./stat-card";

export function OverviewCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <RequirePermission permission={permissions.students.student.view}>
        <StatCard label="Total Students" value="—" icon={GraduationCap} />
      </RequirePermission>

      <RequirePermission
        anyOf={[
          permissions.teachers.teacher.view,
          permissions.staff.staff.view,
        ]}
      >
        <StatCard label="Total Employees" value="—" icon={Users} />
      </RequirePermission>

      <RequirePermission permission={permissions.finance.payrollCycle.view}>
        <StatCard label="Active Payroll Cycle" value="—" icon={Wallet} />
      </RequirePermission>
    </div>
  );
}
