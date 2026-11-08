"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createStaff } from "@/services/staff";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  PersonalInfoSection,
  EmploymentInfoSection,
  DocumentsSection,
  SalarySection,
} from "./sections";

// Bangladeshi mobile numbers: exactly 11 digits starting with 01 (e.g. 013XXXXXXXX)
const bdMobileRegex = /^01\d{9}$/;
const bdMobileMessage =
  "Must be 11 digits starting with 01 (e.g. 013XXXXXXXX)";

// Frontend validation
const createStaffSchema = z.object({
  full_name: z.string().min(2, "Full name cannot be empty"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .regex(bdMobileRegex, `Phone number ${bdMobileMessage}`),
  bkash_number: z
    .string()
    .regex(bdMobileRegex, `bKash number ${bdMobileMessage}`)
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  gender: z.string().min(1, "Gender is required"),
  staff_type: z.string().min(1, "Staff type is required"),
  academic_qualification: z.string().min(1, "Academic qualification is required"),
  designation_id: z.string().min(1, "Designation is required"),
  customSalaries: z
    .array(
      z.object({
        salary_component: z.string().min(1, "Component name is required"),
        salary_amount: z.string().min(1, "Amount is required"),
      }),
    )
    .default([]),
});

type FormValues = z.infer<typeof createStaffSchema>;

// Props
type AddStaffFormProps = {
  designations: { id: string; name: string }[];
};

// Component
const AddStaffForm = ({
  designations,
}: AddStaffFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createStaffSchema) as any,
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
      customSalaries: [{ salary_component: "Basic Salary", salary_amount: "" }],
    },
  });

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
          // Append as JSON string
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

      const res = await createStaff(fd);

      if (!res.success) {
        toast.error(res.message ?? "Failed to add staff");
        return;
      }

      toast.success(res.message ?? "Staff added successfully");
      router.refresh();
      router.push("/dashboard/employees/staffs");
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-5">
        <FormProvider {...form}>
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
          <DocumentsSection onFileChange={handleFileChange} />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-5"
              onClick={() => router.back()}
              disabled={isPending}
            >
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
                  Add Staff
                </>
              )}
            </Button>
          </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
};

export default AddStaffForm;