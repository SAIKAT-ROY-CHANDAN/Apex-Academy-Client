"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
import { getAcademicClassDetails, getClassesByDepartmentId } from "@/services/academicClass";
import { getDepartmentByProgramId } from "@/services/department";
import { getPrograms } from "@/services/program";
import type { AcademicClass } from "../../../settings/system/class-config/_components/types/types";
import type { Department } from "../../../settings/system/department/_components/types";
import type { Program } from "../../../settings/system/program-config/_components/types/type";
import {
  type FeeTypeFormInput,
  type FeeTypeFormValues,
  feeTypeSchema,
} from "./schema/fee-type.schema";

interface FeeTypeFormProps {
  onSubmit: (values: FeeTypeFormValues) => Promise<void>;
  isSubmitting?: boolean;
}

const FeeTypeForm = ({ onSubmit, isSubmitting }: FeeTypeFormProps) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [academicClasses, setAcademicClasses] = useState<AcademicClass[]>([]);

  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);

  const [selectedProgramId, setSelectedProgramId] = useState<string>("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");

  const form = useForm<FeeTypeFormInput, any, FeeTypeFormValues>({
    resolver: zodResolver(feeTypeSchema),
    defaultValues: {
      name: "",
      class_id: "",
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
      const response = await getClassesByDepartmentId(departmentId);
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
    form.setValue("class_id", "");
    if (id) {
      fetchDepartments(id);
    }
  };

  const handleDepartmentChange = (departmentId: string | null) => {
    const id = departmentId ?? "";
    setSelectedDepartmentId(id);
    setAcademicClasses([]);
    form.setValue("class_id", "");
    if (id) {
      fetchClasses(id);
    }
  };

  return (
    <form id="fee-type-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup className="gap-5">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Fee Type Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder="e.g. Tuition Fee"
                aria-invalid={fieldState.invalid}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        {/* Program */}
        <Field>
          <FieldLabel htmlFor="program_id">Program</FieldLabel>
          <Select
            onValueChange={handleProgramChange}
            value={selectedProgramId || undefined}
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

        {/* Department */}
        <Field>
          <FieldLabel htmlFor="department_id">Department</FieldLabel>
          <Select
            onValueChange={handleDepartmentChange}
            value={selectedDepartmentId || undefined}
            disabled={!selectedProgramId || loadingDepartments}
          >
            <SelectTrigger id="department_id">
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
        </Field>

        {/* Class */}
        <Controller
          name="class_id"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Year / Class</FieldLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
                disabled={!selectedDepartmentId || loadingClasses}
              >
                <SelectTrigger
                  id={field.name}
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
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Fee Type"
          )}
        </Button>
      </FieldGroup>
    </form>
  );
};

export default FeeTypeForm;
