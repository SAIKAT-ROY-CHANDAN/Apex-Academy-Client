"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePermissions } from "@/components/providers/permission-provider";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { NavSection } from "@/config/nav-config";

export function NavMain({ section }: { section: NavSection }) {
  const pathname = usePathname();
  const { canAny } = usePermissions();

  const visibleItems = section.items.filter(
    (item) => !item.permissions || item.permissions.length === 0 || canAny(item.permissions),
  );

  // Don't render an empty "Settings" header if the user can't see anything under it.
  if (visibleItems.length === 0) return null;

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
      <SidebarMenu>
        {visibleItems.map((item) => {
          const isActive =
            pathname === item.url ||
            (item.url !== "/dashboard" && pathname.startsWith(`${item.url}/`));

          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link href={item.url} />}
                isActive={isActive}
                tooltip={item.title}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
