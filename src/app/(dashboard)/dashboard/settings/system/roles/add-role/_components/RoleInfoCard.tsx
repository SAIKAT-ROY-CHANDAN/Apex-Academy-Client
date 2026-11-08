"use client";

import { BadgeCheck, Lock, LockKeyhole, Tag, UserRoundCog } from "lucide-react";
import type { UseFormRegister } from "react-hook-form";
import { FormInput } from "@/components/form";
import { cn } from "@/lib/utils";
import type { CreateRoleFormValues } from "@/validation/role/role.validation";

type RoleInfoCardProps = {
  register: UseFormRegister<CreateRoleFormValues>;
  error?: string;
  roleName?: string;
  readOnly?: boolean;
};

const MAX_LENGTH = 100;

const RoleInfoCard = ({
  register,
  error,
  roleName = "",
  readOnly = false,
}: RoleInfoCardProps) => {
  const chars = roleName.length;
  const nearLimit = chars > MAX_LENGTH * 0.85;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Decorative accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-linear-to-r from-blue-600 via-sky-500 to-blue-400" />
      <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl" />

      <div className="flex items-start gap-4 p-6">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 ring-1 ring-blue-100 dark:bg-blue-950/30 dark:ring-blue-900/40">
          <UserRoundCog className="h-5.5 w-5.5 text-blue-600 dark:text-blue-400" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              Role Information
            </h3>
            {roleName.trim() && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-600 ring-1 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900/40">
                <BadgeCheck className="h-3 w-3" />
                {roleName.trim()}
              </span>
            )}
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Define the name for this new role. Use a clear, descriptive name so
            other admins instantly understand its purpose.
          </p>
        </div>
      </div>

      <div className="border-t border-border/70 px-6 py-5">
        <div className="max-w-lg">
          <FormInput
            label="Role Name"
            placeholder="e.g. Admin, Teacher, Accountant"
            required
            error={error}
            icon={
              readOnly ? (
                <LockKeyhole className="h-4 w-4" />
              ) : (
                <Tag className="h-4 w-4" />
              )
            }
            maxLength={MAX_LENGTH}
            autoComplete="off"
            readOnly={readOnly}
            {...register("role_name")}
            inputClassName={cn(
              "h-12 pl-11 pr-16 rounded-xl transition-shadow focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
              error &&
                "border-destructive focus:border-destructive focus:ring-destructive/20",
              readOnly && "cursor-not-allowed bg-muted/60 pr-11",
            )}
          />
          {readOnly ? (
            <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3 shrink-0" />
              This is the default administrator role — its name cannot be
              changed.
            </p>
          ) : (
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Tip: e.g.{" "}
                <span className="font-medium text-foreground/70">
                  "Teacher"
                </span>{" "}
                for teaching staff,{" "}
                <span className="font-medium text-foreground/70">
                  "Accountant"
                </span>{" "}
                for finance access.
              </p>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  nearLimit
                    ? "font-medium text-amber-600"
                    : "text-muted-foreground",
                )}
              >
                {chars}/{MAX_LENGTH}
              </span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default RoleInfoCard;
