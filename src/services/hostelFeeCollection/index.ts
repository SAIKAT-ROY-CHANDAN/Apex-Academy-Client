"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

export interface HostelFeeCollectionQueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: number;
  limit?: number;
  academicSessionId?: string;
}

export const createHostelFeeCollection = async (payload: FieldValues) => {
  const response = await apiRequest("hostel-fee-collection", {
    method: "POST",
    body: JSON.stringify({
      student_id: payload.student_id,
      collection_date: payload.collection_date,
      total_amount: payload.total_amount,
      scholarship_amount: payload.scholarship_amount ?? 0,
      paid_amount: payload.paid_amount,
      due_amount: payload.due_amount,
      hostelFeeCollectionItems: payload.hostelFeeCollectionItems,
      mealCollection: payload.mealCollection,
    }),
    authRequired: true,
  });

  console.log(response, "response");
  if (response?.success) {
    revalidatePath("/dashboard/hostel/deposited");
  }

  return response;
};

export const payHostelStudentDue = async (payload: {
  student_id: string;
  paid_amount: number;
  payment_method: "CASH" | "BKASH" | "BANK";
  payment_note?: string;
}) => {
  const response = await apiRequest("hostel-fee-collection/pay-due", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/report");
    revalidatePath("/dashboard/hostel/deposited");
  }

  return response;
};

export const initiateBkashHostelPayment = async () => {
  const response = await apiRequest("hostel-fee-collection/bkash/initiate", {
    method: "POST",
    authRequired: true,
  });

  return response;
};

export const executeBkashHostelPayment = async (paymentID: string) => {
  const response = await apiRequest("hostel-fee-collection/bkash/execute", {
    method: "POST",
    body: JSON.stringify({ paymentID }),
    authRequired: true,
  });

  return response;
};

export const getHostelFeeCollections = async (
  params: HostelFeeCollectionQueryParams = {},
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
    `hostel-fee-collection?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getStudentHostelDue = async (studentId: string) => {
  const response = await apiRequest(
    `hostel-fee-collection/student-due/${studentId}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getMyHostelDue = async () => {
  const response = await apiRequest("hostel-fee-collection/my-due", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getHostelFeeCollectionById = async (id: string) => {
  const response = await apiRequest(`hostel-fee-collection/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateHostelFeeCollection = async (
  id: string,
  data: FieldValues,
) => {
  const response = await apiRequest(`hostel-fee-collection/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/deposited");
  }

  return response;
};

export const deleteHostelFeeCollection = async (id: string) => {
  const response = await apiRequest(`hostel-fee-collection/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/deposited");
  }

  return response;
};

export interface StudentSearchQueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: number;
  limit?: number;
  academicSessionId?: string;
}

export const searchStudentsForHostelFee = async (
  params: StudentSearchQueryParams = {},
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

  const response = await apiRequest(`student?${queryParams.toString()}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
