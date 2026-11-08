"use client";

import { AlertCircle, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import {
  type Control,
  Controller,
  type UseFormSetValue,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";
import {
  type FeeItem,
  MONTHS,
  type Month,
} from "@/app/(dashboard)/dashboard/academics/fee-item/_components/types/fee-item";
import type { FeeType } from "@/app/(dashboard)/dashboard/academics/manage-fee/_components/types/fee-type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getFeeItemByFeeTypeId } from "@/services/feeItem";
import type { CreateStudentFormInput } from "./schema/student.schema";

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

const getMonthsInRange = (
  startMonth: Month | null,
  endMonth: Month | null,
): Month[] => {
  if (!startMonth || !endMonth) return [...MONTHS];

  const startIdx = MONTH_INDEX[startMonth];
  const endIdx = MONTH_INDEX[endMonth];
  const months: Month[] = [];

  if (startIdx <= endIdx) {
    // Normal range: e.g., JANUARY to JUNE
    for (let i = startIdx; i <= endIdx; i++) {
      months.push(MONTH_NAME_BY_INDEX[i]);
    }
  } else {
    // Wrapping range: e.g., JULY to JUNE (academic year)
    for (let i = startIdx; i < 12; i++) {
      months.push(MONTH_NAME_BY_INDEX[i]);
    }
    for (let i = 0; i <= endIdx; i++) {
      months.push(MONTH_NAME_BY_INDEX[i]);
    }
  }
  return months;
};

const MONTH_NAME_BY_INDEX: Month[] = [...MONTHS];

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

  // Find the most recent feeStartMonth occurrence <= referenceDate
  let cycleStartYear = currentYear;
  if (currentMonthIdx < startIdx) {
    cycleStartYear = currentYear - 1;
  }

  // Determine which academic year the feeMonth falls into
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

interface FeeCollectionFieldsProps {
  control: Control<CreateStudentFormInput>;
  setValue: UseFormSetValue<CreateStudentFormInput>;
  feeTypes?: FeeType[]; // kept optional for backward compat, now fetched via backend chain
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

const FeeCollectionFields = ({
  control,
  setValue,
}: FeeCollectionFieldsProps) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "studentFeeCollection.items",
  });

  const isSubmitted = useFormState({ control }).isSubmitted;

  const selectedFeeTypeId = useWatch({
    control,
    name: "studentFeeCollection.fee_type_id",
  });

  const watchedItems = useWatch({
    control,
    name: "studentFeeCollection.items",
  }) as
    | Array<{
      fee_item_id?: string;
      discount_amount?: number;
      paid_amount?: number;
      line_total_amount?: number;
    }>
    | undefined;

  // ── Backend chaining: Program → Department → Class → FeeType (like EnrollmentInfoFields + FeeItemForm) ──
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
        console.error("Failed to fetch programs", e);
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
      console.error("Failed to fetch departments", e);
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
      console.error("Failed to fetch classes", e);
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
      console.error("Failed to fetch fee types", e);
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
    // reset fee type selection
    setValue("studentFeeCollection.fee_type_id" as any, undefined);
    fields.forEach((_, idx) => {
      setValue(`studentFeeCollection.items.${idx}.fee_item_id` as any, "");
      setValue(
        `studentFeeCollection.items.${idx}.line_total_amount` as any,
        undefined,
      );
    });
    if (id) fetchDepartments(id);
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? "";
    setSelectedDepartmentId(id);
    setSelectedClassId("");
    setAcademicClasses([]);
    setFeeTypes([]);
    setValue("studentFeeCollection.fee_type_id" as any, undefined);
    fields.forEach((_, idx) => {
      setValue(`studentFeeCollection.items.${idx}.fee_item_id` as any, "");
      setValue(
        `studentFeeCollection.items.${idx}.line_total_amount` as any,
        undefined,
      );
    });
    if (id) fetchClasses(id);
  };

  const handleClassChange = (classId: string | null) => {
    const id = classId ?? "";
    setSelectedClassId(id);
    setFeeTypes([]);
    setValue("studentFeeCollection.fee_type_id" as any, undefined);
    fields.forEach((_, idx) => {
      setValue(`studentFeeCollection.items.${idx}.fee_item_id` as any, "");
      setValue(
        `studentFeeCollection.items.${idx}.line_total_amount` as any,
        undefined,
      );
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
      } catch (error) {
        console.error("Failed to fetch fee items:", error);
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

  const currentFeeItems = selectedFeeTypeId
    ? (feeItemsMap[selectedFeeTypeId] ?? [])
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Collection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Backend chaining: Program → Department → Class → FeeType */}
        <div className="grid grid-cols-2 gap-4">
          <Field>
            <FieldLabel htmlFor="fee_program">Program</FieldLabel>
            <Select
              onValueChange={handleProgramChange}
              value={selectedProgramId || null}
              disabled={loadingPrograms}
            >
              <SelectTrigger id="fee_program">
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
            <FieldLabel htmlFor="fee_department">Department</FieldLabel>
            <Select
              onValueChange={handleDepartmentChange}
              value={selectedDepartmentId || null}
              disabled={!selectedProgramId || loadingDepartments}
            >
              <SelectTrigger id="fee_department">
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
            <FieldLabel htmlFor="fee_class">Class / Year</FieldLabel>
            <Select
              onValueChange={handleClassChange}
              value={selectedClassId || null}
              disabled={!selectedDepartmentId || loadingClasses}
            >
              <SelectTrigger id="fee_class">
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
            name="studentFeeCollection.fee_type_id"
            control={control}
            render={({ field, fieldState }) => {
              const showError =
                isSubmitted || fieldState.isTouched || fieldState.isDirty;
              return (
                <Field data-invalid={showError && fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Fee Type</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      fields.forEach((_, idx) => {
                        setValue(
                          `studentFeeCollection.items.${idx}.fee_item_id` as any,
                          "",
                        );
                        setValue(
                          `studentFeeCollection.items.${idx}.line_total_amount` as any,
                          undefined,
                        );
                      });
                    }}
                    value={field.value ?? null}
                    disabled={!selectedClassId || loadingFeeTypes}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={showError && fieldState.invalid}
                      onBlur={field.onBlur}
                    >
                      <SelectValue
                        placeholder={
                          !selectedClassId
                            ? "Select a class first"
                            : loadingFeeTypes
                              ? "Loading..."
                              : feeTypes.length === 0
                                ? "No fee types for this class"
                                : "Select fee type"
                        }
                      >
                        {(value) => {
                          const feeType = feeTypes.find(
                            (ft) => ft.id === value,
                          );
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
                  {showError && fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              );
            }}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Controller
            name="studentFeeCollection.payment_method"
            control={control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Payment Method</FieldLabel>
                <Select
                  onValueChange={field.onChange}
                  value={(field.value ?? "CASH") as string}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="BANK">Bank</SelectItem>
                    <SelectItem value="BKASH">bKash</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />

          <Controller
            name="studentFeeCollection.payment_note"
            control={control}
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
                    name={`studentFeeCollection.items.${index}.fee_item_id`}
                    control={control}
                    render={({ field, fieldState }) => {
                      const showError =
                        isSubmitted ||
                        fieldState.isTouched ||
                        fieldState.isDirty;
                      return (
                        <Field data-invalid={showError && fieldState.invalid}>
                          <FieldLabel htmlFor={field.name}>Fee Item</FieldLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value);
                              const selectedItem = currentFeeItems.find(
                                (fi) => fi.id === value,
                              );
                              const amount = selectedItem?.amount ?? 0;
                              setValue(
                                `studentFeeCollection.items.${index}.line_total_amount` as any,
                                amount,
                              );
                              if (selectedItem?.FeeItemType === "OneTime") {
                                // OneTime: month/year not needed, auto-fill paid
                                setValue(
                                  `studentFeeCollection.items.${index}.fee_month` as any,
                                  null,
                                );
                                setValue(
                                  `studentFeeCollection.items.${index}.fee_year` as any,
                                  null,
                                );
                                setValue(
                                  `studentFeeCollection.items.${index}.paid_amount` as any,
                                  amount,
                                );
                                setValue(
                                  `studentFeeCollection.items.${index}.discount_amount` as any,
                                  0,
                                );
                              }
                            }}
                            value={field.value ?? null}
                            disabled={!selectedFeeTypeId || loadingFeeItems}
                          >
                            <SelectTrigger
                              id={field.name}
                              aria-invalid={showError && fieldState.invalid}
                              onBlur={field.onBlur}
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
                          {showError && fieldState.invalid && (
                            <FieldError errors={[fieldState.error]} />
                          )}
                        </Field>
                      );
                    }}
                  />

                  {!isOneTime && selectedFeeItem && (
                    <>
                      <Controller
                        name={`studentFeeCollection.items.${index}.fee_month`}
                        control={control}
                        render={({ field, fieldState }) => {
                          const allowedMonths = getMonthsInRange(
                            selectedFeeItem.feeStartMonth,
                            selectedFeeItem.feeEndMonth,
                          );
                          const showError =
                            isSubmitted ||
                            fieldState.isTouched ||
                            fieldState.isDirty;
                          return (
                            <Field
                              data-invalid={showError && fieldState.invalid}
                            >
                              <FieldLabel htmlFor={field.name}>
                                Month
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
                                    setValue(
                                      `studentFeeCollection.items.${index}.fee_year` as any,
                                      year,
                                    );
                                  } else if (value === null) {
                                    setValue(
                                      `studentFeeCollection.items.${index}.fee_year` as any,
                                      null,
                                    );
                                  }
                                }}
                                value={(field.value as string) ?? null}
                              >
                                <SelectTrigger
                                  id={field.name}
                                  aria-invalid={showError && fieldState.invalid}
                                  onBlur={field.onBlur}
                                >
                                  <SelectValue placeholder="Select month" />
                                </SelectTrigger>
                                <SelectContent>
                                  {allowedMonths.map((m) => (
                                    <SelectItem key={m} value={m}>
                                      {m.charAt(0) + m.slice(1).toLowerCase()}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {showError && fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          );
                        }}
                      />

                      <Controller
                        name={`studentFeeCollection.items.${index}.fee_year`}
                        control={control}
                        render={({ field, fieldState }) => {
                          const showError =
                            isSubmitted ||
                            fieldState.isTouched ||
                            fieldState.isDirty;
                          return (
                            <Field
                              data-invalid={showError && fieldState.invalid}
                            >
                              <FieldLabel htmlFor={field.name}>Year</FieldLabel>
                              <div
                                id={field.name}
                                aria-invalid={showError && fieldState.invalid}
                                className="flex h-9 items-center rounded-md border border-input bg-white px-3 text-sm font-medium text-foreground"
                              >
                                {field.value ? String(field.value) : "—"}
                              </div>
                              {showError && fieldState.invalid && (
                                <FieldError errors={[fieldState.error]} />
                              )}
                            </Field>
                          );
                        }}
                      />
                    </>
                  )}

                  <Controller
                    name={`studentFeeCollection.items.${index}.discount_amount`}
                    control={control}
                    render={({ field }) => (
                      <Field>
                        <FieldLabel htmlFor={field.name}>
                          Scholarship
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
                    name={`studentFeeCollection.items.${index}.paid_amount`}
                    control={control}
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

                  <Controller
                    name={`studentFeeCollection.items.${index}.line_total_amount`}
                    control={control}
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

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    aria-label="Remove item"
                  >
                    <X className="h-4 w-4" />
                  </Button>
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
      </CardContent>
    </Card>
  );
};

export default FeeCollectionFields;
