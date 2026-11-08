"use client";

import type { ReactNode } from "react";
import { usePermissions } from "@/components/providers/permission-provider";
import { ShieldAlert } from "lucide-react";
import { Permission } from "@/constant/permissions";

type RequirePermissionProps = {
  /** Single permission key to check */
  permission?: Permission | string;
  /** Multiple permissions — user needs ANY of these */
  anyOf?: (Permission | string)[];
  /** Multiple permissions — user needs ALL of these */
  allOf?: (Permission | string)[];
  /** Content shown when permission is granted */
  children: ReactNode;
  /** Custom fallback when permission is denied (default: nothing) */
  fallback?: ReactNode;
  /** If true, show a styled "no access" card instead of hiding */
  showDenied?: boolean;
};

/**
 * Conditionally renders children based on the user's permissions.
 */
export function RequirePermission({
  permission,
  anyOf,
  allOf,
  children,
  fallback,
  showDenied = false,
}: RequirePermissionProps) {
  const { can, canAny, canAll } = usePermissions();

  let allowed = true;

  if (permission) {
    allowed = can(permission);
  } else if (anyOf && anyOf.length > 0) {
    allowed = canAny(anyOf);
  } else if (allOf && allOf.length > 0) {
    allowed = canAll(allOf);
  }

  if (allowed) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (showDenied) {
    return <PermissionDeniedCard />;
  }

  return null;
}

function PermissionDeniedCard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-muted/30 p-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
        <ShieldAlert className="h-6 w-6 text-destructive" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        You don&apos;t have permission to view this section.
      </p>
      <p className="mt-1 text-xs text-muted-foreground/70">
        Contact your administrator to request access.
      </p>
    </div>
  );
}
