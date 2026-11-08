"use client";

import { FormInput } from "@/components/form";
import { FormSelect, type FormSelectOption } from "@/components/form/form-select";
import { FormTextarea } from "@/components/form/form-textarea";
import { get } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";

type PersonalInfoSectionProps = {
  form: UseFormReturn<any>;
};

const genderOptions: FormSelectOption[] = [
  { label: "Male", value: "MALE" },
  { label: "Female", value: "FEMALE" },
  { label: "Other", value: "OTHER" },
];

const error = (form: UseFormReturn<any>, field: string) =>
  get(form.formState.errors, field)?.message as string | undefined;

const PersonalInfoSection = ({ form }: PersonalInfoSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
          <svg
            className="h-3.5 w-3.5 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Personal Information</h3>
          <p className="text-[11px] text-muted-foreground">
            Enter the teacher's basic personal details.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormInput
          label="Full Name"
          placeholder="e.g. John Doe"
          required
          error={error(form, "full_name")}
          {...form.register("full_name")}
          inputClassName="h-10"
          containerClassName="sm:col-span-2"
        />

        <FormInput
          label="Email Address"
          type="email"
          placeholder="teacher@example.com"
          error={error(form, "email")}
          {...form.register("email")}
          inputClassName="h-10"
        />

        <FormInput
          label="Phone Number"
          placeholder="e.g. 013XXXXXXXX"
          required
          inputMode="numeric"
          maxLength={11}
          error={error(form, "phone")}
          {...form.register("phone")}
          inputClassName="h-10"
        />

        <FormInput
          label="bKash Number"
          placeholder="e.g. 013XXXXXXXX"
          inputMode="numeric"
          maxLength={11}
          error={error(form, "bkash_number")}
          {...form.register("bkash_number")}
          inputClassName="h-10"
        />

        <FormSelect
          label="Gender"
          required
          options={genderOptions}
          placeholder="Select gender"
          value={form.watch("gender")}
          onValueChange={(value) => form.setValue("gender", value, { shouldValidate: true })}
          error={error(form, "gender")}
        />
      </div>

      <FormTextarea
        label="Address"
        placeholder="Enter full address"
        error={error(form, "address")}
        {...form.register("address")}
        textareaClassName="min-h-20 resize-y"
      />
    </div>
  );
};

export default PersonalInfoSection;