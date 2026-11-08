"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  feeItemSchema,
  type FeeItemFormInput as FeeItemEditFormValues,
} from "../_components/schema/fee-item.schema";

import { updateFeeItem } from "@/services/feeItem";
import { getFeeTypes } from "@/services/feeType";
import { getDepartmentByProgramId } from "@/services/department";
import { getPrograms } from "@/services/program";
import { getClassesByDepartmentId } from "@/services/academicClass";
import type { TFeeItem, TFeeType } from "./types/fee-item";
import type { Program } from "../../../settings/system/program-config/_components/types/type";
import type { Department } from "../../../settings/system/department/_components/types/index";
import type { AcademicClass } from "../../../settings/system/class-config/_components/types/types";

interface FeeItemEditFormProps {
  feeItem: TFeeItem;
  onSuccess: () => void;
  onCancel: () => void;
}

const FeeItemEditForm = ({
  feeItem,
  onSuccess,
  onCancel,
}: FeeItemEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  // ── Backend-driven cascading (like EnrollmentInfoFields) ──
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);
  const [filteredFeeTypes, setFilteredFeeTypes] = useState<TFeeType[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingFeeTypes, setLoadingFeeTypes] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [initialized, setInitialized] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<FeeItemEditFormValues>({
    resolver: zodResolver(feeItemSchema),
    defaultValues: {
      name: feeItem.name,
      amount: feeItem.amount,
      fee_type_id: feeItem.fee_type_id,
      FeeItemType: feeItem.FeeItemType || undefined,
      isFine: feeItem.isFine,
      payment_start_date: feeItem.payment_start_date,
      last_payment_date: feeItem.last_payment_date,
      everydayFine_amount: feeItem.everydayFine_amount,
      feeStartMonth: feeItem.feeStartMonth as any,
      feeEndMonth: feeItem.feeEndMonth as any,
    },
  });

  const isFine = watch("isFine");
  const feeItemTypeWatch = watch("FeeItemType");

  // Load programs backend
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
      return [] as Department[];
    }
    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      const data = response?.data ?? [];
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setDepartments(list);
      return list;
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
      return [] as Department[];
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const fetchClasses = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setAcademicClasses([]);
      return [] as AcademicClass[];
    }
    setLoadingClasses(true);
    try {
      const response = await getClassesByDepartmentId(departmentId);
      setAcademicClasses(response?.data ?? []);
      return response?.data ?? [];
    } catch (error) {
      console.error("Error fetching academic classes:", error);
      setAcademicClasses([]);
      return [] as AcademicClass[];
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const fetchFeeTypesByClass = useCallback(async (classId: string) => {
    if (!classId) {
      setFilteredFeeTypes([]);
      return [] as TFeeType[];
    }
    setLoadingFeeTypes(true);
    try {
      const response = await getFeeTypes([{ label: "classId", value: classId }]);
      setFilteredFeeTypes(response?.data ?? []);
      return response?.data ?? [];
    } catch (error) {
      console.error("Error fetching fee types by class:", error);
      setFilteredFeeTypes([]);
      return [] as TFeeType[];
    } finally {
      setLoadingFeeTypes(false);
    }
  }, []);

  // Initialize cascading from existing feeItem - backend driven
  useEffect(() => {
    if (initialized || loadingPrograms) return;
    const init = async () => {
      const feeTypeNested: any = (feeItem as any).feeType ?? (feeItem as any).fee_type ?? null;
      const academicClass: any = feeTypeNested?.academicClass ?? null;
      let progId: string | undefined = academicClass?.department?.program?.id ?? academicClass?.department?.program_id ?? undefined;
      let deptId: string | undefined = academicClass?.department?.id ?? academicClass?.department_id ?? undefined;
      let clsId: string | undefined = academicClass?.id ?? feeTypeNested?.class_id ?? undefined;

      if (!clsId || !deptId || !progId) {
        try {
          const res = await getFeeTypes([]);
          const all: TFeeType[] = res?.data ?? [];
          const matched: any = all.find((ft) => ft.id === feeItem.fee_type_id);
          if (matched?.academicClass) {
            clsId = matched.academicClass.id ?? clsId;
            deptId = matched.academicClass.department?.id ?? matched.academicClass.department_id ?? deptId;
            progId = matched.academicClass.department?.program?.id ?? matched.academicClass.department?.program_id ?? progId;
          }
        } catch (e) {
          console.error("Failed to deduce chain for fee item:", e);
        }
      }

      if (progId) {
        setSelectedProgramId(progId);
        await fetchDepartments(progId);
      }
      if (deptId) {
        setSelectedDepartmentId(deptId);
        await fetchClasses(deptId);
      }
      if (clsId) {
        setSelectedClassId(clsId);
        await fetchFeeTypesByClass(clsId);
      }
      setInitialized(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingPrograms, feeItem.id, initialized]);

  const handleProgramChange = async (programId: string | null) => {
    const id = programId ?? "";
    setSelectedProgramId(id);
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setDepartments([]);
    setAcademicClasses([]);
    setFilteredFeeTypes([]);
    setValue("fee_type_id", "" as any);
    if (id) {
      await fetchDepartments(id);
    }
  };

  const handleDepartmentChange = async (departmentId: string | null) => {
    const id = departmentId ?? "";
    setSelectedDepartmentId(id);
    setSelectedClassId("");
    setAcademicClasses([]);
    setFilteredFeeTypes([]);
    setValue("fee_type_id", "" as any);
    if (id) {
      await fetchClasses(id);
    }
  };

  const handleClassChange = async (classId: string | null) => {
    const id = classId ?? "";
    setSelectedClassId(id);
    setFilteredFeeTypes([]);
    setValue("fee_type_id", "" as any);
    if (id) {
      await fetchFeeTypesByClass(id);
    }
  };

  const onSubmit = (values: FeeItemEditFormValues) => {
    startTransition(async () => {
      const isOneTime = values.FeeItemType === "OneTime";
      const payload = {
        ...values,
        feeStartMonth: isOneTime ? null : values.feeStartMonth ?? null,
        feeEndMonth: isOneTime ? null : values.feeEndMonth ?? null,
        payment_start_date: values.payment_start_date ?? null,
        ...(values.isFine
          ? {
            last_payment_date: values.last_payment_date ?? null,
            everydayFine_amount: values.everydayFine_amount ?? null,
          }
          : {}),
      };
      const response = await updateFeeItem(feeItem.id, payload);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update fee item");
        return;
      }
      toast.success(response.message ?? "Fee item updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5">
        {/* Program - backend */}
        <div className="space-y-1.5 w-full">
          <Label htmlFor="edit_program_id">Program</Label>
          <Select
            value={selectedProgramId || undefined}
            onValueChange={handleProgramChange}
            disabled={loadingPrograms}
          >
            <SelectTrigger id="edit_program_id" className="w-full">
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
        </div>

        {/* Department - backend via programId */}
        <div className="space-y-1.5 w-full">
          <Label htmlFor="edit_department_id">Department</Label>
          <Select
            value={selectedDepartmentId || undefined}
            onValueChange={handleDepartmentChange}
            disabled={!selectedProgramId || loadingDepartments}
          >
            <SelectTrigger id="edit_department_id" className="w-full">
              <SelectValue>
                {departments.find((d) => d.id === selectedDepartmentId)?.department_name ??
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
        </div>

        {/* Academic Class - backend via departmentId */}
        <div className="space-y-1.5 w-full">
          <Label htmlFor="edit_class_id">Class / Year</Label>
          <Select
            value={selectedClassId || undefined}
            onValueChange={handleClassChange}
            disabled={!selectedDepartmentId || loadingClasses}
          >
            <SelectTrigger id="edit_class_id" className="w-full">
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
                  {`${cls.class_name}${(cls as any).year_level ? ` - Year ${(cls as any).year_level}` : ""}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Fee Type - backend via classId */}
        <div className="space-y-1.5 w-full">
          <Label htmlFor="fee_type_id">Fee Type</Label>
          <Select
            value={watch("fee_type_id") || undefined}
            onValueChange={(value) => setValue("fee_type_id", value as string)}
            disabled={!selectedClassId || loadingFeeTypes}
          >
            <SelectTrigger id="fee_type_id" className="w-full">
              <SelectValue>
                {filteredFeeTypes?.find((ft) => ft.id === watch("fee_type_id"))?.name ??
                  (!selectedClassId
                    ? "Select a class first"
                    : loadingFeeTypes
                      ? "Loading fee types..."
                      : filteredFeeTypes.length === 0
                        ? "No fee types for this class"
                        : "Select fee type")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {filteredFeeTypes.map((feeType: any) => (
                <SelectItem key={feeType.id} value={feeType.id} className="w-full">
                  {feeType.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.fee_type_id && (
            <p className="text-xs text-destructive">
              {errors.fee_type_id.message}
            </p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min={0}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-xs text-destructive">
                {errors.amount.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="FeeItemType">Fee Item Type</Label>
          <Controller
            name="FeeItemType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value === "OneTime") {
                    setValue("isFine", false);
                    setValue("last_payment_date", null);
                    setValue("everydayFine_amount", null);
                    setValue("feeStartMonth", null as any);
                    setValue("feeEndMonth", null as any);
                  }
                }}
              >
                <SelectTrigger id="FeeItemType" className="w-full">
                  <SelectValue placeholder="Select type" className="w-full" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="Monthly" className="w-full">
                    Monthly
                  </SelectItem>
                  <SelectItem value="OneTime" className="w-full">
                    One Time
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.FeeItemType && (
            <p className="text-xs text-destructive">
              {errors.FeeItemType.message}
            </p>
          )}
        </div>
        {feeItemTypeWatch === "Monthly" && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="feeStartMonth">Fee Start Month</Label>
              <Controller
                name="feeStartMonth"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="feeStartMonth" className="w-full">
                        <SelectValue placeholder="Select start month" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"] as const).map((m) => (
                          <SelectItem key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                  </div>
                )}
              />
              {errors.feeStartMonth && <p className="text-xs text-destructive">{errors.feeStartMonth.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="feeEndMonth">Fee End Month</Label>
              <Controller
                name="feeEndMonth"
                control={control}
                render={({ field, fieldState }) => (
                  <div className="space-y-1.5">
                    <Select
                      value={field.value ?? undefined}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger id="feeEndMonth" className="w-full">
                        <SelectValue placeholder="Select end month" />
                      </SelectTrigger>
                      <SelectContent>
                        {(["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"] as const).map((m) => (
                          <SelectItem key={m} value={m}>{m.charAt(0) + m.slice(1).toLowerCase()}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldState.error && <p className="text-xs text-destructive">{fieldState.error.message}</p>}
                  </div>
                )}
              />
              {errors.feeEndMonth && <p className="text-xs text-destructive">{errors.feeEndMonth.message}</p>}
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Label htmlFor="isFine">Is Late Fee</Label>
          <Controller
            name="isFine"
            control={control}
            render={({ field }) => (
              <Switch
                id="isFine"
                checked={field.value}
                onCheckedChange={(checked) => {
                  field.onChange(checked);
                  if (!checked) {
                    setValue("last_payment_date", null);
                    setValue("everydayFine_amount", null);
                  }
                }}
              />
            )}
          />
        </div>

        {isFine && (
          <div className="grid gap-4 rounded-lg border border-border/50 bg-muted/20 p-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="payment_start_date">
                Payment Start Date (Day of Month)
              </Label>
              <Input
                id="payment_start_date"
                type="number"
                min={1}
                max={31}
                placeholder="e.g. 1"
                {...register("payment_start_date")}
              />
              {errors.payment_start_date && (
                <p className="text-xs text-destructive">
                  {errors.payment_start_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="last_payment_date">
                Last Payment Date (Day of Month)
              </Label>
              <Input
                id="last_payment_date"
                type="number"
                min={1}
                max={31}
                placeholder="e.g. 15"
                {...register("last_payment_date")}
              />
              {errors.last_payment_date && (
                <p className="text-xs text-destructive">
                  {errors.last_payment_date.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="everydayFine_amount">
                Everyday Late Fee
              </Label>
              <Input
                id="everydayFine_amount"
                type="number"
                step="0.01"
                placeholder="e.g. 10"
                {...register("everydayFine_amount")}
              />
              {errors.everydayFine_amount && (
                <p className="text-xs text-destructive">
                  {errors.everydayFine_amount.message}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default FeeItemEditForm;
