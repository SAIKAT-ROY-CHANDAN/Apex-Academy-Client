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

export type PreviewTeacherPayrollParams = {
  month: number;
  year: number;
  teacherId: string;
};

export type CreateTeacherPayrollParams = PreviewTeacherPayrollParams & {
  paymentMethod: "CASH" | "BANK" | "BKASH";
  transactionId?: string;
  paymentNote?: string;
};

export type PreviewPayrollBackendRow = {
  sl: number;
  teacherId: string;
  name: string;
  designation: string;
  department: string;
  netSalary: number;
  advanceSalary: number;
  overtimeHours: number;
  overtimeAmount: number;
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

  const endpoint = `teacher-payroll/preview?${searchParams.toString()}`;
  const response = await apiRequest(endpoint, {
    cache: "no-store",
  });

  return response;
};

export const calculateTeacherPayroll = async (
  params: PreviewTeacherPayrollParams,
) => {
  const { month, year, teacherId } = params;
  const endpoint = `teacher-payroll/calculate?month=${month}&year=${year}&teacherId=${teacherId}`;
  const response = await apiRequest(endpoint);

  revalidatePath("/dashboard/payroll/teachers-payroll");
  return response;
};

export const createTeacherPayroll = async (
  params: CreateTeacherPayrollParams,
) => {
  const {
    month,
    year,
    teacherId,
    paymentMethod,
    transactionId,
    paymentNote,
  } = params;

  const payload: Record<string, unknown> = {
    month,
    year,
    teacherId,
    payment_method: paymentMethod,
    payment_note: paymentNote,
  };

  if (transactionId) payload.transaction_id = transactionId;

  const response = await apiRequest("teacher-payroll", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/payroll/teachers-payroll");
  return response;
};

// ADVANCED SALARY SERVICES
export const createAdvancedSalary = async (payload: FieldValues) => {
  const response = await apiRequest("salary-advance", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  revalidatePath("/dashboard/payroll/teachers-payroll");
  return response;
};

export type TeacherPayrollHistoryRow = {
  sl: number;
  paymentId: string;
  teacherId: string;
  teacherName: string;
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

export type TeacherPayrollHistorySummary = {
  totalMonthsPaid: number;
  totalAmountPaid: number;
};

export type TeacherPayrollHistoryResponse = {
  data: TeacherPayrollHistoryRow[];
  meta: {
    totalPages: number;
    totalItems: number;
  };
  summary: TeacherPayrollHistorySummary;
};

export const getTeacherPayrollHistory = async (
  teacherId: string,
  query: QueryParams[] = [],
) => {
  const searchParams = new URLSearchParams({ teacherId });
  query.forEach((q) => searchParams.append(q.label, q.value));

  const endpoint = `teacher-payroll/history?${searchParams.toString()}`;
  const response = await apiRequest(endpoint, {
    method: "GET",
    authRequired: true,
  });
  return response as TeacherPayrollHistoryResponse;
};

export type TeacherAdvanceSalaryResponse = {
  data: SalaryAdvance[];
  meta?: {
    totalPages: number;
    totalItems: number;
  };
};

export const getTeacherAdvanceSalary = async (
  teacherId: string,
  month?: number,
  year?: number,
  query: QueryParams[] = [],
) => {
  const searchParams = new URLSearchParams({ teacher_id: teacherId });

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
  return response as TeacherAdvanceSalaryResponse;
};
