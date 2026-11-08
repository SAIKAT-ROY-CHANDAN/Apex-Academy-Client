"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createAcademicSection = async (payload: FieldValues) => {
  const response = await apiRequest("academic-section", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
 revalidatePath("/dashboard/settings/system/section-config");
  return response;
};

export const getAcademicSections = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `academic-section?${queryParams.toString()}`
      : "academic-section",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getFilteredSections = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `academic-section/filtered?${queryParams.toString()}`
      : "academic-section/filtered",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateAcademicSection = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`academic-section/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
 revalidatePath("/dashboard/settings/system/section-config");
  return response;
};

export const deleteAcademicSection = async (id: string) => {
  const response = await apiRequest(`academic-section/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/section-config");
  return response;
};
