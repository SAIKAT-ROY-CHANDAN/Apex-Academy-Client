"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/hero-section";

export const createWebsiteHeroSection = async (payload: FormData) => {
  const response = await apiRequest("website-hero-section", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteHeroSection = async () => {
  const response = await apiRequest("website-hero-section", {
    method: "GET",
    authRequired: false,
  });

  return response;
};

export const updateWebsiteHeroSection = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-hero-section/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
