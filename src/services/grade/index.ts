"use server";

import { apiRequest } from "@/lib/apiRequest";

export const getGradeScales = async () => {
  const res = await apiRequest("grade", {
    method: "GET",
    authRequired: true,
  });
  return res;
};

export const calculateGrade = async (obtainMarks: number, totalMarks: number) => {
  const res = await apiRequest("grade/calculate", {
    method: "POST",
    body: JSON.stringify({ obtainMarks, totalMarks }),
    authRequired: true,
  });
  return res;
};
