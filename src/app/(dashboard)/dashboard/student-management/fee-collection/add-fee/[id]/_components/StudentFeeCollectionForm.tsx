"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import {
  type FeeItem,
  MONTHS,
  type Month,
} from "@/app/(dashboard)/dashboard/academics/fee-item/_components/types/fee-item";
import type { FeeType } from "@/app/(dashboard)/dashboard/academics/manage-fee/_components/types/fee-type";
import PaymentDateField, {
  getTodayDateString,
} from "@/components/shared/payment-date-field";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeeItemByFeeTypeId } from "@/services/feeItem";
import {
  type StudentFeeCollectionFormInput,
  type StudentFeeCollectionFormValues,
  studentFeeCollectionSchema,
} from "./validations";

const MONTH_INDEX: Record<Month, number> = {
  JANUARY: 0,
  FEBRUARY: 1,
  MARCH: 2,
  APRIL: 3,
  MAY: 4,
  JUNE: 5,
  JULY: 6,
  AUGUST: 7,
  SEPTEMBER: 8,
  OCTOBER: 9,
  NOVEMBER: 10,
  DECEMBER: 11,
};

const MONTH_NAME_BY_INDEX: Month[] = [...MONTHS];

const getMonthsInRange = (
  startMonth: Month | null,
  endMonth: Month | null,
): Month[] => {
  if (!startMonth || !endMonth) return [...MONTHS];

  const startIdx = MONTH_INDEX[startMonth];
  const endIdx = MONTH_INDEX[endMonth];
  const months: Month[] = [];

  if (startIdx <= endIdx) {
    for (let i = startIdx; i <= endIdx; i++) {
      months.push(MONTH_NAME_BY_INDEX[i]);
    }
  } else {
    for (let i = startIdx; i < 12; i++) {
      months.push(MONTH_NAME_BY_INDEX[i]);
    }
    for (let i = 0; i <= endIdx; i++) {
      months.push(MONTH_NAME_BY_INDEX[i]);
    }
  }
  return months;
};

const calculateFeeYear = (
  feeStartMonth: Month | null,
  feeMonth: Month | null,
  referenceDate: Date,
): number => {
  if (!feeStartMonth || !feeMonth) return referenceDate.getFullYear();

  const startIdx = MONTH_INDEX[feeStartMonth];
  const feeMonthIdx = MONTH_INDEX[feeMonth];
  const currentYear = referenceDate.getFullYear();
  const currentMonthIdx = referenceDate.getMonth();

  let cycleStartYear = currentYear;
  if (currentMonthIdx < startIdx) {
    cycleStartYear = currentYear - 1;
  }

  if (feeMonthIdx >= startIdx) {
    return cycleStartYear;
  } else {
    return cycleStartYear - 1;
  }
};

import type { AcademicClass } from "@/app/(dashboard)/dashboard/settings/system/class-config/_components/types/types";
import type { Department } from "@/app/(dashboard)/dashboard/settings/system/department/_components/types/index";
import type { Program } from "@/app/(dashboard)/dashboard/settings/system/program-config/_components/types/type";
import { getClassesByDepartmentId } from "@/services/academicClass";
import { getDepartmentByProgramId } from "@/services/department";
import { getFeeTypes } from "@/services/feeType";
import { getPrograms } from "@/services/program";

interface StudentFeeCollectionFormProps {
  feeTypes?: FeeType[]; // optional backward compat, now fetched via backend chain
  defaultStudentId: string;
  resetSignal?: number;
  onSubmit: (values: StudentFeeCollectionFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const calculateEstimatedFine = (
  feeItem: FeeItem | undefined,
  paidAmount: number | undefined,
): number => {
  if (
    !feeItem?.isFine ||
    !feeItem.payment_start_date ||
    !feeItem.last_payment_date ||
    !feeItem.everydayFine_amount
  ) {
    return 0;
  }
  if (!paidAmount || paidAmount <= 0) {
    return 0;
  }
  const today = new Date();
  const paymentDay = today.getDate();
  if (paymentDay < feeItem.payment_start_date) {
    return 0;
  }
  const effectivePaymentDay = Math.min(paymentDay, feeItem.last_payment_date);
  const fineDays = effectivePaymentDay - feeItem.payment_start_date + 1;
  return fineDays * feeItem.everydayFine_amount;
};

const formatAmount = (amount: number) =>
  new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 2,
  }).format(amount);

