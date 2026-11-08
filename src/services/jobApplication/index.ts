"use server";

import { apiRequest } from "@/lib/apiRequest";

/** Public — submits the application + files and initiates the bKash payment. */
export const initiateJobApplication = async (payload: FormData) => {
  const response = await apiRequest("job-application/initiate", {
    method: "POST",
    body: payload,
  });

  return response;
};

/** Public — called from the job-apply-callback page after bKash redirects back. */
export const executeJobApplication = async (paymentID: string) => {
  const response = await apiRequest("job-application/execute", {
    method: "POST",
    body: JSON.stringify({ paymentID }),
  });

  return response;
};

export const getAllJobApplications = async (
  params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    circular_id?: string;
    payment_status?: string;
  } = {},
) => {
  const queryParams = new URLSearchParams();

  queryParams.append("page", String(params.page ?? 1));
  queryParams.append("limit", String(params.limit ?? 10));

  if (params.searchTerm) {
    queryParams.append("searchTerm", params.searchTerm);
  }
  if (params.circular_id) {
    queryParams.append("circular_id", params.circular_id);
  }
  if (params.payment_status) {
    queryParams.append("payment_status", params.payment_status);
  }

  const response = await apiRequest(
    `job-application?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getJobApplicationById = async (id: string) => {
  const response = await apiRequest(`job-application/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const deleteJobApplication = async (id: string) => {
  const response = await apiRequest(`job-application/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};
