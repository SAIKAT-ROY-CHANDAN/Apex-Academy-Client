"use server";

import { apiRequest } from "@/lib/apiRequest";
import { FieldValues } from "react-hook-form";

export const setupInstitution = async (payload: FieldValues) => {
  const response = await apiRequest("admin-auth/setup-institution", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};

export const getInstitutionDetails = async () => {
  const response = await apiRequest("admin-auth/institution-config", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateInstitution = async (id: string, payload: FieldValues) => {
  const response = await apiRequest(`admin-auth/institution-config/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};
