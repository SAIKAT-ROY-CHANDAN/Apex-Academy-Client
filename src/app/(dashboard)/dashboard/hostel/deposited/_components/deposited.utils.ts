export const TAKA = "\u09F3";
export const PAGE_SIZE = 10;

export type SelectOption = { value: string; label: string };

export type InvoiceStatus = "PAID" | "PARTIAL" | "UNPAID";

export interface HostelInvoiceSnapshot {
  id: string;
  invoice_no?: string;
  issue_date?: string;
  due_date?: string;
  total_amount?: number;
  scholarship_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  status?: InvoiceStatus;
}

export interface HostelFeeCollectionItemRecord {
  id: string;
  item_name?: string;
  item_amount?: number;
}

export interface MealCollectionRecord {
  id: string;
  meal_count?: number;
  meal_rate?: number;
  total_amount?: number;
}

export interface HostelFeeCollectionRecord {
  id: string;
  collection_date?: string;
  total_amount?: number;
  scholarship_amount?: number;
  paid_amount?: number;
  due_amount?: number;
  payment_method?: "CASH" | "BKASH" | null;
  hostelFeeCollectionItems?: HostelFeeCollectionItemRecord[];
  mealCollection?: MealCollectionRecord | null;
  hostelInvoice?: HostelInvoiceSnapshot | null;
  student?: {
    id?: string;
    name?: string;
    photo?: string | null;
    studentEnrollments?: Array<{
      academicClass?: {
        class_name?: string;
        group?: string;
        department?: { department_name?: string };
      };
      batch?: { batch_name?: string };
      academicSection?: { section_name?: string };
      academicSession?: { session_name?: string };
    }>;
    hostelAllocation?: {
      hostelRoom?: {
        floor_no?: string | number;
        room_no?: string | number;
        hostelFloor?: {
          building_name?: string;
          hostelConfiguration?: { building_name?: string };
        };
      };
    };
  };
}

export interface TableRow {
  id: string;
  slNo: string;
  name: string;
  avatarUrl: string | null;
  className: string;
  department: string;
  batch: string;
  year: string;
  section: string;
  totalAmount: number;
  scholarshipAmount: number;
  paidAmount: number;
  totalDue: number;
  invoiceNo: string;
  issuedAt: string;
  dueDate: string;
  invoiceStatus: InvoiceStatus | null;
}

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${day} ${MONTHS_SHORT[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatAmount(value: number): string {
  return `${TAKA} ${(Number(value) || 0).toLocaleString()}`;
}

export function transformRecordsToRows(
  records: HostelFeeCollectionRecord[],
): TableRow[] {
  return records.map((rec, idx) => {
    const enrollment = rec.student?.studentEnrollments?.[0];
    const studentName = rec.student?.name?.trim() || "Unknown Student";
    const avatarUrl =
      rec.student?.photo && typeof rec.student.photo === "string"
        ? rec.student.photo
        : null;

    return {
      id: rec.id,
      slNo: String(idx + 1),
      name: studentName,
      avatarUrl,
      className: enrollment?.academicClass?.class_name || "—",
      department:
        enrollment?.academicClass?.group ||
        enrollment?.academicClass?.department?.department_name ||
        "—",
      batch: enrollment?.batch?.batch_name || "—",
      year: enrollment?.academicSession?.session_name || "—",
      section: enrollment?.academicSection?.section_name || "—",
      totalAmount: Number(rec.total_amount) || 0,
      scholarshipAmount:
        Number(rec.scholarship_amount) ||
        Number(rec.hostelInvoice?.scholarship_amount) ||
        0,
      paidAmount: Number(rec.paid_amount) || 0,
      totalDue: Number(rec.hostelInvoice?.due_amount ?? rec.due_amount) || 0,
      invoiceNo: rec.hostelInvoice?.invoice_no || "—",
      issuedAt: formatDate(
        rec.hostelInvoice?.issue_date ?? rec.collection_date,
      ),
      dueDate: formatDate(rec.hostelInvoice?.due_date),
      invoiceStatus:
        (rec.hostelInvoice?.status as InvoiceStatus | undefined) ?? null,
    };
  });
}

export function parseHostelFeeCollectionsResponse(res: unknown): {
  records: HostelFeeCollectionRecord[];
  count: number;
} {
  if (!res || typeof res !== "object" || !("success" in res)) {
    return { records: [], count: 0 };
  }

  const response = res as {
    success?: boolean;
    data?: unknown;
    meta?: { totalItems?: number; total?: number; count?: number };
  };
  if (!response.success) {
    return { records: [], count: 0 };
  }

  const rawData = response.data;
  let records: HostelFeeCollectionRecord[] = [];
  let count = 0;

  if (Array.isArray(rawData)) {
    records = rawData as HostelFeeCollectionRecord[];
    count = rawData.length;
  } else if (rawData && typeof rawData === "object") {
    const paginated = rawData as {
      data?: HostelFeeCollectionRecord[];
      items?: HostelFeeCollectionRecord[];
      total?: number;
      count?: number;
      totalCount?: number;
    };
    records = paginated.data ?? paginated.items ?? [];
    count =
      Number(paginated.total) ||
      Number(paginated.count) ||
      Number(paginated.totalCount) ||
      Number(response.meta?.totalItems) ||
      Number(response.meta?.total) ||
      records.length;
  }

  return {
    records,
    count: count >= records.length ? count : records.length,
  };
}

export const extractData = (response: unknown): Record<string, unknown>[] => {
  if (
    response &&
    typeof response === "object" &&
    "data" in response &&
    Array.isArray((response as { data: unknown }).data)
  ) {
    return (response as { data: Record<string, unknown>[] }).data;
  }

  if (Array.isArray(response)) {
    return response as Record<string, unknown>[];
  }

  return [];
};

export const mapToSelectOptions = (
  items: Record<string, unknown>[],
  getLabel: (item: Record<string, unknown>) => string,
): SelectOption[] =>
  items.map((item) => ({
    value: String(item.id),
    label: getLabel(item),
  }));

export function getMonthStartIso(monthValue: string): string {
  return new Date(`${monthValue}-01T00:00:00.000`).toISOString();
}

export function getMonthEndIso(monthValue: string): string {
  const [year, month] = monthValue.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return new Date(
    `${monthValue}-${String(lastDay).padStart(2, "0")}T23:59:59.999`,
  ).toISOString();
}

export function buildCollectionDateFilter(
  fromMonth: string,
  toMonth: string,
): Record<string, string> | undefined {
  const dateFilter: Record<string, string> = {};

  if (fromMonth) {
    dateFilter.gte = getMonthStartIso(fromMonth);
  }

  if (toMonth) {
    dateFilter.lte = getMonthEndIso(toMonth);
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : undefined;
}
