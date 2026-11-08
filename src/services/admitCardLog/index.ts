"use server";

import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

export const createAdmitCardLog = async (payload: FieldValues) => {
  const response = await apiRequest("admit-card-log", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};

export const getAdmitCardLogs = async (
  query: { student_id?: string; exam_config_id?: string } = {},
) => {
  const queryParams = new URLSearchParams();
  Object.entries(query).forEach(([label, value]) => {
    if (value) queryParams.append(label, value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `admit-card-log?${queryParams.toString()}`
      : "admit-card-log",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
