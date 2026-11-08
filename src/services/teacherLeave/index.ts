"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const createLeaveRequest = async (data: FieldValues) => {
  const response = await apiRequest("teacher-leave-request", {
    method: "POST",
    body: JSON.stringify(data),
    authRequired: true,
  });

  return response;
};

// Backend expects: { searchTerm?, filter?, orderBy?, page?, limit?, academicSessionId? }
interface BackendQueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: string | number;
  limit?: string | number;
  academicSessionId?: string;
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
      case "academicSessionId":
        result.academicSessionId = q.value;
        break;
      default:
        // For other filter fields like leave_status, leave_type, etc.
        if (!result.filter) result.filter = {};
        result.filter[q.label] = q.value;
    }
  });
  
  return result;
};

export const getAllLeaveRequests = async (
  teacher_id: string,
  query: QueryParams[],
) => {
  const backendQuery = convertToBackendQuery(query);
  const params = new URLSearchParams();
  
  if (backendQuery.page) params.append("page", backendQuery.page.toString());
  if (backendQuery.limit) params.append("limit", backendQuery.limit.toString());
  if (backendQuery.searchTerm) params.append("searchTerm", backendQuery.searchTerm);
  if (backendQuery.filter) params.append("filter", JSON.stringify(backendQuery.filter));
  if (backendQuery.orderBy) params.append("orderBy", JSON.stringify(backendQuery.orderBy));
  if (backendQuery.academicSessionId) params.append("academicSessionId", backendQuery.academicSessionId);

  const response = await apiRequest(
    `teacher-leave-request/teacher/${teacher_id}?${params.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

// Admin: get all leave requests across all teachers
// Admin GET endpoint returns data at the top level: { success, meta, data: [] }
export const getAllTeacherLeaveRequests = async (query: QueryParams[]) => {
  const backendQuery = convertToBackendQuery(query);
  const params = new URLSearchParams();

  if (backendQuery.page) params.append("page", backendQuery.page.toString());
  if (backendQuery.limit) params.append("limit", backendQuery.limit.toString());
  if (backendQuery.searchTerm) params.append("searchTerm", backendQuery.searchTerm);
  if (backendQuery.filter) params.append("filter", JSON.stringify(backendQuery.filter));
  if (backendQuery.orderBy) params.append("orderBy", JSON.stringify(backendQuery.orderBy));

  const response = await apiRequest(
    `teacher-leave-request?${params.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getTeacherLeaveRequestById = async (id: string) => {
  const response = await apiRequest(`teacher-leave-request/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const updateTeacherLeaveRequestStatus = async (
  id: string,
  leave_status: string,
) => {
  const response = await apiRequest(`teacher-leave-request/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify({ leave_status }),
  });

  return response;
};


