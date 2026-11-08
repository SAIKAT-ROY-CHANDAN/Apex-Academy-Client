"use server";

import { apiRequest } from "@/lib/apiRequest";

export type PeriodTime = {
  periodNumber: number;
  startTime: string;
  endTime: string;
};

export type PeriodSetting = {
  id: string;
  period_count: number;
  periods: PeriodTime[] | null;
  created_at: string;
  updated_at: string;
};

export type PeriodSettingResponse = {
  success?: boolean;
  message?: string;
  data?: PeriodSetting | null;
};

export type PeriodSettingPayload = {
  period_count: number;
  periods?: PeriodTime[];
};

export type PeriodSettingUpdatePayload = {
  period_count?: number;
  periods?: PeriodTime[];
};

/**
 * Returns the raw API envelope so callers can distinguish "loaded" from
 * "failed". Throws when the request itself fails (network / non-JSON).
 */
export const getPeriodSetting = async (): Promise<PeriodSettingResponse> => {
  return await apiRequest("period-setting", {
    method: "GET",
    authRequired: true,
  });
};

export const createPeriodSetting = async (payload: PeriodSettingPayload) => {
  const response = await apiRequest("period-setting", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  return response;
};

export const updatePeriodSetting = async (
  payload: PeriodSettingUpdatePayload,
) => {
  const response = await apiRequest("period-setting", {
    method: "PATCH",
    body: JSON.stringify(payload),
    authRequired: true,
  });
  return response;
};
