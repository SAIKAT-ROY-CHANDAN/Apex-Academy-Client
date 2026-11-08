"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const createResignationRequest = async (data: FieldValues) => {
  const response = await apiRequest("teacher-resignation/teacher", {
    method: "POST",
    body: JSON.stringify(data),
    authRequired: true,
  });

  return response;
};

export const getAllResignations = async (
  teacher_id: string,
  query: QueryParams[],
) => {
  const params = new URLSearchParams();

  query.forEach((param) => {
    const value =
      typeof param.value === "string"
        ? param.value
        : JSON.stringify(param.value);
    params.append(param.label, value);
  });

  const response = await apiRequest(
    `teacher-resignation/teacher/${teacher_id}?${params.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

// Admin: get all resignations across all teachers
// Admin GET endpoint returns data at the top level: { success, meta, data: [] }
export const getAdminResignations = async (query: QueryParams[]) => {
  const params = new URLSearchParams();

  query.forEach((param) => {
    const value =
      typeof param.value === "string"
        ? param.value
        : JSON.stringify(param.value);
    params.append(param.label, value);
  });

  const response = await apiRequest(
    `teacher-resignation?${params.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const createAdminResignation = async (data: FieldValues) => {
  const response = await apiRequest("teacher-resignation", {
    method: "POST",
    body: JSON.stringify(data),
    authRequired: true,
  });

  return response;
};
