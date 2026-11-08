"use server";

import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

// Admin: list all staff resignations. Returns { success, meta, data: [] } at the top level.
export const getAllStaffResignations = async (query: QueryParams[]) => {
  const params = new URLSearchParams();

  query.forEach((param) => {
    const value =
      typeof param.value === "string"
        ? param.value
        : JSON.stringify(param.value);
    params.append(param.label, value);
  });

  const res = await apiRequest(`staff-resignation?${params.toString()}`, {
    authRequired: true,
    method: "GET",
  });

  return res;
};

export const getStaffResignationById = async (id: string) => {
  const res = await apiRequest(`staff-resignation/${id}`, {
    authRequired: true,
    method: "GET",
  });

  return res;
};

export const createStaffResignation = async (data: FieldValues) => {
  const res = await apiRequest(`staff-resignation`, {
    authRequired: true,
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
};

export const updateStaffResignation = async (id: string, data: FieldValues) => {
  const res = await apiRequest(`staff-resignation/${id}`, {
    authRequired: true,
    method: "PUT",
    body: JSON.stringify(data),
  });

  return res;
};

export const deleteStaffResignation = async (id: string) => {
  const res = await apiRequest(`staff-resignation/${id}`, {
    authRequired: true,
    method: "DELETE",
  });

  return res;
};
