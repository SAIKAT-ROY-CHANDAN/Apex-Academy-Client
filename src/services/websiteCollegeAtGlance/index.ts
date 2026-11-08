"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/about-college";

export const createWebsiteCollegeAtGlance = async (payload: FormData) => {
  const response = await apiRequest("website-college-at-glance", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteCollegeAtGlance = async () => {
  const response = await apiRequest("website-college-at-glance", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteCollegeAtGlance = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-college-at-glance/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
