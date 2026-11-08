"use server";

import { apiRequest } from "@/lib/apiRequest";
import { FieldValues } from "react-hook-form";

export const createRole = async (data: FieldValues) => {
  const response = await apiRequest("role", {
    method: "POST",
    body: JSON.stringify(data),
    authRequired: true,
  });

  return response;
};

export const getAllPermissions = async ({ role_name }: { role_name?: string }) => {
  const response = await apiRequest(`role/all-permissions${role_name ? `?role_name=${role_name}` : ""}`, {
    authRequired: true,
    method: "GET",
  });

  return response;
};


export const getAllRoles = async () => {
  const response = await apiRequest("role", {
    authRequired: true,
    method: "GET",
  });

  return response;
}