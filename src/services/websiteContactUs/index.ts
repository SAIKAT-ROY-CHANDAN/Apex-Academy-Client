"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/contact-us";

export const createWebsiteContactUs = async (payload: FieldValues) => {
  const response = await apiRequest("website-contact-us", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteContactUs = async () => {
  const response = await apiRequest("website-contact-us", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteContactUs = async (
  id: string,
  payload: FieldValues,
) => {
  const response = await apiRequest(`website-contact-us/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
