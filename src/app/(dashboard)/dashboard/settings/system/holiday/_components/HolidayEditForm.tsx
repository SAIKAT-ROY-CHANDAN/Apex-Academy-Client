"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { updateHoliday } from "@/services/holiday";
import { THoliday } from "./types";

// Adjust to match the actual holiday_type values used in your system
const HOLIDAY_TYPE_OPTIONS = ["PUBLIC", "NATIONAL", "RELIGIOUS", "OPTIONAL"];

// Input[type=date] needs "yyyy-MM-dd"; the API gives back full ISO strings
const toDateInputValue = (isoDate: string | null | undefined) =>
  isoDate ? isoDate.slice(0, 10) : "";

const holidaySchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable().optional(),
    start_date: z.string().min(1, "Start date is required"),
    end_date: z.string().optional(),
    holiday_type: z.string().min(1, "Holiday type is required"),
    is_active: z.boolean(),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true;
      return new Date(data.end_date) >= new Date(data.start_date);
    },
    {
      message: "End date must be on or after the start date",
      path: ["end_date"],
    }
  );

export type THolidayFormValues = z.infer<typeof holidaySchema>;

interface HolidayEditFormProps {
  holiday: THoliday;
  onSuccess: () => void;
  onCancel: () => void;
}

const HolidayEditForm = ({
  holiday,
  onSuccess,
  onCancel,
}: HolidayEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<THolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      title: holiday.title,
      description: holiday.description,
      start_date: toDateInputValue(holiday.start_date),
      end_date: toDateInputValue(holiday.end_date),
      holiday_type: holiday.holiday_type,
      is_active: holiday.is_active,
    },
  });

  const onSubmit = (values: THolidayFormValues) => {
    startTransition(async () => {
      const response = await updateHoliday(holiday.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update holiday");
        return;
      }
      toast.success(response.message ?? "Holiday updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">
                {errors.title.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="holiday_type">Holiday Type</Label>
            <Select
              value={watch("holiday_type")}
              onValueChange={(value) => setValue("holiday_type", (value as THolidayFormValues["holiday_type"]))}
            >
              <SelectTrigger id="holiday_type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {HOLIDAY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.holiday_type && (
              <p className="text-xs text-destructive">
                {errors.holiday_type.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={3}
            {...register("description")}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              {...register("start_date")}
            />
            {errors.start_date && (
              <p className="text-xs text-destructive">
                {errors.start_date.message}
              </p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end_date">End Date</Label>
            <Input id="end_date" type="date" {...register("end_date")} />
            {errors.end_date && (
              <p className="text-xs text-destructive">
                {errors.end_date.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between rounded-md border border-border/50 px-4 py-3">
          <Label htmlFor="is_active" className="cursor-pointer">
            Active
          </Label>
          <Switch
            id="is_active"
            checked={watch("is_active")}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
        </div>
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

export default HolidayEditForm;