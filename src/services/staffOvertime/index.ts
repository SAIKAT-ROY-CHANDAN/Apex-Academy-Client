"use server";

import { apiRequest } from "@/lib/apiRequest";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const startStaffOvertime = async (payload: FieldValues) => {
  const response = await apiRequest("staff-overtime/start", {
    method: "POST",
    body: JSON.stringify({
      staff_id: payload.staff_id,
      ...(payload.start_time ? { start_time: payload.start_time } : {}),
    }),
    authRequired: true,
  });
  revalidatePath("/dashboard/employees/staffs/attendance");
  return response;
};

export const endStaffOvertime = async (payload: FieldValues) => {
  const response = await apiRequest("staff-overtime/end", {
    method: "POST",
    body: JSON.stringify({
      staff_id: payload.staff_id,
      ...(payload.overtime_id ? { overtime_id: payload.overtime_id } : {}),
      end_time: payload.end_time ?? new Date().toISOString(),
    }),
    authRequired: true,
  });
  revalidatePath("/dashboard/employees/staffs/attendance");
  return response;
};

export const getStaffsOvertimeStatus = async (staffIds: string[]) => {
  if (staffIds.length === 0) return { success: true, data: {} };

  const response = await apiRequest("staff-overtime/today-status", {
    method: "POST",
    body: JSON.stringify({ staff_ids: staffIds }),
    authRequired: true,
  });

  return response;
};
