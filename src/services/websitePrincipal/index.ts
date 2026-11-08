"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

// Primary route per backend registration. The spec calls the feature
// "website-settings/principals" and the dashboard nav uses
// "/dashboard/website/principals" — both are revalidated.
// Public page that lists principals also needs revalidation.
const REVALIDATE_PATHS = [
  "/dashboard/website/principals",
  "/website-settings/principals",
  "/about/about_college",
];

const ENDPOINT = "website-settings/principals";

export const getAllWebsitePrincipals = async (query: QueryParams[] = []) => {
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
    `${ENDPOINT}${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    }
  );

  return response;
};

export const getWebsitePrincipalById = async (id: string) => {
  const response = await apiRequest(`${ENDPOINT}/${id}`, {
    method: "GET",
  });

  return response;
};

export const createWebsitePrincipal = async (payload: FormData) => {
  const response = await apiRequest(ENDPOINT, {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }
  }

  return response;
};

export const updateWebsitePrincipal = async (
  id: string,
  payload: FormData
) => {
  // Backend accepts both PATCH and PUT
  const response = await apiRequest(`${ENDPOINT}/${id}`, {
    method: "PATCH",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }
  }

  return response;
};

export const deleteWebsitePrincipal = async (id: string) => {
  const response = await apiRequest(`${ENDPOINT}/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }
  }

  return response;
};
