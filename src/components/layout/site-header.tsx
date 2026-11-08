"use client";

import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { findNavItemByPath } from "@/config/nav-config";


export function SiteHeader() {
  const pathname = usePathname();
  const activeItem = findNavItemByPath(pathname);

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b border-slate-200 bg-white/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="text-sm font-medium text-slate-900">{activeItem?.title ?? "Dashboard"}</h1>
    </header>
  );
}
