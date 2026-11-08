"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";

const REVALIDATE_PATHS = [
  "/dashboard/website/pages-cover",
  "/website-settings/page-cover",
];

export const getWebsitePageCovers = async () => {
  const response = await apiRequest("website-settings/page-cover", {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getPublicWebsitePageCovers = async () => {
  const response = await apiRequest("website-settings/page-cover", {
    method: "GET",
  });

  return response;
};

export const getPublicPageCover = async (
  pageKey:
    | "aboutCollege"
    | "managementTeam"
    | "academic"
    | "students"
    | "gallery"
    | "career"
    | "noticeBoard"
    | "contactUs"
) => {
  try {
    const res = await getPublicWebsitePageCovers();
    const url = res?.data?.[pageKey] as string | null | undefined;
    return url ?? null;
  } catch {
    return null;
  }
};

export const upsertWebsitePageCovers = async (payload: FormData) => {
  const response = await apiRequest("website-settings/page-cover", {
    method: "POST",
    body: payload,
    authRequired: true,
  });

  if (response?.success) {
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }
  }

  return response;
};

export const deleteAllWebsitePageCovers = async () => {
  const response = await apiRequest("website-settings/page-cover", {
    method: "DELETE",
    authRequired: true,
  });

  if (response?.success) {
    for (const path of REVALIDATE_PATHS) {
      revalidatePath(path);
    }
  }

  return response;
};
