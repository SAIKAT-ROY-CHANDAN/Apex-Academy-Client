"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import { loggedInStudentUser } from "@/services/logged-user";

export const createStudentAttendance = async (data: FieldValues) => {
  const response = await apiRequest("student-attendance", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const createManyStudentAttendances = async (data: FieldValues) => {
  const response = await apiRequest("student-attendance/bulk", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/teacher/attendance");
    revalidatePath("/teacher/attendance/take");
  }

  return response;
};

export const updateManyStudentAttendances = async (data: {
  updates: { id: string; attendance_status: "PRESENT" | "ABSENT" }[];
}) => {
  const response = await apiRequest("student-attendance/bulk", {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/teacher/attendance");
    revalidatePath("/teacher/attendance/view");
    revalidatePath("/teacher/attendance/edit");
  }

  return response;
};

export const checkStudentAttendanceToday = async (
  query: { label: string; value: string }[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    `student-attendance/check-today?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getClassTakenReport = async (
  query: { label: string; value: string }[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    `student-attendance/class-taken-report?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );
  return response;
};

export const getStudentAttendances = async (
  query: { label: string; value: string }[] = [],
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

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

// Self-service attendance for the logged-in student. Always scopes the query to
// the student's own id from the JWT so they can never read someone else's data.
export const getMyAttendance = async (
  query: { label: string; value: string }[] = [],
) => {
  const user = await loggedInStudentUser();
  const studentId = user?.id;
  if (!studentId) {
    return {
      success: false,
      data: [],
      meta: { totalItems: 0, currentPage: 1, totalPages: 1, limit: 10 },
    };
  }

  const filterParam = query.find((q) => q.label === "filter");
  let filter: Record<string, unknown> = {};
  if (filterParam) {
    try {
      filter = JSON.parse(String(filterParam.value));
    } catch {
      filter = {};
    }
  }
  filter.student_id = studentId;

  const merged = query
    .filter((q) => q.label !== "filter")
    .concat({ label: "filter", value: JSON.stringify(filter) });

  return getStudentAttendances(merged);
};
