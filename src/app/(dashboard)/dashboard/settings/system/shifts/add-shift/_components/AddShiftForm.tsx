"use client";

import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createShift } from "@/services/shift";
import { createShiftValidation } from "@/validation/shift/shift.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

type CreateShiftFormValues = z.infer<typeof createShiftValidation>;

const AddShiftForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<CreateShiftFormValues>({
    resolver: zodResolver(createShiftValidation),
    defaultValues: {
      name: "",
      start_time: "",
      end_time: "",
    },
  });

  const onSubmit = (data: CreateShiftFormValues) => {
    startTransition(async () => {
      const payload = {
        name: data.name,
        start_time: new Date(`1970-01-01T${data.start_time}:00`).toISOString(),
        end_time: new Date(`1970-01-01T${data.end_time}:00`).toISOString(),
      };
      
      const response = await createShift(payload);

      if (!response.success) {
        toast.error(response.message ?? "Failed to create shift");
        return;
      }
      toast.success(response.message ?? "Shift created successfully");
      router.refresh();
      router.push("/dashboard/settings/system/shifts");
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">
              Shift Details
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Configure a new work shift with a name and time range.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {/* Shift Name */}
          <FormInput
            label="Shift Name"
            placeholder="e.g. Morning Shift, Day Shift, Night Shift"
            required
            error={form.formState.errors.name?.message}
            {...form.register("name")}
            inputClassName="h-11"
          />

          {/* Time Range */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="start_time" className="text-sm font-medium">
                Start Time <span className="text-destructive"> *</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="start_time"
                  type="time"
                  required
                  aria-invalid={!!form.formState.errors.start_time?.message}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:ml-0"
                  {...form.register("start_time")}
                />
              </div>
              {form.formState.errors.start_time?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.start_time.message}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end_time" className="text-sm font-medium">
                End Time <span className="text-destructive"> *</span>
              </Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="end_time"
                  type="time"
                  required
                  aria-invalid={!!form.formState.errors.end_time?.message}
                  className="flex h-11 w-full rounded-lg border border-input bg-background px-3 pl-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&::-webkit-calendar-picker-indicator]:ml-0"
                  {...form.register("end_time")}
                />
              </div>
              {form.formState.errors.end_time?.message ? (
                <p className="text-xs text-destructive">
                  {form.formState.errors.end_time.message}
                </p>
              ) : null}
            </div>
          </div>

          {/* Time Range Preview */}
          {form.watch("start_time") && form.watch("end_time") ? (
            <div className="rounded-lg bg-muted/40 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Shift Duration:</span>
                <span>
                  {form.watch("start_time")} — {form.watch("end_time")}
                </span>
              </div>
            </div>
          ) : null}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="h-11 px-6"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Create Shift
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default AddShiftForm;