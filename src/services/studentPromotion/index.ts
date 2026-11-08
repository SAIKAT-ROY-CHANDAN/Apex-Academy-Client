"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";

export const promoteStudent = async (data: FieldValues) => {
  const response = await apiRequest("student-promotion", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/student-promotions");
  return response;
};

export const promoteStudentsBulk = async (data: FieldValues) => {
  const response = await apiRequest("student-promotion/bulk", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/student-promotions");
  return response;
};
