"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createFeeItem = async (payload: FieldValues) => {
  const response = await apiRequest("fee-item", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/fee-item");
  return response;
};

export const getFeeItems = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString() ? `fee-item?${queryParams.toString()}` : "fee-item",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateFeeItem = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`fee-item/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/fee-item");
  return response;
};

export const deleteFeeItem = async (id: string) => {
  const response = await apiRequest(`fee-item/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/fee-item");
  return response;
};

export const getFeeItemByFeeTypeId = async (id: string) => {
  const response = await apiRequest(`fee-item/fee-type/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
