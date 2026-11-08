"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";

export const createDepositType = async (payload: FieldValues) => {
  const response = await apiRequest("deposit-type", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/deposit-type");
  }

  return response;
};

export const getDepositTypes = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `deposit-type?${queryParams.toString()}` : "deposit-type",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateDepositType = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`deposit-type/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/deposit-type");
  }

  return response;
};

export const deleteDepositType = async (id: string) => {
  const response = await apiRequest(`deposit-type/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/deposit-type");
  }

  return response;
};