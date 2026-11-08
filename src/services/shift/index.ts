"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const getShifts = async (query: QueryParams[]) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(`shift?${queryParams.toString()}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getShift = async (id: string) => {
  const response = await apiRequest(`shift/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createShift = async (data: FieldValues) => {
  const response = await apiRequest("shift", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const updateShift = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`shift/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });

    return response;
};

export const deleteShift = async (id: string) => {
  const response = await apiRequest(`shift/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

    return response;
};