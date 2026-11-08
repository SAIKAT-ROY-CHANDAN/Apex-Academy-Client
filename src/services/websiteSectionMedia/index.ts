"use server";

import { revalidatePath } from "next/cache";
import { apiRequest } from "@/lib/apiRequest";

const ENDPOINT = "website-settings/media";

export type SectionMediaType = "photo" | "video" | "PHOTO" | "VIDEO";
export type SectionMediaSection =
  | "academic-programs"
  | "co-curriculum-activities"
  | "ACADEMIC_PROGRAMS"
  | "CO_CURRICULUM_ACTIVITIES"
  | string;

const REVALIDATE_PATHS = [
  "/dashboard/website/academic-programs",
  "/website-settings/academic-programs",
  "/website-settings/co-curriculum-activities",
  "/academic-programs/media",
  "/website-settings/media",
];

function normalizeSection(section: SectionMediaSection): string {
  return String(section).toLowerCase();
}

export const getWebsiteSectionMedia = async (
  section: SectionMediaSection,
  type: SectionMediaType
) => {
  const normalizedSection = normalizeSection(section);
  const normalizedType = String(type).toLowerCase();
  const response = await apiRequest(
    `${ENDPOINT}?section=${normalizedSection}&type=${normalizedType}`,
    { method: "GET" }
  );
  return response;
};

export const getAllWebsiteSectionMedia = async (
  section?: SectionMediaSection,
  type?: SectionMediaType
) => {
  const params = new URLSearchParams();
  if (section) params.set("section", normalizeSection(section));
  if (type) params.set("type", String(type).toLowerCase());
  const qs = params.toString();
  const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
  const response = await apiRequest(url, { method: "GET" });
  return response;
};

export const createWebsiteSectionMedia = async (payload: FormData) => {
  const response = await apiRequest(ENDPOINT, {
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

export const deleteWebsiteSectionMedia = async (id: string) => {
  const response = await apiRequest(`${ENDPOINT}/${id}`, {
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

export const deleteAllWebsiteSectionMedia = async (
  section?: SectionMediaSection,
  type?: SectionMediaType
) => {
  const params = new URLSearchParams();
  if (section) params.set("section", normalizeSection(section));
  if (type) params.set("type", String(type).toLowerCase());
  const qs = params.toString();
  const url = qs ? `${ENDPOINT}?${qs}` : ENDPOINT;
  const response = await apiRequest(url, {
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
