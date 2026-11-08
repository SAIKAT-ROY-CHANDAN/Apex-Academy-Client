"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";

export const getStaffs = async (query: QueryParams[]) => {
  const searchParams = new URLSearchParams();
  query.forEach((param) => {
    searchParams.append(param.label, param.value);
  });

  const res = await apiRequest(`staff?${searchParams.toString()}`, {
    authRequired: true,
    method: "GET",
  });
  return res;
};

export const getStaffById = async (id: string) => {
  const res = await apiRequest(`staff/${id}`, {
    authRequired: true,
    method: "GET",
  });
  return res;
};

export const createStaff = async (data: FormData) => {
  const res = await apiRequest(`staff`, {
    authRequired: true,
    method: "POST",
    body: data,
  });
  return res;
};

export const updateStaff = async (id: string, data: FormData) => {
  const res = await apiRequest(`staff/${id}`, {
    authRequired: true,
    method: "PUT",
    body: data,
  });
  return res;
};

export const deleteStaff = async (id: string) => {
  const res = await apiRequest(`staff/${id}`, {
    authRequired: true,
    method: "DELETE",
  });
  return res;
};