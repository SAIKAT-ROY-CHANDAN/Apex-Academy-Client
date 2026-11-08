"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

const REVALIDATE_PATH = "/dashboard/settings/system/invoice";

export const createInstitutionInvoiceSetting = async (payload: FormData) => {
  const response = await apiRequest("institution-invoice-setting", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const getInstitutionInvoiceSettings = async (
  query: QueryParams[] = []
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  console.log(queryParams)
  const response = await apiRequest(
    queryParams.toString()
      ? `institution-invoice-setting?${queryParams.toString()}`
      : "institution-invoice-setting",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getInstitutionInvoiceSettingById = async (id: string) => {
  const response = await apiRequest(`institution-invoice-setting/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateInstitutionInvoiceSetting = async (
  id: string,
  payload: FormData | FieldValues,
) => {
  const response = await apiRequest(`institution-invoice-setting/${id}`, {
    method: "PUT",
    body: payload instanceof FormData ? payload : JSON.stringify(payload),
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};

export const deleteInstitutionInvoiceSetting = async (id: string) => {
  const response = await apiRequest(`institution-invoice-setting/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
