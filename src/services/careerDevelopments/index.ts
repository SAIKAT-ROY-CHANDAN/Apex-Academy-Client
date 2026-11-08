"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/career-developments";

export const getAllCareerDevelopments = async (query: QueryParams[] = []) => {
  const params = new URLSearchParams();

  query.forEach((param) => {
    const value =
      typeof param.value === "string"
        ? param.value
        : JSON.stringify(param.value);
    params.append(param.label, value);
  });

  const queryString = params.toString();
  const response = await apiRequest(
    `career-developments${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return response;
};

export const getActiveCareerDevelopments = async () => {
  const response = await apiRequest("career-developments/active", {
    method: "GET",
    cache: "no-store",
  });

  return response;
};

export const getCareerDevelopmentsById = async (id: string) => {
  const response = await apiRequest(`career-developments/${id}`, {
    method: "GET",
    cache: "no-store",
    authRequired: true,
  });

  return response;
};

export const createCareerDevelopments = async (payload: FormData) => {
  const response = await apiRequest("career-developments", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateCareerDevelopments = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`career-developments/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteCareerDevelopments = async (id: string) => {
  const response = await apiRequest(`career-developments/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};