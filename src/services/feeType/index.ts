"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createFeeType = async (payload: FieldValues) => {
  const response = await apiRequest("fee-type", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
revalidatePath("/dashboard/student-management/manage-fee");
  return response;
};

export const getFeeTypes = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `fee-type?${queryParams.toString()}` : "fee-type",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
export const  getFeeManage = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `fee-type/feeManage?${queryParams.toString()}` : "fee-type/feeManage",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateFeeType = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`fee-type/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteFeeType = async (id: string) => {
  const response = await apiRequest(`fee-type/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};
