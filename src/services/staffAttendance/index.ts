"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

export const checkInStaff = async (payload: FieldValues) => {
  const response = await apiRequest("staff-attendance", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/employees/staffs/attendance");

  return response;
};

export const checkOutStaff = async (payload: FieldValues) => {
  const response = await apiRequest(`staff-attendance/${payload.id}`, {
    method: "PUT",
    body: JSON.stringify({
      check_out_time: payload.check_out_time,
      attendance_status: payload.attendance_status,
    }),
    authRequired: true,
  });

  revalidatePath("/dashboard/employees/staffs/attendance");

  return response;
};

export const getStaffsAttendanceStatus = async (staffIds: string[]) => {
  if (staffIds.length === 0) return { success: true, data: {} };

  const response = await apiRequest("staff-attendance/today-status", {
    method: "POST",
    body: JSON.stringify({ staff_ids: staffIds }),
    authRequired: true,
  });

  return response;
};

export const staffOvertimeByStaffId = async (staffId: string) => {
  const response = await apiRequest(`staff-overtime/staff/${staffId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const isStaffCheckedIn = async (staffId: string) => {
  const response = await apiRequest(`staff-attendance/check-in/${staffId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const isStaffCheckedOut = async (staffId: string) => {
  const response = await apiRequest(`staff-attendance/check-out/${staffId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getStaffAttendanceReport = async (
  query: { label: string; value: string }[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => queryParams.append(param.label, param.value));

  const response = await apiRequest(
    queryParams.toString()
      ? `staff-attendance/report?${queryParams.toString()}`
      : "staff-attendance/report",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

// Returns every attendance record for a single staff, plus their info and a
// present/absent summary. Backs the per-staff attendance details page.
export const getStaffAttendanceHistory = async (staffId: string) => {
  const response = await apiRequest(`staff-attendance/history/${staffId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
