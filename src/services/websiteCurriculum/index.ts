"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/curriculum";

export const getAllWebsiteCurriculums = async (query: QueryParams[] = []) => {
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
    `website-curriculum${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteCurriculumById = async (id: string) => {
  const response = await apiRequest(`website-curriculum/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createWebsiteCurriculum = async (payload: FormData) => {
  const response = await apiRequest("website-curriculum", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteCurriculum = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`website-curriculum/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteCurriculum = async (id: string) => {
  const response = await apiRequest(`website-curriculum/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
