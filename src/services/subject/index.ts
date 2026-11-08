"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";

export const createSubject = async (payload: FieldValues) => {
  const response = await apiRequest("subject", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/subjects");
  return response;
};

export const getSubjectDetails = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString() ? `subject?${queryParams.toString()}` : "subject",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateSubject = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`subject/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/subjects");
  return response;
};

export const deleteSubject = async (id: string) => {
  const response = await apiRequest(`subject/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/subjects");
  return response;
};
