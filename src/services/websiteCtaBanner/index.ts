"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/cta-banner";

export const createWebsiteCtaBanner = async (payload: FormData) => {
  const response = await apiRequest("website-cta-banner", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteCtaBanner = async () => {
  const response = await apiRequest("website-cta-banner", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteCtaBanner = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-cta-banner/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
