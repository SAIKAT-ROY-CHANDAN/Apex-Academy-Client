"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/student-facilities";

export const getAllAcademicFacilities = async (query: QueryParams[] = []) => {
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
    `academic-facilities${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getAcademicFacilitiesById = async (id: string) => {
  const response = await apiRequest(`academic-facilities/${id}`, {
    method: "GET",
  });

  return response;
};

export const getAcademicFacilityByType = async (type: string) => {
  const normalized = type.toUpperCase();
  const response = await apiRequest(`academic-facilities/type/${normalized}`, {
    method: "GET",
    cache: "no-store",
  });

  return response;
};

export const getAllAcademicFacilitiesByType = async (
  type: string,
  query: QueryParams[] = [],
) => {
  const normalized = type.toUpperCase();
  const params = new URLSearchParams();
  params.append("all", "true");
  query.forEach((param) => {
    const value =
      typeof param.value === "string"
        ? param.value
        : JSON.stringify(param.value);
    params.append(param.label, value);
  });
  const queryString = params.toString();
  const response = await apiRequest(
    `academic-facilities/type/${normalized}${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  return response;
};

export const createAcademicFacilities = async (payload: FormData) => {
  const response = await apiRequest("academic-facilities", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateAcademicFacilities = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`academic-facilities/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteAcademicFacilities = async (id: string) => {
  const response = await apiRequest(`academic-facilities/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
