"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createBatch = async (payload: FieldValues) => {
  const response = await apiRequest("batch", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/batch");
  return response;
};

export const getBatchDetails = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `batch?${queryParams.toString()}` : "batch",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateBatch = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`batch/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/batch");
  return response;
};

export const deleteBatch = async (id: string) => {
  const response = await apiRequest(`batch/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/batch");
  return response;
};
