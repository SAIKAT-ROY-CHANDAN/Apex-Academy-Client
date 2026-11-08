"use client";

import { FormInput, FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod/v3";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { StudentLoginValidation } from "./types";
import { loginStudent } from "@/services/student";

type StudentLoginFormValues = z.infer<typeof StudentLoginValidation>;

const StudentLoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<StudentLoginFormValues>({
    resolver: zodResolver(StudentLoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: StudentLoginFormValues) => {
    startTransition(async () => {
      const response = await loginStudent(data);

      if (!response.success) {
        toast.error(response.message ?? "Login failed");
        return;
      }
      toast.success(response.message ?? "Login successful");
      window.location.href = "/student-dashboard";
    });
  };

  return (
    <form
      className="flex w-full flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormInput
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="Enter your Email"
        required
        error={form.formState.errors.email?.message}
        {...form.register("email")}
        inputClassName="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
        labelClassName="text-sm font-medium text-gray-700"
      />
      <FormPasswordInput
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        showStrength={false}
        error={form.formState.errors.password?.message}
        {...form.register("password")}
        inputClassName="h-12 border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
        labelClassName="text-sm font-medium text-gray-700"
      />

      <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-3 text-xs text-blue-900">
        <div className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Demo Student Credentials
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <div>Email: <strong className="font-mono">student@apexacademy.edu</strong></div>
            <div>Password: <strong className="font-mono">student123</strong></div>
          </div>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "student@apexacademy.edu");
              form.setValue("password", "student123");
            }}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-xs shadow-sm transition-colors cursor-pointer"
          >
            Auto-Fill
          </button>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isPending}
        className="relative h-12 w-full overflow-hidden rounded-xl bg-gradient-to-r from-[#0A1F44] to-[#1A3F7A] text-base font-semibold text-white shadow-lg shadow-blue-900/20 transition-all duration-300 hover:shadow-xl hover:shadow-blue-900/30 hover:from-[#0F2B5C] hover:to-[#1F4A8A] active:scale-[0.98] disabled:opacity-70"
      >
        {isPending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing in...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign in
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        )}
      </Button>
    </form>
  );
};

export default StudentLoginForm;