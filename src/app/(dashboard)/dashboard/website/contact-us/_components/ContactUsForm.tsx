"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { SquarePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createWebsiteContactUs,
  updateWebsiteContactUs,
} from "@/services/websiteContactUs";
import {
  type WebsiteContactUsFormValues,
  websiteContactUsValidation,
} from "@/validation/websiteContactUs/websiteContactUs.validation";

export interface WebsiteContactUsData {
  id: string;
  heading?: string | null;
  subHeading?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  mapUrl?: string | null;
  workingHours?: string | null;
  facebookUrl?: string | null;
}

interface ContactUsFormProps {
  initialData?: WebsiteContactUsData | null;
}

export default function ContactUsForm({ initialData }: ContactUsFormProps) {
  const router = useRouter();
  const isEditMode = Boolean(initialData?.id);
  const [isPending, startTransition] = useTransition();
  const [resetOpen, setResetOpen] = useState(false);

  const form = useForm<WebsiteContactUsFormValues>({
    resolver: zodResolver(websiteContactUsValidation),
    defaultValues: {
      heading: initialData?.heading ?? "",
      subHeading: initialData?.subHeading ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      location: initialData?.location ?? "",
      mapUrl: initialData?.mapUrl ?? "",
      workingHours: initialData?.workingHours ?? "",
      facebookUrl: initialData?.facebookUrl ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      heading: initialData?.heading ?? "",
      subHeading: initialData?.subHeading ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      location: initialData?.location ?? "",
      mapUrl: initialData?.mapUrl ?? "",
      workingHours: initialData?.workingHours ?? "",
      facebookUrl: initialData?.facebookUrl ?? "",
    });
  }, [initialData, form]);

  const handleReset = () => {
    form.reset({
      heading: initialData?.heading ?? "",
      subHeading: initialData?.subHeading ?? "",
      phone: initialData?.phone ?? "",
      email: initialData?.email ?? "",
      location: initialData?.location ?? "",
      mapUrl: initialData?.mapUrl ?? "",
      workingHours: initialData?.workingHours ?? "",
      facebookUrl: initialData?.facebookUrl ?? "",
    });
  };

  const getSpecificErrorMessage = (response: any): string | null => {
    if (response?.errorSources && Array.isArray(response.errorSources) && response.errorSources.length > 0) {
      const first = response.errorSources[0];
      if (first?.path && first?.message) return `${first.path}: ${first.message}`;
      if (first?.message) return first.message;
    }
    if (response?.message && response.message !== "Validation error") return response.message;
    if (response?.errorSources?.[0]?.message) return response.errorSources[0].message;
    return null;
  };

  const onSubmit = (data: WebsiteContactUsFormValues) => {
    startTransition(async () => {
      const payload = {
        heading: data.heading ?? "",
        subHeading: data.subHeading ?? "",
        phone: data.phone ?? "",
        email: data.email ?? "",
        location: data.location ?? "",
        mapUrl: data.mapUrl ?? "",
        workingHours: data.workingHours ?? "",
        facebookUrl: data.facebookUrl ?? "",
      };

      const response =
        isEditMode && initialData?.id
          ? await updateWebsiteContactUs(initialData.id, payload)
          : await createWebsiteContactUs(payload);

      if (response?.success) {
        toast.success(
          isEditMode
            ? "Contact Us updated successfully"
            : "Contact Us created successfully",
        );
        router.refresh();
      } else {
        // Map backend field errors to form if available
        if (response?.errorSources && Array.isArray(response.errorSources)) {
          response.errorSources.forEach((err: { path: string; message: string }) => {
            if (err.path && err.message) {
              const field = err.path as keyof WebsiteContactUsFormValues;
              // only set if field exists in form
              if (field in form.getValues()) {
                form.setError(field, { type: "server", message: err.message });
              }
            }
          });
        }
        const specific = getSpecificErrorMessage(response);
        toast.error(specific ?? response?.message ?? "Something went wrong");
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">Heading</Label>
        <Input
          {...form.register("heading")}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        {form.formState.errors.heading?.message && (
          <p className="text-xs text-red-500">{form.formState.errors.heading.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-semibold text-slate-700">
          Sub- Heading
        </Label>
        <Input
          {...form.register("subHeading")}
          placeholder="Write here..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
        />
        {form.formState.errors.subHeading?.message && (
          <p className="text-xs text-red-500">{form.formState.errors.subHeading.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">Phone</Label>
          <Input
            {...form.register("phone")}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {form.formState.errors.phone?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.phone.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">E mail</Label>
          <Input
            {...form.register("email")}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {form.formState.errors.email?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Location
          </Label>
          <Input
            {...form.register("location")}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {form.formState.errors.location?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.location.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Map URL
          </Label>
          <Input
            {...form.register("mapUrl")}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {form.formState.errors.mapUrl?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.mapUrl.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Working Hours (Sun - Wed)
          </Label>
          <Input
            {...form.register("workingHours")}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {form.formState.errors.workingHours?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.workingHours.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-slate-700">
            Facebook URL
          </Label>
          <Input
            {...form.register("facebookUrl")}
            placeholder="Write here..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm shadow-sm focus-visible:ring-2 focus-visible:ring-primary/30"
          />
          {form.formState.errors.facebookUrl?.message && (
            <p className="text-xs text-red-500">{form.formState.errors.facebookUrl.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 pt-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setResetOpen(true)}
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-5 text-sm font-semibold text-red-500 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          Reset
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SquarePlus className="h-4 w-4" />
          {isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset form?"
        description="Are you sure you want to reset the form? All unsaved changes will be lost."
        confirmLabel="Reset"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => {
          handleReset();
          setResetOpen(false);
        }}
      />
    </form>
  );
}
