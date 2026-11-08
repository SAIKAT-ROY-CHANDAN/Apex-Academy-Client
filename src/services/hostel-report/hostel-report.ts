import { apiRequest } from "@/lib/apiRequest";

export interface HostelStudentsDueReportQueryParams {
  searchTerm?: string;
  filter?: Record<string, any>;
  orderBy?: Record<string, any>;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  programId?: string;
  classId?: string;
  batchId?: string;
  sectionId?: string;
  departmentId?: string;
  academicSessionId?: string;
}

export interface HostelDueCollection {
  id: string;
  collection_date: string;
  total_amount: number;
  paid_amount: number;
  due_amount: number;
}

export interface HostelConfiguration {
  id: string;
  name?: string;
  building_name?: string;
}

export interface HostelFloor {
  id: string;
  floor_name?: string;
  hostelConfiguration?: HostelConfiguration;
}

export interface HostelRoom {
  id: string;
  room_number?: string;
  hostelFloor?: HostelFloor;
}

export interface HostelAllocation {
  id: string;
  hostelRoom?: HostelRoom;
}

export interface HostelStudentsDueReportRow {
  id: string;
  name: string;
  father_name: string;
  mother_name: string;
  email: string;
  student_phone: string;
  gender: string;
  is_residential: boolean;
  due_collections: HostelDueCollection[];
  current_hostel_allocation: HostelAllocation | null;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface HostelStudentsDueReportResponse {
  meta: PaginationMeta;
  data: HostelStudentsDueReportRow[];
}

export const getHostelStudentsDueReport = async (
  params: HostelStudentsDueReportQueryParams = {},
): Promise<HostelStudentsDueReportResponse> => {
  const {
    searchTerm,
    filter,
    orderBy,
    page = 1,
    limit = 10,
    startDate,
    endDate,
    programId,
    classId,
    batchId,
    sectionId,
    departmentId,
    academicSessionId,
  } = params;

  const queryParams = new URLSearchParams();

  queryParams.append("page", String(page));
  queryParams.append("limit", String(limit));

  if (searchTerm) {
    queryParams.append("searchTerm", searchTerm);
  }

  if (filter && Object.keys(filter).length > 0) {
    queryParams.append("filter", JSON.stringify(filter));
  }

  if (orderBy && Object.keys(orderBy).length > 0) {
    queryParams.append("orderBy", JSON.stringify(orderBy));
  }

  if (startDate) {
    queryParams.append("startDate", startDate);
  }

  if (endDate) {
    queryParams.append("endDate", endDate);
  }

  if (classId) {
    queryParams.append("classId", classId);
  }

  if (programId) {
    queryParams.append("programId", programId);
  }

  if (batchId) {
    queryParams.append("batchId", batchId);
  }

  if (sectionId) {
    queryParams.append("sectionId", sectionId);
  }

  if (departmentId) {
    queryParams.append("departmentId", departmentId);
  }

  if (academicSessionId) {
    queryParams.append("academicSessionId", academicSessionId);
  }

  const response = await apiRequest(
    `hostel-expense/due-report?${queryParams.toString()}`,
    {
      method: "GET",
      authRequired: true,
    },
  );

  return response as HostelStudentsDueReportResponse;
};


export type HostelDashboardSummary = {
  totalCollection: number;
  totalBilled: number;
  totalDue: number;
  totalExpense: number;
};

export const getHostelDashboardSummary = async (from?: string, to?: string) => {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);

  const endpoint = `hostel-dashboard-summary${params.toString() ? `?${params}` : ""}`;
  const response = await apiRequest(endpoint, { method: "GET", authRequired: true });
  console.log(response, 'resposne')
  return response;
};