export type TStaffResignation = {
  id: string;
  staff_id: string;
  reason: string;
  resignation_date: string;
  created_at: string;
  updated_at: string;
  staff?: {
    id: string;
    full_name: string;
    phone: string;
    email?: string | null;
    gender?: string | null;
    staff_type?: string | null;
    photo?: string | null;
    designation?: {
      id: string;
      name: string;
    } | null;
  };
};

export type TStaffResignationResponse = {
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
    data: TStaffResignation[];
  };
};

export type TAdminStaffResignationResponse = {
  success: boolean;
  statusCode: number;
  message: string;
  meta: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    limit: number;
  };
  data: TStaffResignation[];
};
