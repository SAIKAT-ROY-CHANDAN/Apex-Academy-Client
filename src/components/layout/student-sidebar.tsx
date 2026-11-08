"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import logo from "@/assets/institution/logo.svg";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { StudentNavUser } from "@/components/layout/student-nav-user";
import { studentNavSections } from "@/config/student-nav-config";
import Image from "next/image";

type StudentSidebarProps = {
  user: { id: string; name: string; email: string; userType: string };
};

export function StudentSidebar({ user }: StudentSidebarProps) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = usePathname();

  const isActive = (url: string) =>
    pathname === url ||
    (url !== "/student-dashboard" && pathname.startsWith(`${url}/`));

  const renderGroup = (
    label: string,
    items: typeof studentNavSections[number]["items"],
  ) => {
    return (
      <SidebarGroup key={label}>
        {!collapsed && (
          <SidebarGroupLabel className="px-3 pt-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/70">
            {label}
          </SidebarGroupLabel>
        )}
        <SidebarGroupContent>
          <SidebarMenu className="gap-0.5">
            {items.map((item) => {
              const active = isActive(item.url);
              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton
                    isActive={active}
                    tooltip={item.title}
                    className="group h-10 rounded-xl px-3 text-[0.9rem] font-medium text-sidebar-foreground/80 transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-primary data-[active=true]:shadow-soft"
                    render={<Link href={item.url} />}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors ${
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-glow"
                          : "bg-sidebar-accent/60 text-sidebar-foreground/70 group-hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    {!collapsed && <span className="truncate">{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border/70">
      <SidebarHeader className="px-3 pb-2 pt-4">
         <Link href="/student-dashboard" className="flex items-center gap-2.5 px-2">
          <div className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <Image src={logo} alt="Institution Logo" width={36} height={36} />
          </div>
          {!collapsed && (
            <div className="min-w-0 leading-tight">
              <div className="font-display text-[1.05rem] font-semibold tracking-tight">
                BHEC
              </div>
              <div className="truncate text-[0.72rem] text-sidebar-foreground/70">
                Apex International College
              </div>
            </div>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent className="px-2 pb-4">
        {studentNavSections.map((section) =>
          renderGroup(section.label, section.items),
        )}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border/70 p-3">
        <StudentNavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}