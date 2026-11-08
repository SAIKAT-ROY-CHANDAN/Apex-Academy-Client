"use server";

import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

export const createIDCardGenerateLog = async (payload: FieldValues) => {
  const response = await apiRequest("id-card-generate-log", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};

export const getIDCardGenerateLogs = async (
  query: { student_id?: string } = {},
) => {
  const queryParams = new URLSearchParams();
  Object.entries(query).forEach(([label, value]) => {
    if (value) queryParams.append(label, value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `id-card-generate-log?${queryParams.toString()}`
      : "id-card-generate-log",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
