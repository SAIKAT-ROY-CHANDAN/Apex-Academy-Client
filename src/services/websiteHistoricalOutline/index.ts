"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/about-college";

export const createWebsiteHistoricalOutline = async (payload: FormData) => {
  const response = await apiRequest("website-historical-outline", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteHistoricalOutline = async () => {
  const response = await apiRequest("website-historical-outline", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteHistoricalOutline = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-historical-outline/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
