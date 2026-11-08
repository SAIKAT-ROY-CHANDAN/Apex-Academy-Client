"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

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

import { updateFeeType } from "@/services/feeType";
import { getAcademicClassDetails } from "@/services/academicClass";
import { getDepartmentByProgramId } from "@/services/department";
import { getPrograms } from "@/services/program";
import type { AcademicClass } from "../../../settings/system/class-config/_components/types/types";
import type { Department } from "../../../settings/system/department/_components/types";
import type { Program } from "../../../settings/system/program-config/_components/types/type";
import { TFeeType } from "./types/fee-type";

const feeTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class_id: z.string().min(1, "Class is required"),
});

export type TFeeTypeFormValues = z.infer<typeof feeTypeSchema>;

interface FeeTypeEditFormProps {
  feeType: TFeeType;
  onSuccess: () => void;
  onCancel: () => void;
}

const FeeTypeEditForm = ({
  feeType,
  onSuccess,
  onCancel,
}: FeeTypeEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<TFeeTypeFormValues>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      name: feeType.name,
      class_id: feeType.academicClass?.id ?? "",
    },
  });

  // Load all programs on initial mount
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

  // Initialize cascading selects based on the feeType's current academicClass
  useEffect(() => {
    const academicClass = feeType.academicClass;
    if (!academicClass) return;

    const programId = academicClass.department?.program?.id ?? "";
    const departmentId = academicClass.department?.id ?? "";

    if (programId) {
      setSelectedProgramId(programId);
      fetchDepartments(programId);
    }
    if (departmentId) {
      setSelectedDepartmentId(departmentId);
      fetchClasses(departmentId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeType]);

  // Fetch departments when a program is selected
  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setDepartments([]);
      return;
    }

    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      setDepartments(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  // Fetch classes when a department is selected
  const fetchClasses = useCallback(async (departmentId: string) => {
    if (!departmentId) {
      setAcademicClasses([]);
      return;
    }

    setLoadingClasses(true);
    try {
      const response = await getAcademicClassDetails([
        { label: "department_id", value: departmentId },
      ]);
      setAcademicClasses(response?.data ?? []);
    } catch (error) {
      console.error("Error fetching academic classes/year:", error);
      setAcademicClasses([]);
    } finally {
      setLoadingClasses(false);
    }
  }, []);

  const handleProgramChange = (programId: string | null) => {
    const id = programId ?? "";
    setSelectedProgramId(id);
    setSelectedDepartmentId("");
    setDepartments([]);
    setAcademicClasses([]);
    setValue("class_id", "");
    if (id) {
      fetchDepartments(id);
    }
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? "";
    setSelectedDepartmentId(id);
    setAcademicClasses([]);
    setValue("class_id", "");
    if (id) {
      fetchClasses(id);
    }
  };

  const onSubmit = (values: TFeeTypeFormValues) => {
    startTransition(async () => {
      const response = await updateFeeType(feeType.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update fee type");
        return;
      }
      toast.success(response.message ?? "Fee type updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-xs text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Program */}
      <div className="space-y-1.5">
        <Label htmlFor="program_id">Program</Label>
        <Select
          onValueChange={handleProgramChange}
          value={selectedProgramId || undefined}
          disabled={loadingPrograms}
        >
          <SelectTrigger id="program_id" className="w-full">
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

      {/* Department */}
      <div className="space-y-1.5">
        <Label htmlFor="department_id">Department</Label>
        <Select
          onValueChange={handleDepartmentChange}
          value={selectedDepartmentId || undefined}
          disabled={!selectedProgramId || loadingDepartments}
        >
          <SelectTrigger id="department_id" className="w-full">
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

      {/* Class */}
      <Controller
        name="class_id"
        control={control}
        render={({ field, fieldState }) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name}>Year or Class</Label>
            <Select
              onValueChange={field.onChange}
              value={field.value || undefined}
              disabled={!selectedDepartmentId || loadingClasses}
            >
              <SelectTrigger
                id={field.name}
                className="w-full"
                aria-invalid={fieldState.invalid}
              >
                <SelectValue>
                  {academicClasses.find((c) => c.id === field.value)
                    ? `${academicClasses.find((c) => c.id === field.value)?.class_name}-${academicClasses.find((c) => c.id === field.value)?.year_level ?? academicClasses.find((c) => c.id === field.value)?.year_level}`
                    : !selectedDepartmentId
                      ? "Select a department first"
                      : loadingClasses
                        ? "Loading classes..."
                        : "Select a class"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {academicClasses.map((academicClass) => (
                  <SelectItem key={academicClass.id} value={academicClass.id}>
                    {`${academicClass.class_name}-${academicClass?.year_level ?? academicClass.year_level}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && (
              <p className="text-xs text-destructive">
                {fieldState.error?.message}
              </p>
            )}
          </div>
        )}
      />

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

export default FeeTypeEditForm;