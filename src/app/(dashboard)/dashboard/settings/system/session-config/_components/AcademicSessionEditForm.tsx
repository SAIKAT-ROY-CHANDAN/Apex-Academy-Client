"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateAcademicSession } from "@/services/academicSession";
import { TAcademicSession } from "./types/academic-session";

const academicSessionSchema = z.object({
  session_name: z.string().min(1, "Session name is required"),
});

export type TAcademicSessionFormValues = z.infer<
  typeof academicSessionSchema
>;

interface AcademicSessionEditFormProps {
  session: TAcademicSession;
  onSuccess: () => void;
  onCancel: () => void;
}

const AcademicSessionEditForm = ({
  session,
  onSuccess,
  onCancel,
}: AcademicSessionEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TAcademicSessionFormValues>({
    resolver: zodResolver(academicSessionSchema),
    defaultValues: {
      session_name: session.session_name,
    },
  });

  const onSubmit = (values: TAcademicSessionFormValues) => {
    startTransition(async () => {
      const response = await updateAcademicSession(session.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update session");
        return;
      }
      toast.success(response.message ?? "Session updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5">
        <div className="space-y-1.5">
          <Label htmlFor="session_name">Session Name</Label>
          <Input id="session_name" {...register("session_name")} />
          {errors.session_name && (
            <p className="text-xs text-destructive">
              {errors.session_name.message}
            </p>
          )}
        </div>

        {/* Institution is fixed per session and shown read-only */}
        {session.institution && (
          <div className="space-y-1.5">
            <Label>Institution</Label>
            <Input
              value={session.institution.name}
              disabled
              className="text-muted-foreground"
            />
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

export default AcademicSessionEditForm;