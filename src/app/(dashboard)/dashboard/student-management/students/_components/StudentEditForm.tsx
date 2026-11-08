"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { updateStudent } from "@/services/student";
import { TStudent } from "./types";
import { religionOptions } from "../create-student/_components/schema/student.schema";

const studentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  father_name: z.string().min(1, "Father's name is required"),
  mother_name: z.string().min(1, "Mother's name is required"),
  religion: z.string().optional(),
  nid_no: z.string().optional(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  student_phone: z.string().optional(),
  father_phone: z.string().min(1, "Father's phone is required"),
  mother_phone: z.string().optional(),
  village_road: z.string().optional(),
  post_office: z.string().optional(),
  sub_district: z.string().min(1, "Sub-district is required"),
  district: z.string().min(1, "District is required"),
  email: z.string().email("Enter a valid email"),
  is_active: z.boolean(),
});

export type TStudentFormValues = z.infer<typeof studentSchema>;

interface StudentEditFormProps {
  student: TStudent;
  onSuccess: () => void;
  onCancel: () => void;
}

const RequiredMark = () => <span className="text-destructive">*</span>;

const StudentEditForm = ({
  student,
  onSuccess,
  onCancel,
}: StudentEditFormProps) => {
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<TStudentFormValues>({
    resolver: zodResolver(studentSchema),
    defaultValues: {
      name: student.name,
      father_name: student.father_name,
      mother_name: student.mother_name,
      religion: student.religion,
      nid_no: student.nid_no,
      gender: student.gender,
      student_phone: student.student_phone,
      father_phone: student.father_phone,
      mother_phone: student.mother_phone,
      village_road: student.village_road,
      post_office: student.post_office,
      sub_district: student.sub_district,
      district: student.district,
      email: student.email,
      is_active: student.is_active,
    },
  });

  const onSubmit = (values: TStudentFormValues) => {
    startTransition(async () => {
      const response = await updateStudent(student.id, values);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update student");
        return;
      }
      toast.success(response.message ?? "Student updated successfully");
      onSuccess();
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-5 max-h-[65vh] overflow-y-auto pr-1">
          {/* Identity */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Name <RequiredMark />
              </Label>
              <Input id="name" {...register("name")} />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nid_no">NID Number</Label>
              <Input id="nid_no" {...register("nid_no")} />
              {errors.nid_no && (
                <p className="text-xs text-destructive">
                  {errors.nid_no.message}
                </p>
              )}
            </div>
          </div>

          {/* Guardians */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="father_name">
                Father's Name <RequiredMark />
              </Label>
              <Input id="father_name" {...register("father_name")} />
              {errors.father_name && (
                <p className="text-xs text-destructive">
                  {errors.father_name.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mother_name">
                Mother's Name <RequiredMark />
              </Label>
              <Input id="mother_name" {...register("mother_name")} />
              {errors.mother_name && (
                <p className="text-xs text-destructive">
                  {errors.mother_name.message}
                </p>
              )}
            </div>
          </div>

          {/* Gender / Religion */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="gender">
                Gender <RequiredMark />
              </Label>
              <Select
                value={watch("gender")}
                onValueChange={(value) =>
                  setValue("gender", value as TStudentFormValues["gender"])
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="religion">Religion</Label>
              <Select
                value={watch("religion") ?? null}
                onValueChange={(value) => setValue("religion", value ?? undefined)}
              >
                <SelectTrigger id="religion">
                  <SelectValue placeholder="Select religion" />
                </SelectTrigger>
                <SelectContent>
                  {religionOptions.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r.charAt(0) + r.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.religion && (
                <p className="text-xs text-destructive">
                  {errors.religion.message}
                </p>
              )}
            </div>
          </div>

          {/* Contact */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">
                Email <RequiredMark />
              </Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="student_phone">Student Phone</Label>
              <Input id="student_phone" {...register("student_phone")} />
              {errors.student_phone && (
                <p className="text-xs text-destructive">
                  {errors.student_phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="father_phone">
                Father's Phone <RequiredMark />
              </Label>
              <Input id="father_phone" {...register("father_phone")} />
              {errors.father_phone && (
                <p className="text-xs text-destructive">
                  {errors.father_phone.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="mother_phone">Mother's Phone</Label>
              <Input id="mother_phone" {...register("mother_phone")} />
              {errors.mother_phone && (
                <p className="text-xs text-destructive">
                  {errors.mother_phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="village_road">Village / Road</Label>
              <Input id="village_road" {...register("village_road")} />
              {errors.village_road && (
                <p className="text-xs text-destructive">
                  {errors.village_road.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="post_office">Post Office</Label>
              <Input id="post_office" {...register("post_office")} />
              {errors.post_office && (
                <p className="text-xs text-destructive">
                  {errors.post_office.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sub_district">
                Sub-district <RequiredMark />
              </Label>
              <Input id="sub_district" {...register("sub_district")} />
              {errors.sub_district && (
                <p className="text-xs text-destructive">
                  {errors.sub_district.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">
                District <RequiredMark />
              </Label>
              <Input id="district" {...register("district")} />
              {errors.district && (
                <p className="text-xs text-destructive">
                  {errors.district.message}
                </p>
              )}
            </div>
          </div>

          {/* Toggles */}
          <div className="grid gap-4 sm:grid-cols-2">
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

export default StudentEditForm;