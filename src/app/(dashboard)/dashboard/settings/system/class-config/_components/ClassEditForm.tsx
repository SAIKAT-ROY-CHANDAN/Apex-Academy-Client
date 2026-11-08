"use client";

import { z } from "zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
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
import { TClass } from "./types/types";
import { updateClass } from "@/services/academicClass";
import { getDepartmentByProgramId } from "@/services/department";
import type { Department, Program } from "./types/types";


const classSchema = z.object({
  class_name: z.string().min(1, "Class name is required"),
  class_level: z.coerce.number().int().min(0, "Class level must be 0 or greater"),
  year_level: z.coerce.number().int().nullable().optional(),
  group: z.enum(["SCIENCE", "COMMERCE", "HUMANITIES"]).nullable().optional(),
  program_id: z.string().nullable().optional(),
  department_id: z.string().nullable().optional(),
});

export type TClassFormInput = z.input<typeof classSchema>;
export type TClassFormValues = z.output<typeof classSchema>;

interface ClassEditFormProps {
  classData: TClass;
  institution: string;
  programs: Program[];
  departments: Department[];
  onSuccess: (updatedClass: TClass) => void;
  onCancel: () => void;
}

// Adjust to match the actual group values used in your system
const GROUP_OPTIONS = ["SCIENCE", "COMMERCE", "HUMANITIES"];

const ClassEditForm = ({
  classData,
  institution,
  programs,
  departments,
  onSuccess,
  onCancel,
}: ClassEditFormProps) => {
  const isSchool = institution === "SCHOOL";
  const [isPending, startTransition] = useTransition();

  const [programDepartments, setProgramDepartments] = useState<Department[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState<string | undefined>(undefined);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | undefined>(undefined);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TClassFormInput, any, TClassFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      class_name: classData.class_name,
      class_level: classData.class_level ?? 0,
      year_level: classData.year_level ?? undefined,
      group: (classData.group as "SCIENCE" | "COMMERCE" | "HUMANITIES" | null) ?? undefined,
      program_id: classData.program_id,
      department_id: classData.department_id,
    },
  });

  const fetchDepartments = useCallback(async (programId: string) => {
    if (!programId) {
      setProgramDepartments([]);
      return;
    }
    setLoadingDepartments(true);
    try {
      const response = await getDepartmentByProgramId(programId);
      const data = response?.data ?? [];
      const list = Array.isArray(data) ? data : data ? [data] : [];
      setProgramDepartments(list);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setProgramDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  }, []);

  const handleProgramChange = (programId: string | null) => {
    const id = programId ?? undefined;
    setSelectedProgramId(id);
    setSelectedDepartmentId(undefined);
    setProgramDepartments([]);
    setValue("program_id", id);
    setValue("department_id", undefined);
    if (id) {
      fetchDepartments(id);
    }
  };

  // Initialize selectedProgramId and fetch departments when classData.program_id changes
  useEffect(() => {
    if (classData.program_id) {
      setSelectedProgramId(classData.program_id);
      fetchDepartments(classData.program_id);
    }
  }, [classData.program_id, fetchDepartments]);

  // Update selectedDepartmentId when programDepartments loads
  useEffect(() => {
    if (classData.department_id && programDepartments.length > 0) {
      setSelectedDepartmentId(classData.department_id);
    }
  }, [classData.department_id, programDepartments]);

  const onSubmit = (values: TClassFormValues) => {
    startTransition(async () => {
      const payload: TClassFormValues = {
        class_name: values.class_name,
        class_level: values.class_level ?? 0,
        year_level: values.year_level ?? null,
        group: values.group ?? null,
        program_id: values.program_id ?? null,
        department_id: values.department_id ?? null,
      };
      const response = await updateClass(classData.id, payload);
      console.log(response);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update class");
        return;
      }
      toast.success(response.message ?? "Class updated successfully");
      onSuccess(response.data);
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="class_name">Class Name</Label>
          <Input id="class_name" {...register("class_name")} />
          {errors.class_name && (
            <p className="text-xs text-destructive">
              {errors.class_name.message}
            </p>
          )}
        </div>

        {isSchool ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="class_level">Class Level</Label>
              <Input
                id="class_level"
                type="number"
                {...register("class_level")}
              />
              {errors.class_level && (
                <p className="text-xs text-destructive">
                  {errors.class_level.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="group">Group</Label>
              <Select
                value={watch("group") ?? undefined}
                onValueChange={(value) => setValue("group", value)}
              >
                <SelectTrigger id="group">
                  <SelectValue placeholder="Select group" />
                </SelectTrigger>
                <SelectContent>
                  {GROUP_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent              >
              </Select>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="year_level">Year Level</Label>
              <Input
                id="year_level"
                type="number"
                {...register("year_level")}
              />
              {errors.year_level && (
                <p className="text-xs text-destructive">
                  {errors.year_level.message}
                </p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="program_id">Program</Label>
                <Select
                  onValueChange={handleProgramChange}
                  value={selectedProgramId}
                  disabled={loadingDepartments}
                >
                  <SelectTrigger id="program_id">
                    <SelectValue>
                      {programs.find((p) => p.id === selectedProgramId)?.program_name ??
                        (!selectedProgramId && classData.program_id && !programs.find((p) => p.id === classData.program_id)
                          ? "Loading..."
                          : "Select a program")}
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
              <div className="space-y-1.5">
                <Label htmlFor="department_id">Department</Label>
                <Select
                  onValueChange={(value) => {
                    setSelectedDepartmentId(value ?? undefined);
                    setValue("department_id", value);
                  }}
                  value={selectedDepartmentId}
                  disabled={!selectedProgramId || loadingDepartments}
                >
                  <SelectTrigger id="department_id">
                    <SelectValue>
                      {programDepartments.find((d) => d.id === selectedDepartmentId)?.department_name ??
                        (!selectedProgramId
                          ? "Select a program first"
                          : loadingDepartments
                          ? "Loading departments..."
                          : "Select a department")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {programDepartments.map((department) => (
                      <SelectItem key={department.id} value={department.id}>
                        {department.department_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </>
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

export default ClassEditForm;