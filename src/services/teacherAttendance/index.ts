"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const checkInTeacher = async (payload: FieldValues) => {
  const response = await apiRequest("teacher-attendance", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/employees/teachers/attendance");

  return response;
};

export const checkOutTeacher = async (payload: FieldValues) => {
  const response = await apiRequest(`teacher-attendance/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify({
      check_out_time: payload.check_out_time,
      attendance_status: payload.attendance_status,
    }),
    authRequired: true,
  });

  revalidatePath("/dashboard/employees/teachers/attendance");

  return response;
};


export const getTeachersAttendanceStatus = async (teacherIds: string[]) => {
  if (teacherIds.length === 0) return { success: true, data: {} };

  const response = await apiRequest("teacher-attendance/today-status", {
    method: "POST",
    body: JSON.stringify({ teacher_ids: teacherIds }),
    authRequired: true,
  });

  return response;
};

export const teacherOvertimeByTeacherId = async (teacherId: string) => {
  const response = await apiRequest(`teacher-attendance/overtime/${teacherId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

// Returns the list of attendance sessions the given teacher has taken, grouped
// by (date, class, subject, group) with present/absent/total aggregates.
export const getTeacherTakenAttendance = async (
  query: { label: string; value: string }[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => queryParams.append(param.label, param.value));

  const response = await apiRequest(
    queryParams.toString()
      ? `student-attendance/class-taken-report?${queryParams.toString()}`
      : "student-attendance/class-taken-report",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getTeacherAttendanceReport = async (
  query: { label: string; value: string }[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => queryParams.append(param.label, param.value));

  const response = await apiRequest(
    queryParams.toString()
      ? `teacher-attendance/report?${queryParams.toString()}`
      : "teacher-attendance/report",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

// Returns every attendance record for a single teacher, plus their info and a
// present/absent summary. Backs the per-teacher attendance details page.
export const getTeacherAttendanceHistory = async (teacherId: string) => {
  const response = await apiRequest(
    `teacher-attendance/history/${teacherId}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

// Returns the full per-student attendance records for a given session (used to
// fill the "View details" dialog with the present/absent student list).
export const getTeacherAttendanceDetails = async (
  query: QueryParams[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => queryParams.append(param.label, param.value));

  const response = await apiRequest(
    queryParams.toString()
      ? `student-attendance?${queryParams.toString()}`
      : "student-attendance",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};