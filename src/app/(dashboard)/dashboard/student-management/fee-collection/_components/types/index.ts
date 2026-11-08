export type TFeeItemRef = {
  id: string;
  name: string;
  amount: number;
  academic_session_id?: string;
  amount_every_subject?: number | null;
  fee_assign_for?: "REGULAR" | "SUPPLEMENTARY";
  subject_fail_count?: number;
  fee_type_id?: string;
  fee_type_name?: string;
  academic_class?: {
    class_name: string;
  };
  academic_session?: {
    session_name: string;
  };
  supplementary_class_name?: string;
  FeeItemType: "Monthly" | "OneTime" | "" | undefined;
};

export type TCollectionInfo = {
  id: string;
  paid_amount: number;
  payment_method: string;
  payment_note: string | null;
  collectedBy: string;
  created_at: string;
};

export type TStudentFeeCollectionItem = {
  id: string;
  student_enrollment_id?: string | null;
  paid_amount: number;
  discount_amount: number;
  line_total_amount: number;
  fine_amount: number;
  fee_month: string | null;
  fee_year: number | null;
  feeItem: TFeeItemRef | null;
  collectionInfos: TCollectionInfo[];
};

export type TFeeTypeRef = {
  id: string;
  name: string;
};

export type TStudentFeeCollection = {
  id: string;
  fee_type_id: string;
  student_id: string;
  feeType: TFeeTypeRef | null;
  studentFeeCollectionItems: TStudentFeeCollectionItem[];
};

export type TAcademicClassRef = {
  id: string;
  class_name: string;
  name?: string | null;
  department?: {
    department_name?: string | null;
    name?: string | null;
  } | null;
  program?: {
    program_name?: string | null;
    name?: string | null;
  } | null;
};

export type TStudentEnrollment = {
  id: string;
  academic_class_id: string;
  academic_session_id: string;
  academicClass: TAcademicClassRef | null;
  academic_class?: TAcademicClassRef | null;
  academicSession?: {
    session_name: string;
  };
  batch?: {
    batch_name?: string | null;
  } | null;
  program_name?: string | null;
  department_name?: string | null;
  academic_class_name?: string | null;
  program?: {
    program_name?: string | null;
    name?: string | null;
  } | null;
  department?: {
    department_name?: string | null;
    name?: string | null;
  } | null;
  enrollment_type?: "REGULAR" | "SUPPLEMENTARY" | "REPEAT";
  enrollment_status?: "ACTIVE" | "PROMOTED" | "WITH_BACKLOG" | "REPEATED";
  subject_fail_count?: number;
  is_primary?: boolean;
};

export type TMonthlyBreakdownItem = {
  feeItemId: string;
  feeItemName: string;
  fee_assign_for?: "REGULAR" | "SUPPLEMENTARY";
  amount_every_subject?: number | null;
  feeTypeId?: string | null;
  feeTypeName?: string | null;
  amount: number;
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;
  status: "PAID" | "PARTIAL" | "DUE";
};

export type TMonthlyBreakdownPeriod = {
  year: number;
  month: string;
  monthNumber: number;
  paymentCount: number;
  totalAmount: number;
  paidAmount: number;
  discountAmount: number;
  fineAmount: number;
  dueAmount: number;
  status: "PAID" | "PARTIAL" | "DUE";
  fineEligible: boolean;
  paymentDueDuringMonth: string;
  paymentDueYear: number;
  items: TMonthlyBreakdownItem[];
};

export type TFeeSummary = {
  classId: string;
  sessionId: string;
  sessionName?: string | null;
  billingStartYear: number;
  billingStartMonth: number;
  billingMonths: number;
  monthlyFeeAmount: number;
  totalPayable: number;
  totalBilled: number;
  totalPaid: number;
  totalDiscount: number;
  totalLineAmount: number;
  totalFine: number;
  dueAmount: number;
  monthlyBreakdown?: TMonthlyBreakdownPeriod[];
};

export type TStudentWithFeeCollections = {
  id: string;
  name: string;
  father_name: string;
  mother_name: string;
  religion: string;
  is_residential: boolean;
    registration_number: any;
  nid_no: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  student_phone: string;
  father_phone: string;
  mother_phone: string;
  photo: string | null;
  village_road: string;
  post_office: string;
  sub_district: string;
  district: string;
  email: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  studentEnrollments: TStudentEnrollment[];
  studentFeeCollections: TStudentFeeCollection[];
  feeSummary: TFeeSummary | null;
  unbilledOneTimeFees?: TUnbilledOneTimeFee[];
};

export type TUnbilledOneTimeFee = {
  id: string;
  name: string;
  amount: number;
  amount_every_subject?: number | null;
  fee_assign_for?: "REGULAR" | "SUPPLEMENTARY";
  subject_fail_count?: number;
  fee_type_id: string;
  fee_type_name?: string;
  academic_class?: {
    class_name: string;
  };
  academic_session?: {
    session_name: string;
  };
  supplementary_class_name?: string;
  source_enrollment_id?: string | null;
  FeeItemType: "Monthly" | "OneTime" | "" | undefined;
};

export type TStudentFeeCollectionQuery = {
  searchTerm?: string;
  filter?: Record<string, unknown>;
  orderBy?: Record<string, unknown>;
  page?: string | number;
  limit?: string | number;
  academicSessionId?: string;
};

export type TStudentFeeCollectionMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type TStudentFeeCollectionResponse = {
  success: boolean;
  message?: string;
  data: TStudentWithFeeCollections[];
  meta: TStudentFeeCollectionMeta;
};
