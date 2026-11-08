"use server";

import { revalidatePath } from "next/cache";
import type { FieldValues } from "react-hook-form";
import { apiRequest } from "@/lib/apiRequest";
import { setAuthCookies } from "@/services/admin-auth";
import type { QueryParams } from "@/types/shared/query.type";

export const getStudents = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString() ? `student?${queryParams.toString()}` : "student",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getStudentsByClassIdAndSectionId = async (
  academic_class_id: string,
  academic_section_id?: string,
) => {
  const response = await apiRequest(
    `student/students-by-class-section?academic_class_id=${academic_class_id}${academic_section_id ? `&academic_section_id=${academic_section_id}` : ""}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const getStudent = async (id: string) => {
  const response = await apiRequest(`student/${id}`, {
    method: "GET",
    authRequired: true,
  });

  return response;
};

export const getMyStudentProfile = async () => {
  return apiRequest('student/me', {
    method: 'GET',
    authRequired: true,
  });
};

export const searchStudents = async (query: string) => {
  const queryParams = new URLSearchParams({ query });

  const response = await apiRequest(
    `student/search-students?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const createStudent = async (data: FormData) => {
  const response = await apiRequest("student", {
    method: "POST",
    authRequired: true,
    body: data,
  });
  revalidatePath("/dashboard/student-management/students");
  return response;
};
export const studentFeeCollection = async (data: FieldValues) => {
  const response = await apiRequest("student/fee-collection", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/students");
  return response;
};

export const studentPayment = async (data: FieldValues) => {
  const response = await apiRequest("student/self-fee-collection", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/student-dashboard");
  return response;
};
export const studentDuePayment = async (data: FieldValues) => {
  const response = await apiRequest("student/self-due-fee-collection", {
    method: "PATCH",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/student-dashboard");
  revalidatePath("dashboard/student-management/fee-collection");
  return response;
};
export const getStudentDueFee = async () => {
  const response = await apiRequest("student/due-fee", {
    method: "GET",
    authRequired: true,
  });
  return response;
};

export const getStudentFeeHistory = async (
  studentId: string,
  academicClassId?: string,
) => {
  const query = academicClassId
    ? `?${new URLSearchParams({ academic_class_id: academicClassId }).toString()}`
    : "";

  const response = await apiRequest(
    `student-fee-collection-item/student/${studentId}${query}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const updateStudentFeeCollectionItem = async (
  studentId: string,
  studentFeeCollectionItemId: string,
  data: { paid_amount: number; discount_amount: number },
) => {
  const response = await apiRequest(
    `student-fee-collection-item-edit/${studentFeeCollectionItemId}`,
    { method: "PUT", authRequired: true, body: JSON.stringify(data) },
  );
  revalidatePath(`/dashboard/student-management/edit-payment/${studentId}`);
  return response;
};

export const adminDuePayment = async (studentId: string, data: FieldValues) => {
  const response = await apiRequest("student/admin-due-payment", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath(`/dashboard/student-management/fee-collection/${studentId}`);
  return response;
};

export const initiateStudentBkashPayment = async () => {
  const response = await apiRequest("student/bkash/initiate", {
    method: "POST",
    authRequired: true,
  });
  return response;
};

export const executeStudentBkashPayment = async (paymentID: string) => {
  const response = await apiRequest("student/bkash/execute", {
    method: "POST",
    authRequired: true,
    body: JSON.stringify({ paymentID }),
  });
  return response;
};

export const loginStudent = async (data: FieldValues) => {
  const response = await apiRequest("student/login", {
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.success) {
    return {
      success: false,
      message: response.message ?? "Login failed",
    };
  }

  if (response.token?.accessToken && response.token?.refreshToken) {
    await setAuthCookies(
      response.token.accessToken,
      response.token.refreshToken,
    );
  }

  return {
    success: true,
    message: response.message,
    data: response.data,
  };
};

export const updateStudent = async (id: string, data: FieldValues) => {
  const response = await apiRequest(`student/${id}`, {
    method: "PUT",
    authRequired: true,
    body: JSON.stringify(data),
  });
  revalidatePath("/dashboard/student-management/students");
  return response;
};

export const deleteStudent = async (id: string) => {
  const response = await apiRequest(`student/${id}`, {
    method: "DELETE",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/students");
  return response;
};

export const registerStudent = async (data: FieldValues) => {
  const response = await apiRequest("student/register", {
    method: "POST",
    authRequired: false,
    body: JSON.stringify(data),
  });

  return response;
};

export const getPendingStudents = async (query: QueryParams[] = []) => {
  const queryParams = new URLSearchParams();
  query.forEach((param) => {
    queryParams.append(param.label, param.value);
  });

  const response = await apiRequest(
    queryParams.toString()
      ? `student/approval-request?${queryParams.toString()}`
      : "student/approval-request",
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response;
};

export const approveStudent = async (id: string) => {
  const response = await apiRequest(`student/${id}/approve`, {
    method: "PATCH",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/student-approval");
  return response;
};

export const rejectStudent = async (id: string) => {
  const response = await apiRequest(`student/${id}/reject`, {
    method: "PATCH",
    authRequired: true,
  });
  revalidatePath("/dashboard/student-management/student-approval");
  return response;
};
