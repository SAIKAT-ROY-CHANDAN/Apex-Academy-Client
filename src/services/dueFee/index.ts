"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";

export const getDueFees = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, String(param.value));
  });
  const qs = queryParams.toString();
  const response = await apiRequest(qs ? `due-fee?${qs}` : "due-fee", {
    method: "GET",
    authRequired: true,
  });
  return response;
};
export const getDueFeesDetails = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, String(param.value));
  });
  const qs = queryParams.toString();
  const response = await apiRequest(qs ? `student-fee/due-with-details?${qs}` : "student-fee/due-with-details", {
    method: "GET",
    authRequired: true,
  });
  return response;
};

export const exportDueFees = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, String(param.value));
  });
  const qs = queryParams.toString();
  const response = await apiRequest(qs ? `due-fee/export?${qs}` : "due-fee/export", {
    method: "GET",
    authRequired: true,
  });
  return response;
};
