"use server";

import { apiRequest } from "@/lib/apiRequest";
import { revalidatePath } from "next/cache";

export const createStaffOvertimeConfig = async (payload: {
  staff_id: string;
  overtime_hourly_amount: number;
}) => {
  const res = await apiRequest("overtime-staff-config", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/staff-config");

  return res;
};

export const getStaffOvertimeConfig = async (staffId: string) => {
  const res = await apiRequest(`overtime-staff-config/${staffId}`, {
    method: "GET",
    authRequired: true,
  });
  return res;
};

export const updateStaffOvertimeConfig = async (
  id: string | undefined,
  payload: {
    overtime_hourly_amount: number;
  },
) => {
  const res = await apiRequest(`overtime-staff-config/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/staff-config");
  return res;
};
