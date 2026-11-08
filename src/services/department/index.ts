"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createDepartment = async (payload: FieldValues) => {
  const response = await apiRequest("department", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/department");
  return response;
};

export const getDepartments = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `department?${queryParams.toString()}`
      : "department",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
export const getDepartmentByProgramId = async (programId: string) => {
  const response = await apiRequest(`department/program/${programId}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
export const updateDepartment = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`department/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteDepartment = async (id: string) => {
  const response = await apiRequest(`department/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};
