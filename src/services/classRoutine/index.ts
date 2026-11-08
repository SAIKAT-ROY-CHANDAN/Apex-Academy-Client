"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import type { QueryParams } from "@/types/shared/query.type";

const ROUTE_PATHS = [
  "/dashboard/academics/class-routine",
  "/dashboard/academics/class-routine/create",
  "/teacher/class-routine",
  "/teacher/class-routine/create",
  "/student-dashboard/class-routine",
];

function revalidateClassRoutinePaths() {
  for (const path of ROUTE_PATHS) {
    revalidatePath(path);
  }
}

export const getClassRoutineDetails = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `class-routine?${queryParams.toString()}`
      : "class-routine",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const createClassRoutine = async (payload: FieldValues) => {
  const response = await apiRequest("class-routine", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidateClassRoutinePaths();
  return response;
};

export const updateClassRoutine = async (id: string, payload: FieldValues) => {
  const response = await apiRequest(`class-routine/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidateClassRoutinePaths();
  return response;
};

export const deleteClassRoutine = async (id: string) => {
  const response = await apiRequest(`class-routine/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  revalidateClassRoutinePaths();
  return response;
};

export const getClassRoutineById = async (id: string) => {
  const response = await apiRequest(`class-routine/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getClassRoutineByTeacherId = async () => {
  const response = await apiRequest("class-routine/my-routine", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

// Self-service routine for the logged-in student. The backend resolves the
// student's class/section/batch/shift from the JWT and returns only the
// routines that apply to them.
export const getClassRoutineByStudentId = async (
  academicClassId?: string,
) => {
  const queryParams = new URLSearchParams();
  if (academicClassId) {
    queryParams.append("academic_class_id", academicClassId);
  }

  const response = await apiRequest(
    queryParams.toString()
      ? `class-routine/my-routine?${queryParams.toString()}`
      : "class-routine/my-routine",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

// Fetch all enrollments (current + previous years) for the logged-in student.
export const getMyEnrollments = async () => {
  const response = await apiRequest("student-enrollment/my-enrollments", {
    method: "GET",
    authRequired: true,
  });

  return response;
};
