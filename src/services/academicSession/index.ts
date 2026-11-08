"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createAcademicSession = async (payload: FieldValues) => {
  const response = await apiRequest("academic-session", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/settings/system/session-config");
  return response;
};

export const getAcademicSessions = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `academic-session?${queryParams.toString()}`
      : "academic-session",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
export const updateAcademicSession = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`academic-session/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/settings/system/session-config");
  return response;
};

export const deleteAcademicSession = async (id: string) => {
  const response = await apiRequest(`academic-session/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
 revalidatePath("/dashboard/settings/system/session-config");
  return response;
};
