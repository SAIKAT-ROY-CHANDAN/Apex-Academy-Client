"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createClass = async (payload: FieldValues) => {
  const response = await apiRequest("academic-class", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/settings/system/class-config");
  return response;
};

export const getAcademicClassDetails = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `academic-class?${queryParams.toString()}`
      : "academic-class",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
export const getClassesByDepartmentId = async (departmentId: string) => {
  const response = await apiRequest(`academic-class/departments/${departmentId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
export const updateClass = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`academic-class/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/settings/system/class-config");
  return response;
};

export const deleteClass = async (id: string) => {
  const response = await apiRequest(`academic-class/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/settings/system/class-config");
  return response;
};

export const getClassWithStudents = async (classId: string) => {
  const response = await apiRequest(`academic-class/${classId}/students`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
