"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/administrative-messages";

export const createWebsitePrincipalMessage = async (payload: FormData) => {
  const response = await apiRequest("website-principal-message", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsitePrincipalMessage = async () => {
  const response = await apiRequest("website-principal-message", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsitePrincipalMessage = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-principal-message/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
