"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { setAuthCookies } from "../admin-auth";

export const getTeachers = async (query: QueryParams[]) => {
  const searchParams = new URLSearchParams();
  query.forEach((param) => {
    searchParams.append(param.label, param.value);
  });

  const res = await apiRequest(`teacher?${searchParams.toString()}`, {
    authRequired: true,
    method: "GET",
  });

  return res;
};

export const getTeacherById = async (id: string) => {
  const res = await apiRequest(`teacher/${id}`, {
    authRequired: true,
    method: "GET",
  });
  return res;
};

export const createTeacher = async (data: FormData) => {
  const res = await apiRequest(`teacher`, {
    authRequired: true,
    method: "POST",
    body: data,
  });
  return res;
};

export const loginTeacher = async (data: FieldValues) => {
  const res = await apiRequest(`teacher/login`, {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (res.token?.accessToken && res.token?.refreshToken) {
    await setAuthCookies(res.token.accessToken, res.token.refreshToken);
  }

  return res;
};

export const updateTeacher = async (id: string, data: FormData) => {
  const res = await apiRequest(`teacher/${id}`, {
    authRequired: true,
    method: "PUT",
    body: data,
  });
  return res;
};

export const deleteTeacher = async (id: string) => {
  const res = await apiRequest(`teacher/${id}`, {
    authRequired: true,
    method: "DELETE",
  });
  return res;
};

export const getTeacherOverview = async (id: string) => {
  const res = await apiRequest(`teacher/${id}/overview`, {
    authRequired: true,
    method: "GET",
  });
  
  return res;
};

// Student Exam Result APIs
export const createResult = async (data: FieldValues) => {
  const res = await apiRequest(`student-exam-result`, {
    authRequired: true,
    method: "POST",
    body: JSON.stringify(data),
  });
  return res;
};

export const getResultById = async (id: string) => {
  const res = await apiRequest(`student-exam-result/${id}`, {
    authRequired: true,
    method: "GET",
  });
  return res;
}

export const getResults = async (query: QueryParams[]) => {
  const searchParams = new URLSearchParams();
  query.forEach((param) => {
    searchParams.append(param.label, param.value);
  });
  
  const res = await apiRequest(`student-exam-result?${searchParams.toString()}`, {
    authRequired: true,
    method: "GET",
  });
  return res;
}

export const updateResult = async (id: string, data: FieldValues) => {
  const res = await apiRequest(`student-exam-result/${id}`, {
    authRequired: true,
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res;
}
