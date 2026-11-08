"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/governing-body-administrators";

export const getAllWebsiteGoverningBodyMembers = async (
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
    `website-governing-body${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteGoverningBodyMemberById = async (id: string) => {
  const response = await apiRequest(`website-governing-body/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createWebsiteGoverningBodyMember = async (payload: FormData) => {
  const response = await apiRequest("website-governing-body", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteGoverningBodyMember = async (
  id: string,
  payload: FormData,
) => {
  const response = await apiRequest(`website-governing-body/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteGoverningBodyMember = async (id: string) => {
  const response = await apiRequest(`website-governing-body/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
