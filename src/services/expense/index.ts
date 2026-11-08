"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";

export const createExpense = async (payload: FieldValues) => {
  const response = await apiRequest("expense", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/expense");
  }

  return response;
};

export const getExpenses = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString() ? `expense?${queryParams.toString()}` : "expense",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateExpense = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`expense/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/expense");
  }

  return response;
};

export const deleteExpense = async (id: string) => {
  const response = await apiRequest(`expense/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/finance/expense");
  }

  return response;
};