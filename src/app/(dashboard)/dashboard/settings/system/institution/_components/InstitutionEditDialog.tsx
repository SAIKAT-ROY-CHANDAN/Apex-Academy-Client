"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Check, School } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";
import { FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateInstitution } from "@/services/institution";
import type { TInstitution } from "@/types/modules/institution/institution.type";

const editSchema = z.object({
  name: z.string().min(1, "Institution name is required"),
  address: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  email: z
    .string()
    .email({ message: "Invalid email address" })
    .optional()
    .or(z.literal("")),
  color_scheme: z.string().optional().or(z.literal("")),
  weekend_days: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof editSchema>;

interface InstitutionEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institution: TInstitution;
}

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

const INSTITUTION_TYPE_OPTIONS = [
  {
    value: "SCHOOL",
    label: "School",
    description: "Primary, secondary & higher secondary education",
    icon: School,
  },
  {
    value: "COLLEGE_UNIVERSITY",
    label: "College & University",
    description: "Higher education & degree programs",
    icon: Building2,
  },
];

const InstitutionEditDialog = ({
  open,
  onOpenChange,
  institution,
}: InstitutionEditDialogProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const parseJsonArray = (value: unknown): string[] => {
    if (value == null) return [];
    if (Array.isArray(value)) return value as string[];
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed as string[];
        if (typeof parsed === "string") return [parsed];
        return [];
      } catch {
        if (trimmed.startsWith("[") || trimmed.startsWith('"')) return [];
        if (trimmed.includes(",")) {
          return trimmed
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
        return [trimmed];
      }
    }
    return [];
  };

  const parsedWeekendDays = parseJsonArray(institution.weekend_days);

  const form = useForm<FormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: institution.name ?? "",
      address: institution.address ?? "",
      phone: institution.phone ?? "",
      email: institution.email ?? "",
      color_scheme: institution.color_scheme ?? "",
      weekend_days: parsedWeekendDays,
    },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      const response = await updateInstitution(institution.id, data);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update institution");
        return;
      }

      toast.success(response.message ?? "Institution updated successfully");
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Institution</DialogTitle>
          <DialogDescription>
            Update your institution settings. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form
          className="flex flex-col gap-6 py-2"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {/* Institution Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Mode</Label>
            <div className="grid grid-cols-2 gap-3">
              {INSTITUTION_TYPE_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = institution.mode === option.value;
                return (
                  <div
                    key={option.value}
                    className={cn(
                      "flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-muted/50 opacity-60",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground">
                        {option.label}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {option.description}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              Institution type cannot be changed after setup. Contact support to
              change.
            </p>
          </div>

          {/* Institution Details */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Institution Details
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Basic information about your institution
              </p>
            </div>

            <div className="space-y-4">
              <FormInput
                label="Institution Name"
                placeholder="e.g. Sunshine International School"
                required
                error={form.formState.errors.name?.message}
                {...form.register("name")}
                inputClassName="h-11"
              />

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormInput
                  label="Address"
                  placeholder="e.g. 123 Main Street, City"
                  error={form.formState.errors.address?.message}
                  {...form.register("address")}
                  inputClassName="h-11"
                />

                <FormInput
                  label="Phone"
                  placeholder="e.g. +880 1234 567890"
                  error={form.formState.errors.phone?.message}
                  {...form.register("phone")}
                  inputClassName="h-11"
                />

                <FormInput
                  label="Email"
                  type="email"
                  placeholder="e.g. info@institution.edu"
                  error={form.formState.errors.email?.message}
                  {...form.register("email")}
                  inputClassName="h-11"
                />

                <FormInput
                  label="Color Theme"
                  placeholder="e.g. #0840A0"
                  error={form.formState.errors.color_scheme?.message}
                  {...form.register("color_scheme")}
                  inputClassName="h-11"
                />
              </div>
            </div>
          </div>

          {/* Weekend Days */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                Weekend Days
              </h4>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Select the days that are weekends for your institution
              </p>
            </div>
            <Controller
              name="weekend_days"
              control={form.control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(DAY_LABELS).map(([key, label]) => {
                    const isSelected = (field.value ?? []).includes(key);
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => {
                          const current = field.value ?? [];
                          const updated = isSelected
                            ? current.filter((d) => d !== key)
                            : [...current, key];
                          field.onChange(updated);
                        }}
                        className={cn(
                          "flex h-10 w-12 items-center justify-center rounded-lg border-2 text-sm font-medium transition-all",
                          "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-card text-muted-foreground hover:border-muted-foreground/30",
                        )}
                        title={DAY_FULL_LABELS[key]}
                      >
                        {label}
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

          <DialogFooter className="border-t border-border/50 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="min-w-32">
              {isPending ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
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
                  Saving...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default InstitutionEditDialog;
