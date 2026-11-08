"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";

export const createDeposit = async (payload: FieldValues) => {
  const response = await apiRequest("deposit", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/deposit");
  }

  return response;
};

export const getDeposits = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString() ? `deposit?${queryParams.toString()}` : "deposit",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateDeposit = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`deposit/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/deposit");
  }

  return response;
};

export const deleteDeposit = async (id: string) => {
  const response = await apiRequest(`deposit/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/deposit");
  }

  return response;
};