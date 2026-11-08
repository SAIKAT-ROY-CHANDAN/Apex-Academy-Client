"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const getGradeSystems = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString() ? `grade-system?${queryParams.toString()}` : "grade-system",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getGradeSystem = async (id: string) => {
  const response = await apiRequest(`grade-system/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const createGradeSystem = async (data: FieldValues) => {
  const response = await apiRequest("grade-system", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const updateGradeSystem = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`grade-system/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteGradeSystem = async (id: string) => {
  const response = await apiRequest(`grade-system/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};