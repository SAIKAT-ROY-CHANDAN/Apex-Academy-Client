"use client";

import {
  Activity,
  ArrowLeft,
  Calendar,
  Camera,
  ChevronRight,
  History,
  LayoutDashboard,
  Mail,
  Pencil,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { TAdminUser } from "@/types/modules/admin-user/admin-user.type";

type AccountProfileViewProps = {
  admin: TAdminUser;
  userType?: string;
  onEdit: () => void;
};

const getInitials = (name: string) =>
  (name ?? "")
    .split(" ")
    .map((w) => w.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);

const formatDate = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

const capitalize = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const StatusPill = ({ active }: { active: boolean }) => (
  <span
    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] font-semibold ${
      active
        ? "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200"
        : "bg-red-100 text-red-600 ring-1 ring-red-200"
    }`}
  >
    <span className="relative flex h-1.5 w-1.5">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
          active ? "bg-emerald-500" : "bg-red-500"
        }`}
      />
    </span>
    {active ? "Active" : "Inactive"}
  </span>
);

const Stat = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-white/70 bg-white/70 px-4 py-3 shadow-sm ring-1 ring-white/50 backdrop-blur-xl">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-sky-50 to-indigo-50 text-indigo-600">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0">
      <p className="text-[0.7rem] font-medium uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="truncate text-sm font-semibold text-slate-900">{value}</p>
    </div>
  </div>
);

const InfoRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | undefined | null;
}) => (
  <div className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-white/70">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all group-hover:bg-linear-to-br group-hover:from-sky-50 group-hover:to-indigo-50 group-hover:text-indigo-600">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="truncate text-sm font-medium text-slate-900">
        {value || "—"}
      </p>
    </div>
  </div>
);

const ActionRow = ({
  icon: Icon,
  label,
  description,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  description: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/80"
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/70 bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/60 transition-all group-hover:border-transparent group-hover:bg-linear-to-br group-hover:from-sky-500 group-hover:to-indigo-500 group-hover:text-white group-hover:shadow-indigo-500/30">
      <Icon className="h-4 w-4" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <p className="text-xs text-slate-400">{description}</p>
    </div>
    <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-indigo-500" />
  </button>
);

const SectionTitle = ({
  title,
  description,
}: {
  title: string;
  description: string;
}) => (
  <div className="border-b border-slate-200/70 px-6 py-4">
    <h2 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-base font-bold tracking-tight text-transparent">
      {title}
    </h2>
    <p className="mt-0.5 text-xs text-slate-400">{description}</p>
  </div>
);

const AccountProfileView = ({
  admin,
  userType,
  onEdit,
}: AccountProfileViewProps) => {
  const router = useRouter();
  const roleName = admin.userRole?.role?.role_name;
  const isActive = admin.is_active !== false;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-br from-slate-50 via-white to-sky-50 shadow-sm">
        <div className="relative overflow-hidden px-6 py-8 sm:px-8">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-400/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-indigo-300/15 blur-3xl" />
          <div className="pointer-events-none absolute -top-24 right-1/3 h-56 w-56 rounded-full bg-white/60 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(59,130,246,0.06),transparent_55%)]" />

          <div className="relative flex flex-col items-center gap-6 sm:flex-row sm:items-center">
            <div className="relative shrink-0">
              <div className="rounded-full bg-linear-to-br from-sky-400 via-indigo-500 to-purple-500 p-[3px] shadow-lg shadow-indigo-500/30">
                <Avatar className="h-24 w-24 border-4 border-white">
                  <AvatarImage
                    src={admin.avatar ?? undefined}
                    alt={admin.name}
                  />
                  <AvatarFallback className="bg-slate-200 text-xl font-semibold text-slate-700">
                    {getInitials(admin.name)}
                  </AvatarFallback>
                </Avatar>
              </div>
              <button
                type="button"
                onClick={onEdit}
                title="Change photo"
                className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-700 shadow-lg ring-2 ring-white transition-all hover:scale-105 hover:text-indigo-600 active:scale-95"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="bg-linear-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-2xl font-bold tracking-tight text-transparent sm:text-3xl">
                  {admin.name}
                </h1>
                <StatusPill active={isActive} />
              </div>

              <p className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-slate-500 sm:justify-start">
                <Mail className="h-3.5 w-3.5" />
                {admin.email}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                {roleName && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-white/50 backdrop-blur-xl">
                    <ShieldCheck className="h-3 w-3 text-sky-500" />
                    {roleName}
                  </span>
                )}
                {userType && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-linear-to-r from-sky-100 to-indigo-100 px-3 py-1 text-xs font-medium capitalize text-indigo-700 ring-1 ring-indigo-200/70">
                    <UserCircle className="h-3 w-3" />
                    {userType}
                  </span>
                )}
              </div>

              <div className="mt-5 flex items-center justify-center gap-3 sm:justify-start">
                <Button
                  onClick={onEdit}
                  className="h-9 gap-1.5 rounded-xl bg-linear-to-r from-sky-500 to-indigo-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/40 active:scale-95"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    className="h-9 gap-1.5 rounded-xl border border-white/70 bg-white/70 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-white/50 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 active:scale-95"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mt-7 grid gap-3 border-t border-slate-200/70 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={Calendar}
              label="Member Since"
              value={formatDate(admin.created_at)}
            />
            <Stat icon={ShieldCheck} label="Role" value={roleName ?? "—"} />
            <Stat
              icon={UserCircle}
              label="User Type"
              value={userType ? capitalize(userType) : "—"}
            />
            <Stat
              icon={Activity}
              label="Status"
              value={isActive ? "Active" : "Inactive"}
            />
          </div>
        </div>
      </section>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-sm ring-1 ring-white/50 backdrop-blur-xl lg:col-span-2">
          <SectionTitle
            title="Account Information"
            description="Your registered account details"
          />
          <div className="divide-y divide-slate-200/70">
            <InfoRow icon={Mail} label="Email" value={admin.email} />
            <InfoRow icon={ShieldCheck} label="Role" value={roleName ?? "—"} />
            {userType && (
              <InfoRow
                icon={UserCircle}
                label="User Type"
                value={capitalize(userType)}
              />
            )}
            <InfoRow
              icon={Calendar}
              label="Member Since"
              value={formatDate(admin.created_at)}
            />
            <InfoRow
              icon={History}
              label="Last Updated"
              value={formatDate(admin.updated_at)}
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/70 bg-white/70 shadow-sm ring-1 ring-white/50 backdrop-blur-xl">
          <SectionTitle
            title="Quick Actions"
            description="Common things you can do"
          />
          <div className="p-3">
            <ActionRow
              icon={Pencil}
              label="Edit Profile"
              description="Update your name and photo"
              onClick={onEdit}
            />
            <ActionRow
              icon={LayoutDashboard}
              label="Go to Dashboard"
              description="Back to your overview"
              onClick={() => router.push("/dashboard")}
            />
            <ActionRow
              icon={Users}
              label="Manage Users"
              description="Admin & staff accounts"
              onClick={() => router.push("/dashboard/settings/system/users")}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default AccountProfileView;
