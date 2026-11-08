"use client";

import { Permission } from "@/constant/permissions";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

type PermissionContextValue = {
  permissions: Permission[];
  isLoading: boolean;
  can: (permission: Permission | string) => boolean;
  canAny: (permissionList: (Permission | string)[]) => boolean;
  canAll: (permissionList: (Permission | string)[]) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | null>(null);

type PermissionProviderProps = {
  permissions: Permission[];
  isLoading?: boolean;
  children: ReactNode;
};

export function PermissionProvider({
  permissions,
  isLoading = false,
  children,
}: PermissionProviderProps) {
  const permissionSet = useMemo(() => new Set(permissions), [permissions]);

  const can = useCallback(
    (permission: Permission | string) => permissionSet.has(permission as Permission),
    [permissionSet],
  );

  const canAny = useCallback(
    (permissionList: (Permission | string)[]) =>
      permissionList.some((permission) => permissionSet.has(permission as Permission)),
    [permissionSet],
  );

  const canAll = useCallback(
    (permissionList: (Permission | string)[]) =>
      permissionList.every((permission) => permissionSet.has(permission as Permission)),
    [permissionSet],
  );

  const value = useMemo(
    () => ({
      permissions,
      isLoading,
      can,
      canAny,
      canAll,
    }),
    [permissions, isLoading, can, canAny, canAll],
  );

  return (
    <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionContext);

  if (!context) {
    throw new Error("usePermissions must be used within a PermissionProvider.");
  }

  return context;
}
