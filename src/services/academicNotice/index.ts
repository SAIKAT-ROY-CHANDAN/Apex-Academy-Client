"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/notice-update";

export const getAllAcademicNotices = async (query: QueryParams[] = []) => {
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
    `academic-notice${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getAcademicNoticeById = async (id: string) => {
  const response = await apiRequest(`academic-notice/${id}`, {
    method: "GET",
  });

  return response;
};

export const createAcademicNotice = async (payload: FormData) => {
  const response = await apiRequest("academic-notice", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateAcademicNotice = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`academic-notice/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteAcademicNotice = async (id: string) => {
  const response = await apiRequest(`academic-notice/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
