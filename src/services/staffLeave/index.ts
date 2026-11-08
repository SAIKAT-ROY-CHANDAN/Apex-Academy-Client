"use server";

import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

// Admin: list all staff leaves. Returns { success, meta, data: [] } at the top level.
export const getAllStaffLeaves = async (query: QueryParams[]) => {
  const params = new URLSearchParams();

  query.forEach((param) => {
    const value =
      typeof param.value === "string"
        ? param.value
        : JSON.stringify(param.value);
    params.append(param.label, value);
  });

  const res = await apiRequest(`staff-leave?${params.toString()}`, {
    authRequired: true,
    method: "GET",
  });

  return res;
};

export const getStaffLeaveById = async (id: string) => {
  const res = await apiRequest(`staff-leave/${id}`, {
    authRequired: true,
    method: "GET",
  });

  return res;
};

export const createStaffLeave = async (data: FieldValues) => {
  const res = await apiRequest(`staff-leave`, {
    authRequired: true,
    method: "POST",
    body: JSON.stringify(data),
  });

  return res;
};

export const updateStaffLeave = async (id: string, data: FieldValues) => {
  const res = await apiRequest(`staff-leave/${id}`, {
    authRequired: true,
    method: "PUT",
    body: JSON.stringify(data),
  });

  return res;
};

export const deleteStaffLeave = async (id: string) => {
  const res = await apiRequest(`staff-leave/${id}`, {
    authRequired: true,
    method: "DELETE",
  });

  return res;
};
