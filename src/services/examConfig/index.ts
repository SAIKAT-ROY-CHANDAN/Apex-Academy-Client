"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const createExamConfig = async (payload: FieldValues) => {
  const response = await apiRequest("exam-config", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};

export const getExamConfigs = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `exam-config?${queryParams.toString()}`
      : "exam-config",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getExamYears = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `exam-config/years?${queryParams.toString()}`
      : "exam-config/years",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getExamOptions = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `exam-config/options?${queryParams.toString()}`
      : "exam-config/options",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getExamConfigById = async (id: string) => {
  const response = await apiRequest(`exam-config/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateExamConfig = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`exam-config/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteExamConfig = async (id: string) => {
  const response = await apiRequest(`exam-config/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};