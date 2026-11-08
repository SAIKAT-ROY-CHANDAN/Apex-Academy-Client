"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/career-development-programmes";

export const getAllWebsiteCareerDevelopmentProgrammes = async (
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
    `website-career-development-programme${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteCareerDevelopmentProgrammeById = async (id: string) => {
  const response = await apiRequest(
    `website-career-development-programme/${id}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const createWebsiteCareerDevelopmentProgramme = async (
  payload: FormData,
) => {
  const response = await apiRequest("website-career-development-programme", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteCareerDevelopmentProgramme = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(
    `website-career-development-programme/${id}`,
    {
      method: "PUT",
      body: payload,
      authRequired: true,
    },
  );

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteCareerDevelopmentProgramme = async (id: string) => {
  const response = await apiRequest(
    `website-career-development-programme/${id}`,
    {
      method: "DELETE",
      authRequired: true,
    },
  );

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
