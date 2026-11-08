"use server";

// Thin compat wrapper — delegates to the unified websiteSectionMedia service
// so Academic Programs media is stored with section=academic-programs in the same underlying table.

import {
  getWebsiteSectionMedia,
  getAllWebsiteSectionMedia,
  createWebsiteSectionMedia,
  deleteWebsiteSectionMedia,
  deleteAllWebsiteSectionMedia,
  type SectionMediaType,
} from "@/services/websiteSectionMedia";

const SECTION = "academic-programs" as const;

export type AcademicMediaType = SectionMediaType;

export const getAcademicProgramMedia = async (type: AcademicMediaType) => {
  return getWebsiteSectionMedia(SECTION, type);
};

export const getAllAcademicProgramMedia = async () => {
  return getAllWebsiteSectionMedia(SECTION);
};

export const createAcademicProgramMedia = async (payload: FormData) => {
  // Ensure legacy callers that don't set section get the correct default
  if (!payload.has("section")) {
    payload.set("section", SECTION);
  }
  return createWebsiteSectionMedia(payload);
};

export const deleteAcademicProgramMedia = async (id: string) => {
  return deleteWebsiteSectionMedia(id);
};

export const deleteAllAcademicProgramMedia = async (type?: AcademicMediaType) => {
  return deleteAllWebsiteSectionMedia(SECTION, type);
};
