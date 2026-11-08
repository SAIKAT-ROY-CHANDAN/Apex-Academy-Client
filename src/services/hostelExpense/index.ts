"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";

export const createHostelExpense = async (payload: FieldValues) => {
  const response = await apiRequest("hostel-expense", {
    method: "POST",
    body: JSON.stringify({
      expense_date: payload.expense_date,
      total_amount: payload.total_amount,
      hostelExpenseItems: payload.hostelExpenseItems,
    }),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/expense");
  }

  return response;
};

export interface HostelExpenseQueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: number;
  limit?: number;
  academicSessionId?: string;
}

export const getHostelExpenses = async (
  params: HostelExpenseQueryParams = {}
) => {
  const {
    searchTerm,
    filter,
    orderBy,
    page = 1,
    limit = 10,
    academicSessionId,
  } = params;

  const queryParams = new URLSearchParams();

  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  if (searchTerm) {
    queryParams.append("searchTerm", searchTerm);
  }

  if (filter && Object.keys(filter).length > 0) {
    queryParams.append("filter", JSON.stringify(filter));
  }

  if (orderBy && Object.keys(orderBy).length > 0) {
    queryParams.append("orderBy", JSON.stringify(orderBy));
  }

  if (academicSessionId) {
    queryParams.append("academicSessionId", academicSessionId);
  }

  const response = await apiRequest(
    `hostel-expense?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getHostelExpenseById = async (id: string) => {
  const response = await apiRequest(`hostel-expense/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateHostelExpense = async (
  id: string,
  payload: FieldValues,
) => {
  const response = await apiRequest(`hostel-expense/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify({
      expense_date: payload.expense_date,
      total_amount: payload.total_amount,
      hostelExpenseItems: payload.hostelExpenseItems,
    }),
  });


  if (response?.success) {
    revalidatePath("/dashboard/hostel/expense");
    revalidatePath(`/dashboard/hostel/expense/${id}`);
    revalidatePath(`/dashboard/hostel/expense/edit/${id}`);
  }

  return response;
};

export const deleteHostelExpense = async (id: string) => {
  const response = await apiRequest(`hostel-expense/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/expense");
  }

  return response;
};
