"use server";

import { apiRequest } from "@/lib/apiRequest";
import { DashboardFilter } from "@/types/dashboard/overview.type";

export const getDashboardOverview = async ({
  startDate,
  endDate,
  filter,
}: {
  startDate?: string;
  endDate?: string;
  filter?: DashboardFilter;
} = {}) => {
  const queryParams = new URLSearchParams();

  if (startDate) {
    queryParams.append("startDate", startDate);
  }

  if (endDate) {
    queryParams.append("endDate", endDate);
  }

  if (filter && Object.keys(filter).length > 0) {
    queryParams.append("filter", encodeURIComponent(JSON.stringify(filter)));
  }

  const queryString = queryParams.toString();

  const response = await apiRequest(
    queryString ? `dashboard/overview?${queryString}` : "dashboard/overview",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};