"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v3";
import { FormInput, FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { loginAdmin } from "@/services/admin-auth";
import { adminLoginValidation } from "@/validation/auth/admin-auth/admin-auth.validation";

type AdminLoginFormValues = z.infer<typeof adminLoginValidation>;

const AdminLoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginValidation),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: AdminLoginFormValues) => {
    startTransition(async () => {
      const response = await loginAdmin(data);
      console.log(response, "response");

      if (!response.success) {
        toast.error(response.message ?? "Login failed");
        return;
      }
      toast.success(response.message ?? "Login successful");
      window.location.href = response?.data?.redirect || "/dashboard";
    });
  };

  return (
    <form
      className="flex w-full flex-col gap-5"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <FormInput
        label="Email Address"
        type="email"
        autoComplete="email"
        placeholder="Enter your email address"
        required
        icon={<Mail className="h-4 w-4" />}
        error={form.formState.errors.email?.message}
        {...form.register("email")}
        inputClassName="h-12 border-gray-200 bg-gray-50/50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
        labelClassName="text-sm font-medium text-gray-700"
      />
      <FormPasswordInput
        label="Password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        showStrength={false}
        icon={<Lock className="h-4 w-4" />}
        error={form.formState.errors.password?.message}
        {...form.register("password")}
        inputClassName="h-12 border-gray-200 bg-gray-50/50 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
        labelClassName="text-sm font-medium text-gray-700"
      />

      <div className="flex items-center justify-between gap-4">
        <label className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 accent-blue-600"
            defaultChecked
          />
          Remember me
        </label>
        <button
          type="button"
          className="text-sm font-medium text-blue-600 transition-colors hover:text-blue-700 hover:underline"
        >
          Forgot password?
        </button>
      </div>

      <div className="rounded-xl border border-blue-200/80 bg-blue-50/70 p-3 text-xs text-blue-900">
        <div className="font-semibold text-blue-950 mb-1 flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Demo Admin Credentials
        </div>
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <div>Email: <strong className="font-mono">admin@apexacademy.edu</strong></div>
            <div>Password: <strong className="font-mono">admin123</strong></div>
          </div>
          <button
            type="button"
            onClick={() => {
              form.setValue("email", "admin@apexacademy.edu");
              form.setValue("password", "admin123");
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
            <Loader2 className="h-5 w-5 animate-spin" />
            Signing in...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Sign in to Admin
            <ArrowRight className="h-4 w-4" />
          </span>
        )}
      </Button>
    </form>
  );
};

export default AdminLoginForm;
