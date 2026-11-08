import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { getStudentFeeHistory } from "@/services/student";
import EditPaymentDetails from "../_components/EditPaymentDetails";

type EditPaymentPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ academic_class_id?: string | string[] }>;
};
type FeeHistoryRecord = Record<string, unknown>;
const getRecord = (value: unknown): FeeHistoryRecord | null =>
  value && typeof value === "object" ? (value as FeeHistoryRecord) : null;
const num = (v: unknown) => {
  const n = Number(v ?? 0);
  return Number.isFinite(n) ? n : 0;
};
const getFeeItems = (data: unknown): FeeHistoryRecord[] => {
  if (Array.isArray(data))
    return data.filter((item): item is FeeHistoryRecord =>
      Boolean(getRecord(item)),
    );
  const record = getRecord(data);
  if (!record) return [];
  if (Array.isArray(record.items)) return getFeeItems(record.items);
  if (Array.isArray(record.studentFeeCollectionItems))
    return getFeeItems(record.studentFeeCollectionItems);
  if (Array.isArray(record.studentFeeCollections))
    return record.studentFeeCollections.flatMap((collection) => {
      const collectionRecord = getRecord(collection);
      return collectionRecord &&
        Array.isArray(collectionRecord.studentFeeCollectionItems)
        ? getFeeItems(collectionRecord.studentFeeCollectionItems)
        : [];
    });
  return [];
};

const Page = async ({ params, searchParams }: EditPaymentPageProps) => {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const academicClassId = Array.isArray(resolvedSearchParams.academic_class_id)
    ? resolvedSearchParams.academic_class_id[0]
    : resolvedSearchParams.academic_class_id;
  const response = await getStudentFeeHistory(id, academicClassId);
  const feeItems =
    response?.success === false ? [] : getFeeItems(response?.data);
  const errorMessage =
    response?.success === false
      ? (response.message ?? "Unable to load fee history.")
      : null;

  const totals = feeItems.reduce(
    (
      acc: { payable: number; paid: number; discount: number; due: number },
      item,
    ) => {
      const payable = num(item.line_total_amount) + num(item.fine_amount);
      const paid = num(item.paid_amount);
      const discount = num(item.discount_amount);
      acc.payable += payable;
      acc.paid += paid;
      acc.discount += discount;
      acc.due += Math.max(0, payable - paid - discount);
      return acc;
    },
    { payable: 0, paid: 0, discount: 0, due: 0 },
  );
  const fmt = (v: number) =>
    new Intl.NumberFormat("en-BD", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(v);
  const stats = [
    { label: "Items", value: String(feeItems.length) },
    { label: "Payable", value: fmt(totals.payable) },
    { label: "Paid", value: fmt(totals.paid) },
    { label: "Discount", value: fmt(totals.discount) },
    { label: "Due", value: fmt(totals.due), highlight: true },
  ];

  return (
    <div className="space-y-3">
      <PageHeader
        title="Edit Payment"
        backHref="/dashboard/student-management/edit-payment"
      />
      <Card size="sm">
        <CardContent className="flex flex-wrap items-center gap-x-6 gap-y-2 py-3">
          <div className="mr-auto min-w-40 text-xs">
            <p className="font-semibold text-sm">Student ID: {id}</p>
            <p className="text-muted-foreground">
              {academicClassId
                ? `Class: ${academicClassId}`
                : "All academic classes"}
            </p>
          </div>
          {stats.map((s) => (
            <div key={s.label} className="min-w-20">
              <p className="text-[11px] text-muted-foreground">{s.label}</p>
              <p
                className={`text-sm font-semibold tabular-nums ${s.highlight ? "text-amber-700" : ""}`}
              >
                {s.value}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
      {errorMessage ? (
        <Card size="sm">
          <CardContent className="py-6 text-center text-sm text-destructive">
            {errorMessage}
          </CardContent>
        </Card>
      ) : feeItems.length === 0 ? (
        <Card size="sm">
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            No fee history found for this student.
          </CardContent>
        </Card>
      ) : (
        <EditPaymentDetails studentId={id} feeItems={feeItems} />
      )}
    </div>
  );
};

export default Page;
