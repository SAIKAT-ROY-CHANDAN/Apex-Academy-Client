"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateProgram } from "@/services/program";
import { TProgram } from "./types/type";

const programSchema = z.object({
  program_name: z.string().min(1, "Program name is required"),
  duration_years: z.coerce
    .number()
    .int()
    .min(1, "Duration must be at least 1 year"),
});

export type TProgramFormValues = z.infer<typeof programSchema>;

interface ProgramEditFormProps {
  program: TProgram;
  onSuccess: () => void;
  onCancel: () => void;
}

const ProgramEditForm = ({
  program,
  onSuccess,
  onCancel,
}: ProgramEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TProgramFormValues>({
    // resolver: zodResolver(programSchema),
    defaultValues: {
      program_name: program.program_name,
      duration_years: program.duration_years,
    },
  });

  const onSubmit = (values: TProgramFormValues) => {
    startTransition(async () => {
      const response = await updateProgram(program.id, values);;

      if (!response.success) {
        toast.error(response.message ?? "Failed to update program");
        return;
      }
      toast.success(response.message ?? "Program updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="program_name">Program Name</Label>
          <Input id="program_name" {...register("program_name")} />
          {errors.program_name && (
            <p className="text-xs text-destructive">
              {errors.program_name.message}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="duration_years">Duration (years)</Label>
          <Input
            id="duration_years"
            type="number"
            min={1}
            {...register("duration_years")}
          />
          {errors.duration_years && (
            <p className="text-xs text-destructive">
              {errors.duration_years.message}
            </p>
          )}
        </div>

        {/* Institution is fixed per program and shown read-only */}
        {program.institution && (
          <div className="space-y-1.5">
            <Label>Institution</Label>
            <Input
              value={program.institution.name}
              disabled
              className="text-muted-foreground"
            />
          </div>
        )}

        {program.departments?.length > 0 && (
          <p className="text-xs text-muted-foreground">
            Linked to {program.departments.length} department(s):{" "}
            {program.departments.map((d) => d.department_name).join(", ")}
          </p>
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

export default ProgramEditForm;