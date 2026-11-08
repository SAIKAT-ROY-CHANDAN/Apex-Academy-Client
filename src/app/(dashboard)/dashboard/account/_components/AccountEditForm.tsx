"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, UserCog, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod/v3";
import { FormImageUploadSingle, FormInput } from "@/components/form";
import { Button } from "@/components/ui/button";
import { updateAdminUserById } from "@/services/admin-auth";
import type { TAdminUser } from "@/types/modules/admin-user/admin-user.type";
import { updateAccountValidation } from "./schema/account.validation";

type AccountEditFormProps = {
  admin: TAdminUser;
  onCancel: () => void;
  onSaved: () => void;
};

type AccountEditFormValues = z.infer<typeof updateAccountValidation>;

const AccountEditForm = ({
  admin,
  onCancel,
  onSaved,
}: AccountEditFormProps) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const avatarRef = useRef<File | null>(null);

  const form = useForm<AccountEditFormValues>({
    resolver: zodResolver(updateAccountValidation),
    defaultValues: {
      name: admin.name ?? "",
    },
  });

  const handleAvatarChange = useCallback((file: File | null) => {
    avatarRef.current = file;
  }, []);

  const onSubmit = (data: AccountEditFormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", data.name.trim());
      if (avatarRef.current) {
        formData.append("avatar", avatarRef.current);
      }

      const response = await updateAdminUserById(admin.id, formData);

      if (!response.success) {
        toast.error(response.message ?? "Failed to update your profile");
        return;
      }

      toast.success(response.message ?? "Profile updated successfully");
      router.refresh();
      onSaved();
    });
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-sm ring-1 ring-white/50 backdrop-blur-xl">
      <div className="relative overflow-hidden border-b border-slate-200/70 bg-linear-to-r from-sky-50 via-white to-indigo-50 px-6 py-5">
        <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-10 h-40 w-40 rounded-full bg-indigo-300/20 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-sky-400 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <UserCog className="h-5 w-5" />
          </div>
          <div>
            <h2 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-base font-bold tracking-tight text-transparent">
              Edit Profile
            </h2>
            <p className="text-xs text-slate-400">
              Update your name and profile picture
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <FormImageUploadSingle
            label="Profile Picture"
            description="PNG, JPEG or WebP up to 5MB. Leave empty to keep your current photo."
            defaultUrl={admin.avatar ?? undefined}
            onFileChange={handleAvatarChange}
          />

          <FormInput
            label="Name"
            placeholder="Your full name"
            error={form.formState.errors.name?.message}
            {...form.register("name")}
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 gap-1.5 rounded-xl text-muted-foreground"
              onClick={onCancel}
              disabled={isPending}
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="h-9 gap-1.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-4 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 active:scale-95"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5" />
              )}
              {isPending ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default AccountEditForm;
