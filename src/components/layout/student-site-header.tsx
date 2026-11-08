"use client";

import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { findStudentNavItemByPath } from "@/config/student-nav-config";

export function StudentSiteHeader() {
  const pathname = usePathname();
  const activeItem = findStudentNavItemByPath(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium text-slate-900">{activeItem?.title ?? "Dashboard"}</h1>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-slate-500 hover:text-slate-900">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}