"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/tuition-fees";

export const getAllAcademicTuitions = async (query: QueryParams[] = []) => {
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
    `academic-tuition${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getAcademicTuitionById = async (id: string) => {
  const response = await apiRequest(`academic-tuition/${id}`, {
    method: "GET",
  });

  return response;
};

export const createAcademicTuition = async (payload: FormData) => {
  const response = await apiRequest("academic-tuition", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateAcademicTuition = async (id: string, payload: FormData) => {
  const response = await apiRequest(`academic-tuition/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteAcademicTuition = async (id: string) => {
  const response = await apiRequest(`academic-tuition/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
