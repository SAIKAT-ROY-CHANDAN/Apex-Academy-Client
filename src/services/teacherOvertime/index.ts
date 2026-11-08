"use server";

import { apiRequest } from "@/lib/apiRequest";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const overtimeTeacher = async (payload: FieldValues) => {
  const response = await apiRequest("teacher-overtime/start", {
    method: "POST",
    body: JSON.stringify({
      teacher_id: payload.teacher_id,
      start_time: payload.start_time ?? new Date().toISOString(),
    }),
    authRequired: true,
  });
  revalidatePath("/dashboard/employees/teachers/attendance");
  return response;
};

export const startTeacherOvertime = async (payload: FieldValues) => {
  const response = await apiRequest("teacher-overtime/start", {
    method: "POST",
    body: JSON.stringify({
      teacher_id: payload.teacher_id,
      ...(payload.start_time ? { start_time: payload.start_time } : {}),
    }),
    authRequired: true,
  });
  revalidatePath("/dashboard/employees/teachers/attendance");
  return response;
};

export const endTeacherOvertime = async (payload: FieldValues) => {
  const response = await apiRequest("teacher-overtime/end", {
    method: "POST",
    body: JSON.stringify({
      teacher_id: payload.teacher_id,
      ...(payload.overtime_id ? { overtime_id: payload.overtime_id } : {}),
      end_time: payload.end_time ?? new Date().toISOString(),
    }),
    authRequired: true,
  });
  revalidatePath("/dashboard/employees/teachers/attendance");
  return response;
};

export const getTeachersOvertimeStatus = async (teacherIds: string[]) => {
  if (teacherIds.length === 0) return { success: true, data: {} };

  const response = await apiRequest("teacher-overtime/today-status", {
    method: "POST",
    body: JSON.stringify({ teacher_ids: teacherIds }),
    authRequired: true,
  });

  return response;
};
