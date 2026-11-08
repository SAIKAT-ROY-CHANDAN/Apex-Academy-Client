"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

export const getStudentEnrollments = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `student-enrollment?${queryParams.toString()}`
      : "student-enrollment",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getStudentEnrollmentById = async (id: string) => {
  const response = await apiRequest(`student-enrollment/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateStudentEnrollment = async (
  id: string,
  data: FieldValues,
) => {
  const response = await apiRequest(`student-enrollment/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/student-promotions");
  return response;
};

export const promoteStudent = async (data: FieldValues) => {
  const response = await apiRequest("student-enrollment/promote", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/student-promotions");
  return response;
};

export const createSupplementaryAttempt = async (data: FieldValues) => {
  const response = await apiRequest("student-enrollment/supplementary-attempt", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/student-promotions");
  return response;
};
