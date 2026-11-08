"use client";

import { FormPasswordInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { createTeacher } from "@/services/teacher";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  AcademicInfoSection,
  DocumentsSection,
  EmploymentInfoSection,
  PersonalInfoSection,
  SalarySection,
} from "./sections";

// Bangladeshi mobile numbers: exactly 11 digits starting with 01 (e.g. 013XXXXXXXX)
const bdMobileRegex = /^01\d{9}$/;
const bdMobileMessage =
  "Must be 11 digits starting with 01 (e.g. 013XXXXXXXX)";

// Frontend validation
const createTeacherSchema = z
  .object({
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
    last_qualification: z.string().min(1, "Last qualification is required"),
    teacher_type: z.string().min(1, "Teacher type is required"),
    administrative_position: z.string().optional().or(z.literal("")),
    department_id: z.string().optional().or(z.literal("")),
    subject_id: z.string().optional().or(z.literal("")),
    shift_id: z.string().optional().or(z.literal("")),
    designation_id: z.string().min(1, "Designation is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    academic_document: z
      .instanceof(File, { message: "Academic document is required" })
      .nullable(),
    customSalaries: z
      .array(
        z.object({
          salary_component: z.string().min(1, "Component name is required"),
          salary_amount: z.string().min(1, "Amount is required"),
        }),
      )
      .default([]),
  })
  .refine((data) => !!data.academic_document, {
    message: "Academic document is required",
    path: ["academic_document"],
  });

type FormValues = z.infer<typeof createTeacherSchema>;

// Props
type AddTeacherFormProps = {
  mode: string;
  shifts: { id: string; name: string }[];
  programs: {
    id: string;
    program_name: string;
    departments: { id: string; department_name: string }[];
  }[];
  designations: { id: string; name: string }[];
};

// Component
const AddTeacherForm = ({
  mode,
  shifts,
  programs,
  designations,
}: AddTeacherFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(createTeacherSchema) as any,
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      bkash_number: "",
      address: "",
      gender: "",
      last_qualification: "",
      teacher_type: "",
      administrative_position: "",
      department_id: "",
      subject_id: "",
      shift_id: "",
      designation_id: "",
      password: "",
      academic_document: null,
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

      const res = await createTeacher(fd);
      console.log(res, "res");

      if (!res.success) {
        toast.error(res.message ?? "Failed to add teacher");
        return;
      }

      toast.success(res.message ?? "Teacher added successfully");
      router.refresh();
      router.push("/dashboard/employees/teachers");
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

          {/* Academic Information */}
          <AcademicInfoSection form={form} programs={programs} mode={mode} />
          <Separator />

          {/* Employment Details */}
          <EmploymentInfoSection
            form={form}
            mode={mode}
            shifts={shifts}
            designations={designations}
          />
          <Separator />

          {/* Salary Details */}
          <SalarySection form={form} />
          <Separator />

          {/* Documents & Photos */}
          <DocumentsSection onFileChange={handleFileChange} />
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
                  Set the teacher's login password.
                </p>
              </div>
            </div>

            <div className="max-w-md">
              <FormPasswordInput
                label="Password"
                placeholder="Enter a secure password"
                required
                minLength={6}
                showStrength
                value={form.watch("password")}
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
                  Add Teacher
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

export default AddTeacherForm;