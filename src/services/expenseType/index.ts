"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";

export const createExpenseType = async (payload: FieldValues) => {
  const response = await apiRequest("expense-type", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/expense-type");
  }

  return response;
};

export const getExpenseTypes = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `expense-type?${queryParams.toString()}` : "expense-type",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateExpenseType = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`expense-type/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/expense-type");
  }

  return response;
};

export const deleteExpenseType = async (id: string) => {
  const response = await apiRequest(`expense-type/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/expense-type");
  }

  return response;
};
