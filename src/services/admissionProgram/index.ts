"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/admission-program";

export const getAllAdmissionPrograms = async (query: QueryParams[] = []) => {
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
    `admission-program${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return response;
};

export const getAdmissionProgramsByType = async (type: string) => {
  const response = await apiRequest(
    `admission-program/by-type?type=${type}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return response;
};

export const getAdmissionProgramById = async (id: string) => {
  console.log('getAdmissionProgramById called with id:', id);
  const response = await apiRequest(`admission-program/${id}`, {
    method: "GET",
    cache: "no-store",
    authRequired: true,
  });

  console.log('getAdmissionProgramById response:', response);
  return response;
};

export const createAdmissionProgram = async (payload: FormData) => {
  const response = await apiRequest("admission-program", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateAdmissionProgram = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`admission-program/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteAdmissionProgram = async (id: string) => {
  const response = await apiRequest(`admission-program/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};