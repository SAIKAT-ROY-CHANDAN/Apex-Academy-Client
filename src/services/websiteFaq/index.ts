"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const REVALIDATE_PATH = "/dashboard/website/faqs";

export const getAllWebsiteFaqs = async (query: QueryParams[] = []) => {
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
    `website-faq${queryString ? `?${queryString}` : ""}`,
    {
      method: "GET",
    },
  );

  return response;
};

export const getWebsiteFaqById = async (id: string) => {
  const response = await apiRequest(`website-faq/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createWebsiteFaq = async (payload: {
  question: string;
  answer: string;
}) => {
  const response = await apiRequest("website-faq", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const createManyWebsiteFaqs = async (
  items: { question: string; answer: string }[],
) => {
  const response = await apiRequest("website-faq/bulk", {
    method: "POST",
    body: JSON.stringify({ items }),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const updateWebsiteFaq = async (
  id: string,
  payload: { question?: string; answer?: string },
) => {
  const response = await apiRequest(`website-faq/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteWebsiteFaq = async (id: string) => {
  const response = await apiRequest(`website-faq/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
