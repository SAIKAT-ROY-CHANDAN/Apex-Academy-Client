"use server";

import { apiRequest } from "@/lib/apiRequest";
import { revalidatePath } from "next/cache";

export const createTeacherOvertimeConfig = async (payload: {
  teacher_id: string;
  overtime_hourly_amount: number;
}) => {
  const res = await apiRequest("overtime-teacher-config", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/overtime/config");

  return res;
};

export const getTeacherOvertimeConfig = async (teacherId: string) => {
  const res = await apiRequest(`overtime-teacher-config/${teacherId}`, {
    method: "GET",
    authRequired: true,
  });
  return res;
};

export const updateTeacherOvertimeConfig = async (
  id: string | undefined,
  payload: {
    overtime_hourly_amount: number;
  },
) => {
  const res = await apiRequest(`overtime-teacher-config/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/overtime/config");
  return res;
};
