"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createProgram = async (payload: FieldValues) => {
  const response = await apiRequest("program", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/programs");
  return response;
};

export const getPrograms = async (query: QueryParams[]) => {
  const queryParams = new URLSearchParams();
  if (query && query.length > 0) {
    query.forEach((param) => {
      queryParams.append(param.label, param.value);
    });
  }

  const response = await apiRequest(`program?${queryParams.toString()}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
export const updateProgram = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`program/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/programs");
  return response;
};

export const deleteProgram = async (id: string) => {
  const response = await apiRequest(`program/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/programs");
  return response;
};
