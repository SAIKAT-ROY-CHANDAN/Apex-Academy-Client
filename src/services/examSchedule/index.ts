"use server";

import { apiRequest } from "@/lib/apiRequest";
import { QueryParams } from "@/types/shared/query.type";
import { FieldValues } from "react-hook-form";

export const createExamSchedule = async (payload: FieldValues) => {
  const response = await apiRequest("exam-schedule", {
    method: "POST",
    body: JSON.stringify(payload),
    authRequired: true,
  });

  return response;
};

export const getExamSchedules = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `exam-schedule?${queryParams.toString()}`
      : "exam-schedule",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getExamScheduleById = async (id: string) => {
  const response = await apiRequest(`exam-schedule/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getSubjectsWithScheduledExam = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `exam-schedule/subjects?${queryParams.toString()}`
      : "exam-schedule/subjects",
    { method: "GET", authRequired: true },
  );
  return response;
};

export const getExamConfigsWithScheduledExam = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });
  const response = await apiRequest(
    queryParams.toString()
      ? `exam-schedule/exam-configs?${queryParams.toString()}`
      : "exam-schedule/exam-configs",
    { method: "GET", authRequired: true },
  );
  return response;
};

export const updateExamSchedule = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`exam-schedule/${id}`, {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });

  return response;
};

export const deleteExamSchedule = async (id: string) => {
  const response = await apiRequest(`exam-schedule/${id}`, {
    method: "DELETE",
    authRequired: true,
  });

  return response;
};