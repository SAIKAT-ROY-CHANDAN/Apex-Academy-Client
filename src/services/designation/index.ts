"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createDesignation = async (payload: FieldValues) => {
  const res = await apiRequest("designation", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return res;
};

export const getDesignations = async (query: QueryParams[]) => {
  const searchParams = new URLSearchParams();
  query.forEach((param) => {
    searchParams.append(param.label, param.value);
  });

  const res = await apiRequest(`designation?${searchParams.toString()}`, {
    method: "GET",
    authRequired: true,
  });

  return res;
};

export const getDesignationById = async (id: string) => {
  const res = await apiRequest(`designation/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return res;
};

export const updateDesignation = async (id: string, payload: FieldValues) => {
  const res = await apiRequest(`designation/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return res;
};

export const deleteDesignation = async (id: string) => {
  const res = await apiRequest(`designation/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/designations");

  return res;
};
