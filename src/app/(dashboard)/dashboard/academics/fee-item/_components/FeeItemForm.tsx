"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpenCheck, Loader2, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDepartmentByProgramId } from "@/services/department";
import { getFeeTypes } from "@/services/feeType";
import { getPrograms } from "@/services/program";
import { getClassesByDepartmentId } from "@/services/academicClass";
import type { FeeType } from "../../manage-fee/_components/types/fee-type";
import { MONTHS } from "./types/fee-item";
import { FeeAssignFor } from "./types/fee-item";
import {
  type FeeItemFormInput,
  type FeeItemFormValues,
  feeItemSchema,
} from "./schema/fee-item.schema";
import type { Program } from "../../../settings/system/program-config/_components/types/type";
import type { Department } from "../../../settings/system/department/_components/types/index";
import type { AcademicClass } from "../../../settings/system/class-config/_components/types/types";

interface FeeItemFormProps {
  feeTypes?: FeeType[];
  onSubmit: (values: FeeItemFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const FeeItemForm = ({
  feeTypes: _initialFeeTypes,
  onSubmit,
  isSubmitting,
}: FeeItemFormProps) => {
  const form = useForm<FeeItemFormInput, any, FeeItemFormValues>({
    resolver: zodResolver(feeItemSchema),
    defaultValues: {
      fee_type_id: undefined,
      name: "",
      amount: undefined,
      FeeItemType: undefined,
      fee_assign_for: "REGULAR",
      isFine: false,
      payment_start_date: null,
      last_payment_date: null,
      everydayFine_amount: null,
      feeStartMonth: undefined,
      feeEndMonth: undefined,
      amount_every_subject: undefined,
    },
  });

  const isFine = form.watch("isFine");
  const feeItemType = form.watch("FeeItemType");
  const feeAssignFor = form.watch("fee_assign_for");

  const handleFeeAssignForChange = (value: "REGULAR" | "SUPPLEMENTARY") => {
    form.setValue("fee_assign_for", value, { shouldValidate: true });

    if (value === "SUPPLEMENTARY") {
      form.setValue("FeeItemType", "OneTime");
      form.setValue("amount", 0);
      return;
    }

    form.setValue("FeeItemType", undefined as any);
    form.setValue("amount", undefined as any);
  };

  // ── Backend-driven cascading state (like EnrollmentInfoFields) ──
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [filteredFeeTypes, setFilteredFeeTypes] = useState<FeeType[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingFeeTypes, setLoadingFeeTypes] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");

  // Load programs on mount - backend
  useEffect(() => {
    const fetchPrograms = async () => {
      setLoadingPrograms(true);
      try {
        const response = await getPrograms([]);
        setPrograms(response?.data ?? []);
      } catch (error) {
        console.error("Error fetching programs:", error);
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
      const response = await getDepartmentByProgramId(programId);
      const data = response?.data ?? [];
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setDepartments(list);
    } catch (error) {
      console.error("Error fetching departments:", error);
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
      const response = await getClassesByDepartmentId(departmentId);
      setAcademicClasses(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching academic classes:", error);
      setAcademicClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchFeeTypesByClass = useCallback(async (classId: string) => {
    if (!classId) {
      setFilteredFeeTypes([]);
      return;
    }
    setLoadingFeeTypes(true);
    try {
      const response = await getFeeTypes([{ label: "classId", value: classId }]);
      setFilteredFeeTypes(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching fee types by class:", error);
      setFilteredFeeTypes([]);
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
    setFilteredFeeTypes([]);
    form.setValue("fee_type_id", "" as any);
    if (id) {
      fetchDepartments(id);
    }
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? "";
    setSelectedDepartmentId(id);
    setSelectedClassId("");
    setAcademicClasses([]);
    setFilteredFeeTypes([]);
    form.setValue("fee_type_id", "" as any);
    if (id) {
      fetchClasses(id);
    }
  };

  const handleClassChange = (classId: string | null) => {
    const id = classId ?? "";
    setSelectedClassId(id);
    setFilteredFeeTypes([]);
    form.setValue("fee_type_id", "" as any);
    if (id) {
      fetchFeeTypesByClass(id);
    }
  };

  return (
    <form id="fee-item-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5 ">

        <div className="space-y-3">
          <div>
            <FieldLabel>Fee category</FieldLabel>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose how this fee will be applied to students.
            </p>
          </div>
          <Tabs
            value={feeAssignFor}
            onValueChange={(value) => {
              if (value === "REGULAR" || value === "SUPPLEMENTARY") {
                handleFeeAssignForChange(value);
              }
            }}
          >
            <TabsList className="grid h-auto w-full grid-cols-1 rounded-xl border border-border/70 bg-muted/35 p-1.5 sm:grid-cols-2">
              <TabsTrigger
                className="h-auto min-h-16 justify-start gap-3 rounded-lg px-4 py-3 text-left data-active:ring-1 data-active:ring-border"
                value="REGULAR"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ReceiptText className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">Regular</span>
                  {/* <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    Monthly or one-time billing
                  </span> */}
                </span>
              </TabsTrigger>
              <TabsTrigger
                className="h-auto min-h-16 justify-start gap-3 rounded-lg px-4 py-3 text-left data-active:ring-1 data-active:ring-border"
                value="SUPPLEMENTARY"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <BookOpenCheck className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">Supplementary</span>
                  {/* <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                    Charged per supplementary subject
                  </span> */}
                </span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Common fields: Program, Department, Class, Fee Type, Name */}
        {/* Program - backend */}
        <Field>
          <FieldLabel htmlFor="program_id">Program</FieldLabel>
          <Select
            onValueChange={handleProgramChange}
            value={selectedProgramId}
            disabled={loadingPrograms}
          >
            <SelectTrigger id="program_id">
              <SelectValue>
                {programs.find((p) => p.id === selectedProgramId)?.program_name ??
                  (loadingPrograms ? "Loading programs..." : "Select a program")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {programs.map((program) => (
                <SelectItem key={program.id} value={program.id}>
                  {program.program_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Department - backend via programId */}
        <Field>
          <FieldLabel htmlFor="department_id">Department</FieldLabel>
          <Select
            onValueChange={handleDepartmentChange}
            value={selectedDepartmentId}
            disabled={!selectedProgramId || loadingDepartments}
          >
            <SelectTrigger id="department_id">
              <SelectValue>
                {departments.find((d) => d.id === selectedDepartmentId)
                  ?.department_name ??
                  (!selectedProgramId
                    ? "Select a program first"
                    : loadingDepartments
                      ? "Loading departments..."
                      : "Select a department")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.department_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Academic Class - backend via departmentId */}
        <Field>
          <FieldLabel htmlFor="class_id">Class / Year</FieldLabel>
          <Select
            onValueChange={handleClassChange}
            value={selectedClassId}
            disabled={!selectedDepartmentId || loadingClasses}
          >
            <SelectTrigger id="class_id">
              <SelectValue>
                {academicClasses.find((c) => c.id === selectedClassId)?.class_name ??
                  (!selectedDepartmentId
                    ? "Select a department first"
                    : loadingClasses
                      ? "Loading classes..."
                      : "Select a class")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {academicClasses.map((cls) => (
                <SelectItem key={cls.id} value={cls.id}>
                  {`${cls.class_name}${cls.year_level ? ` - Year ${cls.year_level}` : ""}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        {/* Fee Type - backend via classId */}
        <Controller
          name="fee_type_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Fee Type</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
                disabled={!selectedClassId || loadingFeeTypes}
              >
                <SelectTrigger
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue>
                    {filteredFeeTypes?.find((ft) => ft.id === field.value)
                      ?.name ??
                      (!selectedClassId
                        ? "Select a class first"
                        : loadingFeeTypes
                          ? "Loading fee types..."
                          : filteredFeeTypes.length === 0
                            ? "No fee types for this class"
                            : "Select a fee type")}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {filteredFeeTypes.map((feeType) => (
                    <SelectItem key={feeType.id} value={feeType.id}>
                      {feeType.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <div className="w-full">
          <Controller
            name="name"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="w-full">
                <FieldLabel htmlFor={field.name} className="">Fee Item Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. Admission Fee"
                  aria-invalid={fieldState.invalid}
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </div>

        {/* Fee Assign For specific fields */}
        {feeAssignFor === "REGULAR" && (
          <>
            <div className="w-full">
              <Controller
                name="amount"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Amount</FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      step="0.01"
                      placeholder="e.g. 5000"
                      value={(field.value ?? "") as string | number}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="FeeItemType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Fee Item Type</FieldLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      if (value === "OneTime") {
                        form.setValue("isFine", false);
                        form.setValue("last_payment_date", null);
                        form.setValue("everydayFine_amount", null);
                        form.setValue("feeStartMonth", null as any);
                        form.setValue("feeEndMonth", null as any);
                      }
                    }}
                    value={field.value ?? undefined}
                  >
                    <SelectTrigger
                      id={field.name}
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="OneTime">One Time</SelectItem>
                    </SelectContent>
                  </Select>
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="isFine"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="items-center gap-3">
                  <FieldLabel htmlFor={field.name}>Is Late Fee</FieldLabel>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        form.setValue("last_payment_date", null);
                        form.setValue("everydayFine_amount", null);
                      }
                    }}
                  />
                </Field>
              )}
            />

            {isFine && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
                <Controller
                  name="payment_start_date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Payment Start Date (Day of Month)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        placeholder="e.g. 1"
                        value={(field.value ?? "") as number}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="last_payment_date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Last Payment Date (Day of Month)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        min={1}
                        max={31}
                        placeholder="e.g. 15"
                        value={(field.value ?? "") as number}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="everydayFine_amount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Everyday Late Fee
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 10"
                        value={(field.value ?? "") as number}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

            {feeItemType === "Monthly" && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Controller
                  name="feeStartMonth"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Fee Start Month</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select start month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month.charAt(0) + month.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="feeEndMonth"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>Fee End Month</FieldLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? undefined}
                      >
                        <SelectTrigger
                          id={field.name}
                          aria-invalid={fieldState.invalid}
                        >
                          <SelectValue placeholder="Select end month" />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS.map((month) => (
                            <SelectItem key={month} value={month}>
                              {month.charAt(0) + month.slice(1).toLowerCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
              </div>
            )}
          </>
        )}

        {feeAssignFor === "SUPPLEMENTARY" && (
          <>
            <Controller
              name="amount_every_subject"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Amount Per Subject</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500"
                    value={(field.value ?? "") as string | number}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="isFine"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal" className="items-center gap-3">
                  <FieldLabel htmlFor={field.name}>Is Late Fee</FieldLabel>
                  <Switch
                    id={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => {
                      field.onChange(checked);
                      if (!checked) {
                        form.setValue("last_payment_date", null);
                        form.setValue("everydayFine_amount", null);
                      }
                    }}
                  />
                </Field>
              )}
            />

            {isFine && (
              <div className="grid grid-cols-1 gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
                <Controller
                  name="payment_start_date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Payment Start Date (Day of Month)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        placeholder="e.g. 1"
                        value={(field.value ?? "") as number}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                    </Field>
                  )}
                />
                <Controller
                  name="last_payment_date"
                  control={form.control}
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Last Payment Date (Day of Month)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        min={1}
                        max={31}
                        placeholder="e.g. 15"
                        value={(field.value ?? "") as number}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />

                <Controller
                  control={form.control}
                  name="everydayFine_amount"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.name}>
                        Everyday Late Fee
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        step="0.01"
                        placeholder="e.g. 10"
                        value={(field.value ?? "") as number}
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )}
                />
              </div>
            )}

          </>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Fee Item"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default FeeItemForm;