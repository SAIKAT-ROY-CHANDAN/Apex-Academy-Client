"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/faqs";

export const createWebsiteFaqSection = async (payload: FormData) => {
  const response = await apiRequest("website-faq-section", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteFaqSection = async () => {
  const response = await apiRequest("website-faq-section", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteFaqSection = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-faq-section/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
