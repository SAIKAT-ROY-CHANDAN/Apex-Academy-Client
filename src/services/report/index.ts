"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";

export const getAllOverviewCount = async () => {
  const response = await apiRequest("report/overview", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getOrganizationalExpensesReport = async (
  query: QueryParams[] = []
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `report/expenses?${queryParams.toString()}`
      : "report/expenses",
    {
      method: "GET",
      authRequired: true,
    }
  );

  return response;
};

export const getOrganizationalIncomeReport = async (
  query: QueryParams[] = []
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `report/income?${queryParams.toString()}`
      : "report/income",
    {
      method: "GET",
      authRequired: true,
    }
  );

  return response;
};

export const getStudentCollectionReport = async (
  query: QueryParams[] = []
) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `report/student-collections?${queryParams.toString()}`
      : "report/student-collections",
    {
      method: "GET",
      authRequired: true,
    }
  );

  return response;
};

export const getStudentDueReport = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `report/student-due?${queryParams.toString()}`
      : "report/student-due",
    {
      method: "GET",
      authRequired: true,
    }
  );

  return response;
};
