"use server";

import { apiRequest } from "@/lib/apiRequest";
import { loggedInStudentUser } from "@/services/logged-user";
import type { QueryParams } from "@/types/shared/query.type";

// Self-service results for the logged-in student. Always scopes the query to
// the student's own id from the JWT so they can never read someone else's data.
export const getMyResults = async (query: QueryParams[] = []) => {
  const user = await loggedInStudentUser();
  const studentId = user?.id;
  if (!studentId) {
    return {
      success: false,
      data: [],
      meta: { totalItems: 0, currentPage: 1, totalPages: 1, limit: 10 },
    };
  }

  const filterParam = query.find((q) => q.label === "filter");
  let filter: Record<string, unknown> = {};
  if (filterParam) {
    try {
      filter = JSON.parse(String(filterParam.value));
    } catch {
      filter = {};
    }
  }
  // Always scope to the logged-in student — never trust a client-supplied id.
  filter.student_id = studentId;

  const merged: QueryParams[] = query
    .filter((q) => q.label !== "filter")
    .concat({ label: "filter", value: JSON.stringify(filter) });

  const queryParams = new URLSearchParams();
  merged.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    `student-exam-result?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getStudentExamResultById = async (id: string) => {
  const response = await apiRequest(`student-exam-result/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

// Admin-facing listing of every student exam result. Unlike getMyResults this
// is never scoped to a single student — the dashboard Results page uses it to
// show all published results with its Program -> Department filter.
export const getAllStudentExamResults = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `student-exam-result?${queryParams.toString()}`
      : "student-exam-result",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};
