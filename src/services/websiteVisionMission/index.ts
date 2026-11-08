"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATH = "/dashboard/website/about-college";

export const createWebsiteVisionMission = async (payload: FieldValues) => {
  const response = await apiRequest("website-vision-mission", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getWebsiteVisionMission = async () => {
  const response = await apiRequest("website-vision-mission", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateWebsiteVisionMission = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`website-vision-mission/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
