"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";
import { revalidatePath } from "next/cache";

interface BackendQueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: string | number;
  limit?: string | number;
}

const convertToBackendQuery = (query: QueryParams[]): BackendQueryParams => {
  const result: BackendQueryParams = {};
  query.forEach((q) => {
    switch (q.label) {
      case "page":
        result.page = q.value;
        break;
      case "limit":
        result.limit = q.value;
        break;
      case "searchTerm":
        result.searchTerm = q.value;
        break;
      case "filter":
        result.filter = typeof q.value === "string" ? JSON.parse(q.value) : q.value;
        break;
      case "orderBy":
        result.orderBy = typeof q.value === "string" ? JSON.parse(q.value) : q.value;
        break;
      default:
        if (!result.filter) result.filter = {};
        result.filter[q.label] = q.value;
    }
  });
  return result;
};

const buildQueryString = (query: QueryParams[]) => {
  const backendQuery = convertToBackendQuery(query);
  const params = new URLSearchParams();
  if (backendQuery.page) params.append("page", backendQuery.page.toString());
  if (backendQuery.limit) params.append("limit", backendQuery.limit.toString());
  if (backendQuery.searchTerm) params.append("searchTerm", backendQuery.searchTerm);
  if (backendQuery.filter) params.append("filter", JSON.stringify(backendQuery.filter));
  if (backendQuery.orderBy) params.append("orderBy", JSON.stringify(backendQuery.orderBy));
  return params.toString();
};

// Student: create leave request
export const createStudentLeaveRequest = async (data: FieldValues) => {
  const response = await apiRequest("student-leave-request", {
    method: "POST",
    body: JSON.stringify(data),
    authRequired: true,
  });
  revalidatePath("/student-dashboard/leave-request");
  return response;
};

// Student: get my requests
export const getMyStudentLeaveRequests = async (query: QueryParams[] = []) => {
  const qs = buildQueryString(query);
  const response = await apiRequest(`student-leave-request/my-requests${qs ? `?${qs}` : ""}`, {
    method: "GET",
    authRequired: true,
    cache: "no-store",
    next: { revalidate: 0 } as any,
  });
  return response;
};

// Student: get my stats
export const getMyStudentLeaveStats = async () => {
  const response = await apiRequest("student-leave-request/my-stats", {
    method: "GET",
    authRequired: true,
  });
  return response;
};

// Admin: get all requests
export const getAllStudentLeaveRequests = async (query: QueryParams[] = []) => {
  const qs = buildQueryString(query);
  const response = await apiRequest(`student-leave-request${qs ? `?${qs}` : ""}`, {
    method: "GET",
    authRequired: true,
    cache: "no-store",
    next: { revalidate: 0 } as any,
  });
  return response;
};

// Admin: get by student id
export const getStudentLeaveRequestsByStudentId = async (studentId: string, query: QueryParams[] = []) => {
  const qs = buildQueryString(query);
  const response = await apiRequest(`student-leave-request/student/${studentId}${qs ? `?${qs}` : ""}`, {
    method: "GET",
    authRequired: true,
  });
  return response;
};

// Shared: get by id
export const getStudentLeaveRequestById = async (id: string) => {
  const response = await apiRequest(`student-leave-request/${id}`, {
    method: "GET",
    authRequired: true,
  });
  return response;
};

// Admin: update status / edit
export const updateStudentLeaveRequest = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`student-leave-request/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/student-leaves");
  revalidatePath("/student-dashboard/leave-request");
  return response;
};

export const updateStudentLeaveStatus = async (id: string, status: string) => {
  return updateStudentLeaveRequest(id, { status });
};

// Delete
export const deleteStudentLeaveRequest = async (id: string) => {
  const response = await apiRequest(`student-leave-request/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/student-leaves");
  revalidatePath("/student-dashboard/leave-request");
  return response;
};

// Admin: stats
export const getStudentLeaveStats = async () => {
  const response = await apiRequest("student-leave-request/stats", {
    method: "GET",
    authRequired: true,
    cache: "no-store",
    next: { revalidate: 0 } as any,
  });
  return response;
};
