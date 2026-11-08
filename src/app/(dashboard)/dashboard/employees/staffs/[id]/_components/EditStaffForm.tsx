"use client";

import { FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { updateStaff, getStaffById } from "@/services/staff";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  PersonalInfoSection,
  EmploymentInfoSection,
  DocumentsSection,
  SalarySection,
} from "../../add-staff/_components/sections";

// Frontend validation
const editStaffSchema = z.object({
  full_name: z.string().min(2, "Full name cannot be empty"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(15, "Phone number must be at most 15 characters"),
  bkash_number: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  gender: z.string().min(1, "Gender is required"),
  staff_type: z.string().min(1, "Staff type is required"),
  academic_qualification: z.string().min(1, "Academic qualification is required"),
  designation_id: z.string().min(1, "Designation is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .optional()
    .or(z.literal("")),
  customSalaries: z
    .array(
      z.object({
        salary_component: z.string().min(1, "Component name is required"),
        salary_amount: z.string().min(1, "Amount is required"),
      }),
    )
    .default([]),
});

type FormValues = z.infer<typeof editStaffSchema>;

// Props
type EditStaffFormProps = {
  staff: Record<string, unknown>;
  designations: { id: string; name: string }[];
};

// Component
const EditStaffForm = ({
  staff,
  designations,
}: EditStaffFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [staffData, setStaffData] = useState<Record<string, unknown> | null>(null);

  // Fetch fresh staff data on mount
  useEffect(() => {
    if (staff?.id) {
      getStaffById(staff.id as string).then((res) => {
        if (res?.success && res?.data) {
          setStaffData(res.data);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staff?.id]);

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(editStaffSchema) as any,
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      bkash_number: "",
      address: "",
      gender: "",
      staff_type: "",
      academic_qualification: "",
      designation_id: "",
      password: "",
      customSalaries: [{ salary_component: "Basic Salary", salary_amount: "" }],
    },
  });

  // Pre-populate form when staff data is loaded
  useEffect(() => {
    const data = staffData || staff;
    if (!data) return;

    form.reset({
      full_name: (data.full_name as string) || "",
      email: (data.email as string) || "",
      phone: (data.phone as string) || "",
      bkash_number: (data.bkash_number as string) || "",
      address: (data.address as string) || "",
      gender: (data.gender as string) || "",
      staff_type: (data.staff_type as string) || "",
      academic_qualification: (data.academic_qualification as string) || "",
      designation_id: (data.designation_id as string) || "",
      password: "",
      customSalaries: (() => {
        const salary = (data as Record<string, unknown>).salary as Record<string, unknown> | null;
        let salaries: { salary_component: string; salary_amount: number | string }[] = [];
        // Try nested salary.customSalaries first
        if (salary && typeof salary === "object") {
          const raw = (salary as Record<string, unknown>).customSalaries;
          if (Array.isArray(raw)) {
            salaries = raw as { salary_component: string; salary_amount: number | string }[];
          } else if (typeof raw === "string") {
            try { const parsed = JSON.parse(raw); if (Array.isArray(parsed)) salaries = parsed; } catch { /* ignore */ }
          }
        }
        // Also check if customSalaries is at top level (flat payload)
        if (salaries.length === 0) {
          const topLevel = (data as Record<string, unknown>).customSalaries;
          if (Array.isArray(topLevel)) {
            salaries = topLevel as { salary_component: string; salary_amount: number | string }[];
          } else if (typeof topLevel === "string") {
            try { const parsed = JSON.parse(topLevel); if (Array.isArray(parsed)) salaries = parsed; } catch { /* ignore */ }
          }
        }
        return salaries.length > 0
          ? salaries.map((s) => ({
              salary_component: s.salary_component,
              salary_amount: String(s.salary_amount),
            }))
          : [];
      })(),
    });
  }, [staffData, staff, form]);

  // File state
  const filesRef = useRef<Record<string, File>>({});

  const handleFileChange = useCallback(
    (fieldName: string, file: File | null) => {
      if (file) {
        filesRef.current[fieldName] = file;
      } else {
        delete filesRef.current[fieldName];
      }
    },
    [],
  );

  // Submit
  const submit = async (values: FormValues) => {
    startTransition(async () => {
      const fd = new FormData();

      // Append text fields (skip empty strings)
      Object.entries(values).forEach(([key, value]) => {
        if (key === "customSalaries") {
          if (value && Array.isArray(value) && value.length > 0) {
            fd.append("customSalaries", JSON.stringify(value));
          }
        } else if (value && typeof value === "string" && value.trim()) {
          fd.append(key, value.trim());
        }
      });

      // Append files
      Object.entries(filesRef.current).forEach(([fieldName, file]) => {
        fd.append(fieldName, file);
      });

      const res = await updateStaff(staff.id as string, fd);

      console.log(res, "response")

      if (!res.success) {
        toast.error(res.message ?? "Failed to update staff");
        return;
      }

      toast.success(res.message ?? "Staff updated successfully");
      router.refresh();
      router.push("/dashboard/employees/staffs");
    });
  };

  // Existing documents (URLs) to show as defaults in edit mode
  const docSource = (staffData || staff) as Record<string, unknown>;
  const toUrlString = (v: unknown): string | undefined => {
    if (typeof v === "string" && v.trim()) return v;
    if (v && typeof v === "object") {
      const obj = v as Record<string, unknown>;
      const url = obj.url ?? obj.file_url ?? obj.path;
      if (typeof url === "string" && url.trim()) return url;
    }
    return undefined;
  };
  const documentDefaults = {
    nid_front: toUrlString(docSource?.nid_front),
    nid_back: toUrlString(docSource?.nid_back),
    photo: toUrlString(docSource?.photo),
    academic_document: toUrlString(docSource?.academic_document),
    previous_institution_resign_letter: toUrlString(
      docSource?.previous_institution_resign_letter,
    ),
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-5">
        <form
          className="space-y-5"
          onSubmit={form.handleSubmit(submit)}
          noValidate
        >
          {/* Personal Information */}
          <PersonalInfoSection form={form} />
          <Separator />

          {/* Employment Details */}
          <EmploymentInfoSection
            form={form}
            designations={designations}
          />
          <Separator />

          {/* Salary Details */}
          <SalarySection form={form} />
          <Separator />

          {/* Documents & Photos */}
          <DocumentsSection
            onFileChange={handleFileChange}
            defaults={documentDefaults}
          />
          <Separator />

          {/* Account Credentials */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-4 w-4 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-semibold">Account Credentials</h3>
                <p className="text-xs text-muted-foreground">
                  Leave blank to keep the current password.
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <FormPasswordInput
                label="New Password (optional)"
                placeholder="Enter a new password"
                minLength={6}
                showStrength
                error={
                  form.formState.errors.password?.message as string | undefined
                }
                {...form.register("password")}
                inputClassName="h-10"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5"
              onClick={() => router.back()}
              disabled={isPending}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-10 px-5">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Staff
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditStaffForm;