"use client";

import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, LogOut, UserCircle, Phone } from "lucide-react";
import { logoutTeacherUser } from "@/services/logged-user";

const TeacherProfileDropdown = ({ user }: { user: { [key: string]: any } }) => {
  const router = useRouter();

  const initials =
    user.name
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part: string) => part[0]?.toUpperCase())
      .join("") || "AD";

  const handleLogout = async () => {
    await logoutTeacherUser();
    router.push("/teacher-login");
    router.refresh();
  };

  return (
    <div className="w-full">
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              className="group flex items-center gap-3 rounded-full border border-border/60 bg-card/50 py-1.5 pl-1.5 pr-3 transition-all duration-200 hover:border-primary/30 hover:bg-accent/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-open:border-primary/30 data-open:bg-accent/50"
            >
              <Avatar className="h-9 w-9 rounded-full ring-2 ring-primary/20 transition-all duration-200 group-hover:ring-primary/40">
                <AvatarFallback className="rounded-full bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold leading-tight text-foreground">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user.role || "Teacher"}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform duration-200 group-data-open:rotate-180" />
            </button>
          }
        />
        <DropdownMenuContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-64 overflow-hidden rounded-xl p-1.5"
        >
          {/* User header */}
          <div className="flex items-center gap-3 rounded-lg bg-muted/50 px-3 py-3">
            <Avatar className="h-10 w-10 rounded-full ring-2 ring-primary/20">
              <AvatarFallback className="rounded-full bg-linear-to-br from-primary to-primary/70 text-primary-foreground text-sm font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">
                {user.name}
              </p>
              <div className="mt-0.5 flex items-center gap-1.5">
                {user.role && (
                  <Badge
                    variant="secondary"
                    className="rounded-full px-2 py-0 text-[10px] font-medium"
                  >
                    {user.role}
                  </Badge>
                )}
                {user.phone && (
                  <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {user.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Menu items */}
          <DropdownMenuItem
            onClick={() => router.push("/dashboard/account")}
            className="group/item flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-accent/50"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover/item:bg-primary group-hover/item:text-primary-foreground">
              <UserCircle className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">My Profile</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1.5" />

          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            variant="destructive"
            className="group/item flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-destructive/10"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-destructive/10 text-destructive transition-colors group-hover/item:bg-destructive group-hover/item:text-destructive-foreground">
              <LogOut className="h-4 w-4" />
            </span>
            <span className="text-sm font-medium">Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default TeacherProfileDropdown;