"use server";

import { apiRequest } from "@/lib/apiRequest";
import { revalidatePath } from "next/cache";
import { FieldValues } from "react-hook-form";
import { QueryParams } from "@/types/shared/query.type";
import { SalaryAdvance } from "@/types/modules/payroll";

export type PreviewPayrollParams = {
  month: number;
  year: number;
  query?: QueryParams[];
};

export type PreviewStaffPayrollParams = {
  month: number;
  year: number;
  staffId: string;
};

export type CreateStaffPayrollParams = PreviewStaffPayrollParams & {
  paymentMethod: "CASH" | "BANK" | "BKASH";
  paymentNote?: string;
};

export type PreviewPayrollBackendRow = {
  sl: number;
  staffId: string;
  name: string;
  designation: string;
  department?: string;
  netSalary: number;
  advanceSalary: number;
  payableAmount: number;
  status: string;
  generated: boolean;
};

export const previewPayroll = async (params: PreviewPayrollParams) => {
  const { month, year, query = [] } = params;
  const searchParams = new URLSearchParams({
    month: String(month),
    year: String(year),
  });

  query.forEach((param) => {
    searchParams.append(param.label, param.value);
  });

  const endpoint = `staff-payroll/preview?${searchParams.toString()}`;
  const response = await apiRequest(endpoint, {
    cache: "no-store",
  });

  return response;
};

export const calculateStaffPayroll = async (
  params: PreviewStaffPayrollParams,
) => {
  const { month, year, staffId } = params;
  const endpoint = `staff-payroll/calculate?month=${month}&year=${year}&staffId=${staffId}`;
  const response = await apiRequest(endpoint);

  return response;
};

export const createStaffPayroll = async (params: CreateStaffPayrollParams) => {
  const {
    month,
    year,
    staffId,
    paymentMethod,
    paymentNote,
  } = params;

  const payload: Record<string, unknown> = {
    month,
    year,
    staffId,
    payment_method: paymentMethod,
    payment_note: paymentNote,
  };

  const response = await apiRequest("staff-payroll", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/payroll/staff-payroll");
  return response;
};


export type StaffPayrollHistoryRow = {
  sl: number;
  paymentId: string;
  staffId: string;
  staffName: string;
  designation: string;
  month: number;
  year: number;
  amount: number;
  paymentMethod: "CASH" | "BANK" | "BKASH";
  transactionId: string | null;
  bkashSenderNumber: string | null;
  bkashReceiverNumber: string | null;
  paymentNote: string | null;
  paidAt: string;
  paidByAdmin: string;
};

export type StaffPayrollHistorySummary = {
  totalMonthsPaid: number;
  totalAmountPaid: number;
};

export type StaffPayrollHistoryResponse = {
  data: StaffPayrollHistoryRow[];
  meta?: {
    totalPages: number;
    totalItems: number;
    page: number;
    limit: number;
  };
  summary: StaffPayrollHistorySummary;
};

export const getStaffPayrollHistory = async (
  staffId: string,
  query: QueryParams[] = [],
): Promise<StaffPayrollHistoryResponse> => {
  const searchParams = new URLSearchParams({ staffId });
  query.forEach((q) => searchParams.append(q.label, q.value));

  const endpoint = `staff-payroll/history?${searchParams.toString()}`;
  const response = await apiRequest(endpoint, {
    method: "GET",
    authRequired: true,
  });
  return response as StaffPayrollHistoryResponse;
};

export type StaffAdvanceSalaryResponse = {
  data: SalaryAdvance[];
  meta?: {
    totalPages: number;
    totalItems: number;
  };
};

export const getStaffAdvanceSalary = async (
  staffId: string,
  month?: number,
  year?: number,
  query: QueryParams[] = [],
) => {
  const searchParams = new URLSearchParams({ staff_id: staffId });

  if (month && !Number.isNaN(month)) searchParams.append("month", String(month));
  if (year && !Number.isNaN(year)) searchParams.append("year", String(year));

  if (!query.some((q) => q.label === "limit")) {
    searchParams.append("limit", "100");
  }

  query.forEach((q) => searchParams.append(q.label, q.value));

  const endpoint = `salary-advance?${searchParams.toString()}`;
  const response = await apiRequest(endpoint, {
    method: "GET",
    authRequired: true,
    cache: "no-store",
  });
  return response as StaffAdvanceSalaryResponse;
};

// ADVANCED SALARY SERVICES (using same salary-advance endpoint)
export const createAdvancedSalary = async (payload: FieldValues) => {
  const response = await apiRequest("salary-advance", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};
