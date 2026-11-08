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
import { updateShift } from "@/services/shift";
import { TShift } from "@/types/modules/shift/shift.type";
import { createShiftValidation } from "@/validation/shift/shift.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

type EditShiftFormValues = z.infer<typeof createShiftValidation>;

interface EditShiftFormProps {
  shift: TShift;
}

/**
 * Converts a time value that may come from the backend as an ISO datetime
 * string (e.g. "2026-08-04T09:00:00.000Z") or "HH:mm:ss" into the
 * "HH:mm" format required by <input type="time">.
 */
const formatTimeForInput = (value: string): string => {
  if (!value) return "";

  // Already in "HH:mm" format
  if (/^\d{2}:\d{2}$/.test(value)) return value;

  // Extract "HH:mm" from "HH:mm:ss" or "HH:mm:ss.SSS" (naive time strings)
  const timeOnlyMatch = value.match(/^(\d{2}:\d{2})/);
  if (timeOnlyMatch) return timeOnlyMatch[1];

  // ISO datetime with a timezone (e.g. "2026-08-04T03:00:00.000Z" or
  // "2026-08-04T09:00:00+06:00"): convert to local time so the shift time
  // shows correctly in the browser's time zone.
  if (value.includes("T") && /(Z|[+-]\d{2}:\d{2})$/.test(value)) {
    const tzDate = new Date(value);
    if (!Number.isNaN(tzDate.getTime())) {
      const hours = String(tzDate.getHours()).padStart(2, "0");
      const minutes = String(tzDate.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    }
  }

  // Extract the time portion from a naive ISO datetime string (e.g. "...T09:00:00")
  const isoTimeMatch = value.match(/T(\d{2}:\d{2})/);
  if (isoTimeMatch) return isoTimeMatch[1];

  // Fallback: attempt to parse as a Date and format the local time
  const date = new Date(value);
  if (!Number.isNaN(date.getTime())) {
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return value;
};

const EditShiftForm = ({ shift }: EditShiftFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<EditShiftFormValues>({
    resolver: zodResolver(createShiftValidation),
    defaultValues: {
      name: shift.name ?? "",
      start_time: formatTimeForInput(shift.start_time),
      end_time: formatTimeForInput(shift.end_time),
    },
  });

  const onSubmit = (data: EditShiftFormValues) => {
    startTransition(async () => {
      const payload = {
        ...(data.name && { name: data.name }),
        ...(data.start_time && {
          start_time: new Date(
            `1970-01-01T${data.start_time}:00`,
          ).toISOString(),
        }),
        ...(data.end_time && {
          end_time: new Date(`1970-01-01T${data.end_time}:00`).toISOString(),
        }),
      };
      const response = await updateShift(shift.id, payload);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update shift");
        return;
      }
      toast.success(response.message ?? "Shift updated successfully");
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
            <CardTitle className="text-xl font-semibold">Edit Shift</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Update the shift name and time range.
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
            <Button type="submit" disabled={isPending} className="h-11 px-6">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Shift
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditShiftForm;
