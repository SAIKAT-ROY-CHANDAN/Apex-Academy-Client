"use client";

import {
  FormImageUploadSingle,
  FormInput,
  FormPasswordInput,
  FormSelect,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateAdminUserById } from "@/services/admin-auth";
import { TAdminUser } from "@/types/modules/admin-user/admin-user.type";
import { createAdminUserValidation, updateAdminUserValidation } from "@/validation/auth/admin-auth/admin-auth.validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod/v3";

type EditAdminFormProps = {
  admin: TAdminUser;
  roles: {
    role_name: string;
    id: string;
  }[];
};

type EditAdminFormValues = z.infer<typeof updateAdminUserValidation>;

const EditAdminForm = ({ admin, roles }: EditAdminFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(updateAdminUserValidation),
    defaultValues: {
      name: admin.name ?? "",
      roleId: admin.roleId ?? admin.userRole?.roleId ?? "",
    },
  });

  // File state for the optional avatar
  const avatarRef = useRef<File | null>(null);

  const handleAvatarChange = useCallback((file: File | null) => {
    avatarRef.current = file;
  }, []);

  const onSubmit = (data: EditAdminFormValues) => {
    startTransition(async () => {
      const fd = new FormData();

      // Append text fields
      if (data.name) fd.append("name", data.name.trim());
      if (data.roleId) fd.append("roleId", data.roleId);

      // Append optional avatar
      if (avatarRef.current) {
        fd.append("avatar", avatarRef.current);
      }

      const response = await updateAdminUserById(admin.id, fd);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update administrator");
        return;
      }
      toast.success(response.message ?? "Administrator updated successfully");
      router.refresh();
      router.push("/dashboard/settings/system/users");
    });
  };

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold">
              Edit Administrator
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Update the administrator's name, email, password and role.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-6"
          onSubmit={form.handleSubmit(onSubmit)}
          noValidate
        >
          {/* Name & Email */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <FormInput
              label="Name"
              placeholder="e.g. John Doe"
              error={form.formState.errors.name?.message}
              {...form.register("name")}
              inputClassName="h-11"
            />
          </div>

          {/* Password & Role */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

            <FormSelect
              label="Role"
              placeholder="Select a role"
              error={form.formState.errors.roleId?.message}
              value={form.watch("roleId")}
              onValueChange={(value) => form.setValue("roleId", value)}
              options={roles.map((role) => ({
                label: role.role_name,
                value: role.id,
              }))}
              triggerClassName="h-11"
            />
          </div>

          {/* Avatar (optional) */}
          <FormImageUploadSingle
            label="Avatar"
            description="Optional profile picture for the administrator."
            accept="image/png,image/jpeg,image/webp"
            maxSizeMB={5}
            helperText="PNG, JPG, WEBP | up to 5MB"
            name="avatar"
            defaultUrl={admin.avatar ?? undefined}
            onFileChange={handleAvatarChange}
          />

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 border-t pt-6">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="h-11 px-6">
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Update Administrator
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EditAdminForm;