"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/head-of-departments";

export const getAllWebsiteHeadOfDepartments = async (
  query: QueryParams[] = [],
) => {
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
    `website-head-of-department${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteHeadOfDepartmentById = async (id: string) => {
  const response = await apiRequest(`website-head-of-department/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createWebsiteHeadOfDepartment = async (payload: FormData) => {
  const response = await apiRequest("website-head-of-department", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteHeadOfDepartment = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`website-head-of-department/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteHeadOfDepartment = async (id: string) => {
  const response = await apiRequest(`website-head-of-department/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
