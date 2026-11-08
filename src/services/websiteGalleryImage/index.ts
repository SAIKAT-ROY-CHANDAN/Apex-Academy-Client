"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/gallery";

export const getAllWebsiteGalleryImages = async (
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
    `website-gallery-image${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteGalleryImageById = async (id: string) => {
  const response = await apiRequest(`website-gallery-image/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createWebsiteGalleryImage = async (payload: FormData) => {
  const response = await apiRequest("website-gallery-image", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteGalleryImage = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`website-gallery-image/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteGalleryImage = async (id: string) => {
  const response = await apiRequest(`website-gallery-image/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const createWebsiteGalleryImageJson = async (payload: {
  title: string;
  description: string;
  videoUrl: string | null;
}) => {
  const response = await apiRequest("website-gallery-image", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteGalleryImageJson = async (
  id: string,
  payload: {
    title: string;
    description: string;
    videoUrl: string | null;
  },
) => {
  const response = await apiRequest(`website-gallery-image/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
