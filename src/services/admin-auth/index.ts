"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";

export const setAuthCookies = async (
  accessToken: string,
  refreshToken: string,
  remember?: boolean,
) => {
  const cookieStore = await cookies();
  const secure = false;
  const baseOptions = {
    path: "/",
    sameSite: "lax" as const,
    secure,
  };

  const maxAge = remember ? 60 * 60 * 24 * 30 : undefined;

  cookieStore.set("accessToken", accessToken, {
    ...baseOptions,
    ...(maxAge ? { maxAge } : {}),
  });
  cookieStore.set("refreshToken", refreshToken, {
    ...baseOptions,
    httpOnly: true,
    ...(maxAge ? { maxAge } : {}),
  });
};

export const loginAdmin = async (payload: FieldValues) => {
  const response = await apiRequest("admin-auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!response.success) {
    return {
      success: false,
      message: response.message ?? "Login failed",
    };
  }

  if (response.token?.accessToken && response.token?.refreshToken) {
    await setAuthCookies(
      response.token.accessToken,
      response.token.refreshToken,
    );
  }

  return {
    success: true,
    message: response.message,
    data: response.data,
  };
};

export const getAllAdminsUser = async (query: QueryParams[]) => {
  const params = new URLSearchParams();
  query.forEach((param) => {
    params.append(param.label, param.value);
  });

  const response = await apiRequest(`admin-auth?${params.toString()}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getAdminUserById = async (id: string) => {
  const response = await apiRequest(`admin-auth/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateAdminUserById = async (id: string, payload: FormData) => {
  const response = await apiRequest(`admin-auth/${id}`, {
    method: "PUT",
    body: payload,
    authRequired: true,
  });

  return response;
};

export const deleteAdminUserById = async (id: string) => {
  const response = await apiRequest(`admin-auth/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  revalidatePath("/dashboard/settings/system/users");

  return response;
};

export const createAdminUser = async (payload: FormData) => {
  const response = await apiRequest(`admin-auth/register`, {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  return response;
};
