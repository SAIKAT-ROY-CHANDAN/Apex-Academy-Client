"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

export const filterStudents = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, String(param.value));
  });

  const response = await apiRequest(
    queryParams.toString() ? `student?${queryParams.toString()}` : `student`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const createHostelAllocation = async (payload: FieldValues) => {
  const response = await apiRequest("hostel-allocation", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(payload),
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/manage");
  }

  return response;
};

export const updateHostelAllocation = async (
  allocationId: string,
  payload: FieldValues,
) => {
  const response = await apiRequest(`hostel-allocation/${allocationId}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(payload),
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/manage");
  }

  return response;
};

export const deleteHostelAllocation = async (allocationId: string) => {
  const response = await apiRequest(`hostel-allocation/${allocationId}`, {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    revalidatePath("/dashboard/hostel/manage");
  }

  return response;
};

export const checkoutHostelAllocation = async (allocationId: string) => {
  const response = await apiRequest(
    `hostel-allocation/${allocationId}/checkout`,
    {
      method: "POST",
      authRequired: true,
    },
  );

  if (response?.success) {
    revalidatePath("/dashboard/hostel/manage");
  }

  return response;
};

export const getStudentAllocationHistory = async (studentId: string) => {
  const response = await apiRequest(
    `hostel-allocation/student/${studentId}/history`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

type QueryParam = { label: string; value: string | number };

export const getAllocatedHostelStudents = async (params: QueryParam[] = []) => {
  const searchParams = new URLSearchParams();

  params.forEach(({ label, value }) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(label, String(value));
    }
  });

  const query = searchParams.toString()
    ? `hostel-allocation/allocated-students?${searchParams.toString()}`
    : `hostel-allocation/allocated-students`;

  const response = await apiRequest(query, {
    method: "GET",
    authRequired: true,
  });

  return response;
};
