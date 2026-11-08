"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/syllabus";

export const getAllAcademicSyllabuses = async (query: QueryParams[] = []) => {
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
    `academic-syllabus${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getAcademicSyllabusById = async (id: string) => {
  const response = await apiRequest(`academic-syllabus/${id}`, {
    method: "GET",
  });

  return response;
};

export const createAcademicSyllabus = async (payload: FormData) => {
  const response = await apiRequest("academic-syllabus", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateAcademicSyllabus = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`academic-syllabus/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteAcademicSyllabus = async (id: string) => {
  const response = await apiRequest(`academic-syllabus/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