const StudentFeeCollectionForm = ({
  feeTypes: _initialFeeTypes,
  defaultStudentId,
  resetSignal,
  onSubmit,
  isSubmitting,
}: StudentFeeCollectionFormProps) => {
  const form = useForm<
    StudentFeeCollectionFormInput,
    any,
    StudentFeeCollectionFormValues
  >({
    resolver: zodResolver(studentFeeCollectionSchema),
    defaultValues: {
      student_id: defaultStudentId,
      fee_type_id: undefined,
      payment_method: "CASH",
      payment_note: undefined,
      payment_date: getTodayDateString(),
      items: [
        {
          fee_item_id: "",
          fee_month: null as any,
          fee_year: null as any,
          discount_amount: undefined,
          paid_amount: undefined,
          line_total_amount: undefined,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const selectedFeeTypeId = useWatch({
    control: form.control,
    name: "fee_type_id",
  });

  const watchedItems = useWatch({
    control: form.control,
    name: "items",
  }) as
    | Array<{
        fee_item_id?: string;
        fee_month?: string;
        fee_year?: number;
        discount_amount?: number;
        paid_amount?: number;
        line_total_amount?: number;
      }>
    | undefined;

  // ── Backend chaining Program → Department → Class → FeeType ──
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [feeTypes, setFeeTypes] = useState<FeeType[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingFeeTypes, setLoadingFeeTypes] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [feeItemsMap, setFeeItemsMap] = useState<Record<string, FeeItem[]>>({});
  const [loadingFeeItems, setLoadingFeeItems] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const res = await getPrograms([]);
        setPrograms(res?.data ?? []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingPrograms(false);
      }
    };
    fetchPrograms();
  }, []);

  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const res = await getDepartmentByProgramId(programId);
      const data = res?.data ?? [];
      setDepartments(Array.isArray(data) ? data : data ? [data] : []);
    } catch (e) {
      console.error(e);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchClasses = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setAcademicClasses([]);
      return;
    }
    setLoadingClasses(true);
    try {
      const res = await getClassesByDepartmentId(departmentId);
      setAcademicClasses(res?.data ?? []);
    } catch (e) {
      console.error(e);
      setAcademicClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchFeeTypesByClass = useCallback(async (classId: string) => {
    if (!classId) {
      setFeeTypes([]);
      return;
    }
    setLoadingFeeTypes(true);
    try {
      const res = await getFeeTypes([{ label: "classId", value: classId }]);
      setFeeTypes(res?.data ?? []);
    } catch (e) {
      console.error(e);
      setFeeTypes([]);
    } finally {
      setLoadingFeeTypes(false);
    }
  }, []);

  const handleProgramChange = (programId: string | null) => {
    const id = programId ?? "";
    setSelectedProgramId(id);
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setDepartments([]);
    setAcademicClasses([]);
    setFeeTypes([]);
    form.setValue("fee_type_id" as any, undefined);
    fields.forEach((_, idx) => {
      form.setValue(`items.${idx}.fee_item_id` as const, "");
      form.setValue(`items.${idx}.line_total_amount` as const, undefined);
    });
    if (id) fetchDepartments(id);
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? "";
    setSelectedDepartmentId(id);
    setSelectedClassId("");
    setAcademicClasses([]);
    setFeeTypes([]);
    form.setValue("fee_type_id" as any, undefined);
    fields.forEach((_, idx) => {
      form.setValue(`items.${idx}.fee_item_id` as const, "");
      form.setValue(`items.${idx}.line_total_amount` as const, undefined);
    });
    if (id) fetchClasses(id);
  };

  const handleClassChange = (classId: string | null) => {
    const id = classId ?? "";
    setSelectedClassId(id);
    setFeeTypes([]);
    form.setValue("fee_type_id" as any, undefined);
    fields.forEach((_, idx) => {
      form.setValue(`items.${idx}.fee_item_id` as const, "");
      form.setValue(`items.${idx}.line_total_amount` as const, undefined);
    });
    if (id) fetchFeeTypesByClass(id);
  };

  const fetchFeeItems = useCallback(
    async (feeTypeId: string) => {
      if (feeItemsMap[feeTypeId]) return;
      setLoadingFeeItems(true);
      try {
        const response = await getFeeItemByFeeTypeId(feeTypeId);
        const items: FeeItem[] = response?.data ?? [];
        setFeeItemsMap((prev) => ({ ...prev, [feeTypeId]: items }));
      } catch {
        setFeeItemsMap((prev) => ({ ...prev, [feeTypeId]: [] }));
      } finally {
        setLoadingFeeItems(false);
      }
    },
    [feeItemsMap],
  );

  useEffect(() => {
    if (selectedFeeTypeId) {
      fetchFeeItems(selectedFeeTypeId);
    }
  }, [selectedFeeTypeId, fetchFeeItems]);

  useEffect(() => {
    form.reset({
      student_id: defaultStudentId,
      fee_type_id: undefined,
      payment_method: "CASH",
      payment_note: undefined,
      payment_date: getTodayDateString(),
      items: [
        {
          fee_item_id: "",
          fee_month: null as any,
          fee_year: null as any,
          discount_amount: undefined,
          paid_amount: undefined,
          line_total_amount: undefined,
        },
      ],
    });
    // reset chaining on student change
    setSelectedProgramId("");
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setDepartments([]);
    setAcademicClasses([]);
    setFeeTypes([]);
  }, [defaultStudentId, form, resetSignal]);

  const currentFeeItems = selectedFeeTypeId
    ? (feeItemsMap[selectedFeeTypeId] ?? [])
    : [];

  return (
    <form
      id="student-fee-collection-form"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <FieldGroup className="gap-5">
        {/* Program → Department → Class → FeeType backend chain */}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Program</FieldLabel>
            <Select
              onValueChange={handleProgramChange}
              value={selectedProgramId || null}
              disabled={loadingPrograms}
            >
              <SelectTrigger>
                <SelectValue>
                  {programs.find((p) => p.id === selectedProgramId)
                    ?.program_name ??
                    (loadingPrograms
                      ? "Loading programs..."
                      : "Select a program")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {programs.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.program_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field>
            <FieldLabel>Department</FieldLabel>
            <Select
              onValueChange={handleDepartmentChange}
              value={selectedDepartmentId || null}
              disabled={!selectedProgramId || loadingDepartments}
            >
              <SelectTrigger>
                <SelectValue>
                  {departments.find((d) => d.id === selectedDepartmentId)
                    ?.department_name ??
                    (!selectedProgramId
                      ? "Select a program first"
                      : loadingDepartments
                        ? "Loading..."
                        : "Select a department")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.department_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel>Class / Year</FieldLabel>
            <Select
              onValueChange={handleClassChange}
              value={selectedClassId || null}
              disabled={!selectedDepartmentId || loadingClasses}
            >
              <SelectTrigger>
                <SelectValue>
                  {academicClasses.find((c) => c.id === selectedClassId)
                    ?.class_name ??
                    (!selectedDepartmentId
                      ? "Select a department first"
                      : loadingClasses
                        ? "Loading..."
                        : "Select a class")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicClasses.map((c) => (
                  <SelectItem
                    key={c.id}
                    value={c.id}
                  >{`${c.class_name}${(c as any).year_level ? ` - Year ${(c as any).year_level}` : ""}`}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Controller
            name="fee_type_id"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Fee Type</FieldLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    fields.forEach((_, idx) => {
                      form.setValue(`items.${idx}.fee_item_id` as const, "");
                      form.setValue(
                        `items.${idx}.line_total_amount` as const,
                        undefined,
                      );
                    });
                  }}
                  value={field.value ?? null}
                  disabled={!selectedClassId || loadingFeeTypes}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={
                        !selectedClassId
                          ? "Select a class first"
                          : loadingFeeTypes
                            ? "Loading..."
                            : feeTypes.length === 0
                              ? "No fee types for this class"
                              : "Select a fee type"
                      }
                    >
                      {(value) => {
                        const feeType = feeTypes.find((ft) => ft.id === value);
                        return feeType?.name ?? value;
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {feeTypes.map((feeType) => (
                      <SelectItem key={feeType.id} value={feeType.id}>
                        {feeType.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="payment_method"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Payment Method</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value ?? "CASH"}
                >
                  <SelectTrigger
                    id={field.name}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="BKASH">bKash</SelectItem>
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Controller
            name="payment_note"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>
                  Payment Note (optional)
                </FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Partial payment"
                  value={(field.value ?? "") as string}
                />
              </Field>
            )}
          />

          <Controller
            name="payment_date"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <PaymentDateField
                  id={field.name}
                  value={(field.value ?? getTodayDateString()) as string}
                  onChange={field.onChange}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        <div className="space-y-3">
          <FieldLabel>Fee Items</FieldLabel>

          {fields.map((item, index) => {
            const itemData = watchedItems?.[index];
            const selectedFeeItemId = itemData?.fee_item_id;
            const selectedFeeItem = currentFeeItems.find(
              (fi) => fi.id === selectedFeeItemId,
            );
            const paidAmount = itemData?.paid_amount;
            const discountAmount = itemData?.discount_amount;
            const lineTotalAmount = itemData?.line_total_amount;

            const isOneTime = selectedFeeItem?.FeeItemType === "OneTime";
            const estimatedFine = isOneTime
              ? 0
              : calculateEstimatedFine(selectedFeeItem, paidAmount);
            const totalWithFine = (lineTotalAmount ?? 0) + estimatedFine;
            const dueAmount =
              totalWithFine - (discountAmount ?? 0) - (paidAmount ?? 0);

            return (
              <div key={item.id} className="space-y-2 rounded-md border p-3">
                <div
                  className={`grid items-end gap-2 ${isOneTime ? "grid-cols-[2fr_1fr_1fr_1fr_auto]" : "grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto]"}`}
                >
                  <Controller
                    name={`items.${index}.fee_item_id`}
                    control={form.control}
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid}>
                        <FieldLabel htmlFor={field.name}>Fee Item</FieldLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            const selectedItem = currentFeeItems.find(
                              (fi) => fi.id === value,
                            );
                            form.setValue(
                              `items.${index}.line_total_amount` as const,
                              selectedItem?.amount ?? 0,
                            );
                            if (selectedItem?.FeeItemType === "OneTime") {
                              form.setValue(
                                `items.${index}.paid_amount` as const,
                                selectedItem.amount,
                              );
                              form.setValue(
                                `items.${index}.discount_amount` as const,
                                0,
                              );
                            }
                          }}
                          value={field.value ?? null}
                          disabled={!selectedFeeTypeId || loadingFeeItems}
                        >
                          <SelectTrigger
                            id={field.name}
                            aria-invalid={fieldState.invalid}
                          >
                            <SelectValue
                              placeholder={
                                loadingFeeItems
                                  ? "Loading..."
                                  : !selectedFeeTypeId
                                    ? "Select fee type first"
                                    : "Select item"
                              }
                            >
                              {(value) => {
                                const feeItem = currentFeeItems.find(
                                  (fi) => fi.id === value,
                                );
                                return feeItem?.name ?? value;
                              }}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {currentFeeItems.map((feeItem) => (
                              <SelectItem key={feeItem.id} value={feeItem.id}>
                                {feeItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fieldState.invalid && (
                          <FieldError errors={[fieldState.error]} />
                        )}
                      </Field>
                    )}
                  />

                  {!isOneTime && selectedFeeItem && (
                    <>
                      <Controller
                        name={`items.${index}.fee_month`}
                        control={form.control}
                        render={({ field, fieldState }) => {
                          const allowedMonths = getMonthsInRange(
                            selectedFeeItem.feeStartMonth,
                            selectedFeeItem.feeEndMonth,
                          );
                          return (
                            <Field data-invalid={fieldState.invalid}>
                              <FieldLabel htmlFor={field.name}>
                                Fee Month
                              </FieldLabel>
                              <Select
                                onValueChange={(value) => {
                                  field.onChange(value);
                                  // Auto-calculate fee_year when month changes
                                  if (value && selectedFeeItem?.feeStartMonth) {
                                    const year = calculateFeeYear(
                                      selectedFeeItem.feeStartMonth,
                                      value as Month,
                                      new Date(),
                                    );
                                    form.setValue(
                                      `items.${index}.fee_year` as const,
                                      year,
                                    );
                                  } else if (value === null) {
                                    form.setValue(
                                      `items.${index}.fee_year` as const,
                                      null,
                                    );
                                  }
                                }}
                                value={field.value ?? null}
                              >
                                <SelectTrigger
                                  id={field.name}
                                  aria-invalid={fieldState.invalid}
                                >
                                  <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allowedMonths.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m.charAt(0) + m.slice(1).toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          );
                        }}
                      />

                      <Controller
                        name={`items.${index}.fee_year`}
                        control={form.control}
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                              Fee Year
                            </FieldLabel>
                            <div
                              id={field.name}
                              aria-invalid={fieldState.invalid}
                              className="flex h-9 items-center rounded-md border border-input bg-white px-3 text-sm font-medium text-foreground"
                            >
                              {field.value ? String(field.value) : "—"}
                            </div>
                            {fieldState.invalid && (
                              <FieldError errors={[fieldState.error]} />
                            )}
                          </Field>
                        )}
                      />
                    </>
                  )}

                  {!isOneTime && (
                    <>
                      <Controller
                        name={`items.${index}.discount_amount`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel htmlFor={field.name}>
                              Discount
                            </FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              type="number"
                              value={(field.value ?? "") as string | number}
                            />
                          </Field>
                        )}
                      />

                      <Controller
                        name={`items.${index}.paid_amount`}
                        control={form.control}
                        render={({ field }) => (
                          <Field>
                            <FieldLabel htmlFor={field.name}>Paid</FieldLabel>
                            <Input
                              {...field}
                              id={field.name}
                              type="number"
                              value={(field.value ?? "") as string | number}
                            />
                          </Field>
                        )}
                      />
                    </>
                  )}

                  {isOneTime && (
                    <Field>
                      <FieldLabel>Amount</FieldLabel>
                      <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm font-medium">
                        {formatAmount(lineTotalAmount ?? 0)}
                      </div>
                    </Field>
                  )}

                  <Controller
                    name={`items.${index}.line_total_amount`}
                    control={form.control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>Total</FieldLabel>
                        <Input
                          {...field}
                          id={field.name}
                          type="number"
                          value={(field.value ?? "") as string | number}
                          readOnly
                          className="bg-muted cursor-not-allowed"
                        />
                      </Field>
                    )}
                  />

                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label="Remove item"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {selectedFeeItem?.isFine && (
                  <div className="flex flex-wrap items-center gap-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="font-medium">Fine item:</span>
                    <span>
                      Window: day {selectedFeeItem.payment_start_date} –{" "}
                      {selectedFeeItem.last_payment_date}
                    </span>
                    <span>
                      Daily rate:{" "}
                      {formatAmount(selectedFeeItem.everydayFine_amount ?? 0)}
                    </span>
                    {estimatedFine > 0 && (
                      <span className="font-semibold">
                        Est. fine today: {formatAmount(estimatedFine)}
                      </span>
                    )}
                    {estimatedFine === 0 && (paidAmount ?? 0) > 0 && (
                      <span className="text-green-700">
                        No fine (within window)
                      </span>
                    )}
                    {(paidAmount ?? 0) === 0 && (
                      <span className="text-muted-foreground">
                        No fine (no payment now)
                      </span>
                    )}
                  </div>
                )}

                {selectedFeeItem && (
                  <div className="flex flex-wrap items-center gap-4 rounded-md bg-muted/30 px-3 py-2 text-xs">
                    <span>
                      Total:{" "}
                      <span className="font-medium">
                        {formatAmount(totalWithFine)}
                      </span>
                      {estimatedFine > 0 && (
                        <span className="text-amber-700">
                          {" "}
                          (incl. {formatAmount(estimatedFine)} fine)
                        </span>
                      )}
                    </span>
                    <span>
                      Due:{" "}
                      <span
                        className={`font-medium ${dueAmount > 0 ? "text-destructive" : "text-green-600"}`}
                      >
                        {formatAmount(Math.max(dueAmount, 0))}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {form.formState.errors.items?.root && (
            <p className="text-sm text-destructive">
              {form.formState.errors.items.root.message}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!selectedFeeTypeId}
            onClick={() =>
              append({
                fee_item_id: "",
                fee_month: null as any,
                fee_year: null as any,
                discount_amount: undefined,
                paid_amount: undefined,
                line_total_amount: undefined,
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add fee item
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Collecting...
            </>
          ) : (
            "Collect Fee"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default StudentFeeCollectionForm;
