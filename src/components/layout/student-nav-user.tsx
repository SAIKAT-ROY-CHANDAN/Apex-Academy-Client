"use client";

import { useRouter } from "next/navigation";
import { LogOut, ChevronsUpDown, UserCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { logoutUser } from "@/services/logged-user";

type StudentNavUserProps = {
  user: { name: string; email: string; userType: string };
};

export function StudentNavUser({ user }: StudentNavUserProps) {
  const router = useRouter();
  const { isMobile } = useSidebar();

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "ST";

  const handleLogout = async () => {
    await logoutUser();
    router.push("/student-login");
    router.refresh();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="data-[state=open]:bg-slate-100">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-slate-900 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-slate-500">{user.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-slate-400" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="w-56">
            <DropdownMenuItem onClick={() => router.push("/student-dashboard/profile")}>
              <UserCircle className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}