import type { Permission } from "@/constant/permissions";

type PermissionsApiResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: string[];
};

/**
 * `getUserBasedPermissions()` returns your API envelope, not a bare array.
 * This unwraps it defensively so a shape change or failed request degrades
 * to "no permissions" instead of crashing the layout.
 */
export function normalizePermissions(response: unknown): Permission[] {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as PermissionsApiResponse).data)
  ) {
    return (response as PermissionsApiResponse).data as Permission[];
  }
  return [];
}
