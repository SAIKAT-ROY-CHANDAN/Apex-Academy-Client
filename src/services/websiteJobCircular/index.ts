"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/job-circular";

export const getAllWebsiteJobCirculars = async (query: QueryParams[] = []) => {
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
    `website-job-circular${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteJobCircularById = async (id: string) => {
  const response = await apiRequest(`website-job-circular/${id}`, {
    method: "GET",
    // authRequired: true,
  });

  return response;
};

export const createWebsiteJobCircular = async (payload: FormData) => {
  const response = await apiRequest("website-job-circular", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteJobCircular = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`website-job-circular/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteJobCircular = async (id: string) => {
  const response = await apiRequest(`website-job-circular/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
