"use server";

import { apiRequest } from "@/lib/apiRequest";

export type TBulkSmsTarget =
  | "ALL_STUDENTS"
  | "STUDENT"
  | "BATCH"
  | "CLASS"
  | "SHIFT"
  | "MANUAL";

export type TSendBulkSmsPayload = {
  message: string;
  target: TBulkSmsTarget;
  targetId?: string;
  phoneNumbers?: string[];
};

export const sendBulkSms = async (payload: TSendBulkSmsPayload) => {
  const response = await apiRequest("bulk-sms/send", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(payload),
  });

  return response;
};
