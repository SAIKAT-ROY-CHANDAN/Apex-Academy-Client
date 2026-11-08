"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";

export type CareerDevelopmentApplicationPayload = {
  programmeId: string;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
};

export type CareerDevelopmentApplication = {
  id: string;
  programmeId: string;
  fullName: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  created_at?: string;
};

const REVALIDATE_PATH = "/dashboard/website/career-development-programmes";

export const createWebsiteCareerDevelopmentApplication = async (
  payload: CareerDevelopmentApplicationPayload,
) => {
  const response = await apiRequest("website-career-development-application", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response;
};

export const getWebsiteCareerDevelopmentApplicationsByProgramme = async (
  programmeId: string,
) => {
  const response = await apiRequest(
    `website-career-development-application/programme/${programmeId}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const deleteWebsiteCareerDevelopmentApplication = async (id: string) => {
  const response = await apiRequest(
    `website-career-development-application/${id}`,
    {
      method: "DELETE",
      authRequired: true,
    },
  );

  if (response?.success) {
    revalidatePath(REVALIDATE_PATH);
  }

  return response;
};
