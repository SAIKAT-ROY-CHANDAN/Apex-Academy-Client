import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { SiteHeader } from "@/components/layout/site-header";
import { PermissionProvider } from "@/components/providers/permission-provider";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { normalizePermissions } from "@/lib/normalize-permissions";
import {
  getUserBasedPermissions,
  loggedInAdminUser,
} from "@/services/logged-user";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await loggedInAdminUser();
  if (!user?.id) {
    redirect("/admin-login");
  }

  const permissionsResponse = await getUserBasedPermissions();
  const permissions = normalizePermissions(permissionsResponse);

  return (
    <PermissionProvider permissions={permissions}>
      <SidebarProvider>
        <AppSidebar
          user={{
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            avatar: user.avatar,
          }}
        />
        <SidebarInset className="min-w-0">
          <SiteHeader />
          <main className="flex-1 space-y-6 bg-slate-50/60 p-4 md:p-6">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </PermissionProvider>
  );
}
