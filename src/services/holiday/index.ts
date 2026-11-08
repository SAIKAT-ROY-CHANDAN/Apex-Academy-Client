"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

export const createHoliday = async (payload: FieldValues) => {
  const response = await apiRequest("holiday", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/holiday");
  return response;
};

export const getHolidays = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `holiday?${queryParams.toString()}` : "holiday",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getCalendarHolidays = async (year: number) => {
  const response = await apiRequest(`holiday/calendar?year=${year}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateHoliday = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`holiday/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/holiday");
  return response;
};

export const deleteHoliday = async (id: string) => {
  const response = await apiRequest(`holiday/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/holiday");
  return response;
};
