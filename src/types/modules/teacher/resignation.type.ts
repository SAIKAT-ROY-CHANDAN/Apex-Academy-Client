export type TResignationRequest = {
  id: string;
  teacher_id: string;
  reason: string;
  resignation_date: string;
  created_at: string;
  updated_at: string;
  teacher?: {
    id: string;
    full_name: string;
    phone: string;
  };
};

export type TResignationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
    meta: {
      totalItems: number;
      currentPage: number;
      totalPages: number;
      limit: number;
    };
    data: TResignationRequest[];
  };
};

export type TResignationCreateInput = {
  teacher_id: string;
  reason: string;
  resignation_date: string;
};

export type TAdminResignationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: TResignationRequest[];
};
