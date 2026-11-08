import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { StudentSidebar } from "@/components/layout/student-sidebar";
import { StudentSiteHeader } from "@/components/layout/student-site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { PermissionProvider } from "@/components/providers/permission-provider";
import { normalizePermissions } from "@/lib/normalize-permissions";
import {
  getUserBasedPermissions,
  loggedInStudentUser,
} from "@/services/logged-user";

export default async function StudentLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await loggedInStudentUser();

  if (!user?.id) {
    redirect("/student-login");
  }

  const permissionsResponse = await getUserBasedPermissions();
  const permissions = normalizePermissions(permissionsResponse);

  return (
    <PermissionProvider permissions={permissions}>
      <SidebarProvider>
        <StudentSidebar
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
          }}
        />
        <SidebarInset className="min-w-0">
          <StudentSiteHeader />
          <main className="flex-1 space-y-6 bg-slate-50/60 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PermissionProvider>
  );
}