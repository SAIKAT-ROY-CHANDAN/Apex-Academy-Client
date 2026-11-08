"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, School } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v3";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { setupInstitution } from "@/services/institution";
import {
  DayOfWeek,
  InstitutionType,
  setupInstitutionValidation,
} from "@/validation/institution/setup-institution.validation";

type SetupInstitutionFormValues = z.infer<typeof setupInstitutionValidation>;

const INSTITUTION_TYPE_OPTIONS = [
  {
    value: InstitutionType.SCHOOL,
    label: "School",
    description: "Primary, secondary & higher secondary education",
    icon: School,
  },
  {
    value: InstitutionType.COLLEGE_UNIVERSITY,
    label: "College & University",
    description: "Higher education & degree programs",
    icon: Building2,
  },
];

const DAY_LABELS: Record<string, string> = {
  SUNDAY: "Sun",
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

const DAY_FULL_LABELS: Record<string, string> = {
  SUNDAY: "Sunday",
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
};

type SetupInstitutionFormProps = {
  onSuccess?: () => void;
};

const SetupInstitutionForm = ({ onSuccess }: SetupInstitutionFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<SetupInstitutionFormValues>({
    resolver: zodResolver(setupInstitutionValidation),
    defaultValues: {
      mode: InstitutionType.SCHOOL,
      name: "",
      address: "",
      phone: "",
      email: "",
      color_scheme: "",
      weekend_days: [],
    },
  });

  const onSubmit = (data: SetupInstitutionFormValues) => {
    startTransition(async () => {
      const response = await setupInstitution(data);
      console.dir(response, { depth: null, colors: true });
      if (!response.success) {
        toast.error(response.message ?? "Setup institution failed");
        return;
      }

      toast.success(response.message ?? "Institution setup successful");
      router.refresh();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push("/dashboard");
      }
    });
  };

  return (
    <form
      className="flex w-full max-w-3xl flex-col gap-8"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      {/* Institution Type Selection */}
      <div className="grid gap-3">
        <span className="text-sm font-medium text-foreground">
          Institution Type <span className="text-destructive">*</span>
        </span>
        <Controller
          name="mode"
          control={form.control}
          render={({ field }) => (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {INSTITUTION_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = field.value === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => field.onChange(option.value)}
                    className={cn(
                      "relative flex items-start gap-4 rounded-xl border-2 p-5 text-left transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-card",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-foreground">
                        {option.label}
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute right-4 top-4 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        />
        {form.formState.errors.mode?.message && (
          <p className="text-xs text-destructive">
            {form.formState.errors.mode.message}
          </p>
        )}
      </div>

      {/* Institution Details */}
      <div className="grid gap-5">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Institution Details
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Provide the basic information about your institution
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormInput
              label="Institution Name"
              placeholder="e.g. Sunshine International School"
              required
              error={form.formState.errors.name?.message}
              {...form.register("name")}
              inputClassName="h-12"
            />
          </div>

          <FormInput
            label="Address"
            placeholder="e.g. 123 Main Street, City"
            error={form.formState.errors.address?.message}
            {...form.register("address")}
            inputClassName="h-12"
          />

          <FormInput
            label="Phone"
            placeholder="e.g. +880 1234 567890"
            error={form.formState.errors.phone?.message}
            {...form.register("phone")}
            inputClassName="h-12"
          />

          <FormInput
            label="Email"
            type="email"
            placeholder="e.g. info@institution.edu"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
            inputClassName="h-12"
          />

          <FormInput
            label="Color Theme"
            placeholder="e.g. #0840A0"
            error={form.formState.errors.color_scheme?.message}
            {...form.register("color_scheme")}
            inputClassName="h-12"
          />
        </div>
      </div>

      {/* Weekend Days */}
      <div className="grid gap-3">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Weekend Days
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Select the days that are weekends for your institution
          </p>
        </div>
        <Controller
          name="weekend_days"
          control={form.control}
          render={({ field }) => (
            <div className="flex flex-wrap gap-2">
              {Object.values(DayOfWeek).map((day) => {
                const isSelected = (field.value ?? []).includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => {
                      const current = field.value ?? [];
                      const updated = isSelected
                        ? current.filter((d) => d !== day)
                        : [...current, day];
                      field.onChange(updated);
                    }}
                    className={cn(
                      "flex h-10 w-12 items-center justify-center rounded-lg border-2 text-sm font-medium transition-all",
                      "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30",
                    )}
                    title={DAY_FULL_LABELS[day]}
                  >
                    {DAY_LABELS[day]}
                  </button>
                );
              })}
            </div>
          )}
        />
        {form.formState.errors.weekend_days?.message && (
          <p className="text-xs text-destructive">
            {form.formState.errors.weekend_days.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between rounded-xl border bg-card p-5">
        <div>
          <p className="text-sm font-medium text-foreground">
            Ready to set up?
          </p>
          <p className="text-sm text-muted-foreground">
            Review your settings and create the institution
          </p>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          size="lg"
          className="min-w-40 bg-[#0840A0] text-white hover:bg-[#063781]"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <svg
                className="h-4 w-4 animate-spin"
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Setting up...
            </span>
          ) : (
            "Setup Institution"
          )}
        </Button>
      </div>
    </form>
  );
};

export default SetupInstitutionForm;
