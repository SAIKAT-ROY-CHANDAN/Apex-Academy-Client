"use server";

import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

export const createHomework = async (payload: FieldValues) => {
  const response = await apiRequest("homework", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};

export const getHomeworks = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `homework?${queryParams.toString()}` : "homework",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getHomeworkById = async (id: string) => {
  const response = await apiRequest(`homework/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateHomework = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`homework/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteHomework = async (id: string) => {
  const response = await apiRequest(`homework/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};

export const getHomeworksByClass = async (classId: string) => {
  const queryParams = new URLSearchParams();
  const filter = JSON.stringify({
    class_id: classId,
  });
  queryParams.append("filter", filter);

  const response = await apiRequest(`homework?${queryParams.toString()}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
