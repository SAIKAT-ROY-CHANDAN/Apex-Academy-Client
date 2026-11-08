"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/footer-branding";

export const createWebsiteFooterBranding = async (payload: FormData) => {
  const response = await apiRequest("website-footer-branding", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteFooterBranding = async () => {
  const response = await apiRequest("website-footer-branding", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteFooterBranding = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-footer-branding/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};