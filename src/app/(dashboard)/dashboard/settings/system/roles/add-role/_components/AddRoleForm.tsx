"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Shield, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { createRole, getAllPermissions } from "@/services/role";
import {
  type CreateRoleFormValues,
  createRoleValidation,
} from "@/validation/role/role.validation";
import { buildPermissionTree } from "./build-permission-tree";
import PermissionCategory from "./PermissionCategory";
import PermissionSearchHeader from "./PermissionSearchHeader";
import RoleInfoCard from "./RoleInfoCard";
import SubmitCard from "./SubmitCard";
import SummaryCard from "./SummaryCard";
import type { PermissionGroup, PermissionItem, SubGroup } from "./types";

const AddRoleForm = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );
  const [apiPermissions, setApiPermissions] = useState<PermissionItem[]>([]);
  const [isLoadingPermissions, setIsLoadingPermissions] = useState(true);

  // Fetch permissions from API on mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await getAllPermissions({role_name: "ADMIN"});
        if (response.success && Array.isArray(response.data)) {
          setApiPermissions(response.data);
        } else {
          toast.error("Failed to load permissions");
        }
      } catch {
        toast.error("Failed to load permissions");
      } finally {
        setIsLoadingPermissions(false);
      }
    };
    fetchPermissions();
  }, []);

  // Build permission tree from API data
  const permissionTree = useMemo(
    () => buildPermissionTree(apiPermissions),
    [apiPermissions],
  );

  // Compute total count for each category
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; selected: number }> = {};
    for (const group of permissionTree) {
      let total = 0;
      for (const sub of group.subGroups) {
        total += sub.permissions.length;
      }
      stats[group.key] = { total, selected: 0 };
    }
    return stats;
  }, [permissionTree]);

  // All permission IDs as a flat array
  const allPermissionIds = useMemo(
    () =>
      permissionTree.flatMap((g) =>
        g.subGroups.flatMap((s) => s.permissions.map((p) => p.id)),
      ),
    [permissionTree],
  );

  const form = useForm<CreateRoleFormValues>({
    resolver: zodResolver(createRoleValidation),
    defaultValues: {
      role_name: "",
      permissions: [],
    },
  });

  const roleName = form.watch("role_name");
  const selectedPermissions = form.watch("permissions");
  const selectedSet = useMemo(
    () => new Set(selectedPermissions),
    [selectedPermissions],
  );

  // Update category stats based on selected permissions
  const currentStats = useMemo(() => {
    const stats = { ...categoryStats };
    for (const group of permissionTree) {
      let selected = 0;
      for (const sub of group.subGroups) {
        for (const perm of sub.permissions) {
          if (selectedSet.has(perm.id)) selected++;
        }
      }
      stats[group.key] = { ...stats[group.key], selected };
    }
    return stats;
  }, [categoryStats, permissionTree, selectedSet]);

  const totalSelected = selectedPermissions.length;
  const totalAvailable = allPermissionIds.length;

  // Summary sidebar categories
  const summaryCategories = useMemo(
    () =>
      permissionTree.map((group) => ({
        key: group.key,
        label: group.label,
        ...currentStats[group.key],
      })),
    [permissionTree, currentStats],
  );

  // Filtered tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery.trim()) return permissionTree;
    const q = searchQuery.toLowerCase();
    return permissionTree
      .map((group) => ({
        ...group,
        subGroups: group.subGroups
          .map((sub) => ({
            ...sub,
            permissions: sub.permissions.filter(
              (p) =>
                p.key.toLowerCase().includes(q) ||
                p.value.toLowerCase().includes(q) ||
                sub.label.toLowerCase().includes(q) ||
                group.label.toLowerCase().includes(q),
            ),
          }))
          .filter((sub) => sub.permissions.length > 0),
      }))
      .filter((group) => group.subGroups.length > 0);
  }, [permissionTree, searchQuery]);

  // Toggle a single permission by ID
  const togglePermission = useCallback(
    (id: string) => {
      const current = form.getValues("permissions");
      if (selectedSet.has(id)) {
        form.setValue(
          "permissions",
          current.filter((p) => p !== id),
          { shouldValidate: true },
        );
      } else {
        form.setValue("permissions", [...current, id], {
          shouldValidate: true,
        });
      }
    },
    [form, selectedSet],
  );

  // Toggle all permissions in a sub-group
  const toggleSubGroup = useCallback(
    (sub: SubGroup) => {
      const current = form.getValues("permissions");
      const subIds = sub.permissions.map((p) => p.id);
      const allSelected = subIds.every((v) => selectedSet.has(v));
      if (allSelected) {
        form.setValue(
          "permissions",
          current.filter((p) => !subIds.includes(p)),
          { shouldValidate: true },
        );
      } else {
        const newPerms = [...current];
        for (const v of subIds) {
          if (!selectedSet.has(v)) newPerms.push(v);
        }
        form.setValue("permissions", newPerms, { shouldValidate: true });
      }
    },
    [form, selectedSet],
  );

  // Toggle all permissions in a category
  const toggleCategory = useCallback(
    (group: PermissionGroup) => {
      const current = form.getValues("permissions");
      const allIds = group.subGroups.flatMap((s) =>
        s.permissions.map((p) => p.id),
      );
      const allSelected = allIds.every((v) => selectedSet.has(v));
      if (allSelected) {
        form.setValue(
          "permissions",
          current.filter((p) => !allIds.includes(p)),
          { shouldValidate: true },
        );
      } else {
        const newPerms = [...current];
        for (const v of allIds) {
          if (!selectedSet.has(v)) newPerms.push(v);
        }
        form.setValue("permissions", newPerms, { shouldValidate: true });
      }
    },
    [form, selectedSet],
  );

  const toggleCategoryExpanded = useCallback((key: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const clearSearch = useCallback(() => setSearchQuery(""), []);

  const handleSelectAll = useCallback(() => {
    form.setValue("permissions", [...allPermissionIds], {
      shouldValidate: true,
    });
  }, [form, allPermissionIds]);

  const handleDeselectAll = useCallback(() => {
    form.setValue("permissions", [], { shouldValidate: true });
  }, [form]);

  const onSubmit = (data: CreateRoleFormValues) => {
    startTransition(async () => {
      const response = await createRole(data);
      if (!response.success) {
        toast.error(response.message ?? "Failed to create role");
        return;
      }
      toast.success(response.message ?? "Role created successfully");
      router.push("/dashboard/settings/system/roles");
    });
  };

  if (isLoadingPermissions) {
    return (
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        <div className="space-y-6">
          {/* Role info skeleton */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-start gap-4 p-6">
              <Skeleton className="h-11 w-11 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-3 w-72 max-w-full" />
              </div>
            </div>
            <div className="border-t border-border/70 px-6 py-5">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="mt-2 h-12 w-full max-w-lg rounded-xl" />
            </div>
          </section>

          {/* Permissions skeleton */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-64 max-w-full" />
              </div>
            </div>
            <Skeleton className="mt-6 h-1.5 w-full" />
            <div className="mt-6 space-y-3">
              {["perm-1", "perm-2", "perm-3", "perm-4"].map((key) => (
                <Skeleton key={key} className="h-14 w-full rounded-2xl" />
              ))}
            </div>
          </section>
        </div>

        {/* Summary skeleton */}
        <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:sticky lg:top-6">
          <div className="bg-linear-to-br from-blue-600 to-indigo-600 px-5 py-4">
            <Skeleton className="h-4 w-32 bg-white/25" />
            <Skeleton className="mt-2 h-3 w-44 bg-white/20" />
          </div>
          <div className="space-y-4 p-5">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-24" />
            {["sum-1", "sum-2", "sum-3"].map((key) => (
              <Skeleton key={key} className="h-8 w-full" />
            ))}
          </div>
        </aside>
      </div>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-6"
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
        {/* Main column */}
        <div className="flex min-w-0 flex-col gap-6">
          {/* Role Name */}
          <RoleInfoCard
            register={form.register}
            error={form.formState.errors.role_name?.message}
            roleName={roleName}
          />

          {/* Permissions Section */}
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
            <PermissionSearchHeader
              totalSelected={totalSelected}
              totalAvailable={totalAvailable}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onClearSearch={clearSearch}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
            />

            {/* Form error */}
            {form.formState.errors.permissions?.message && (
              <p className="mt-5 flex items-center gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-3.5 py-2.5 text-xs font-medium text-destructive">
                <ShieldAlert className="h-4 w-4 shrink-0" />
                {form.formState.errors.permissions.message}
              </p>
            )}

            {/* Permission Groups */}
            <Controller
              name="permissions"
              control={form.control}
              render={() => (
                <div className="mt-6 grid gap-4">
                  {filteredTree.map((group) => {
                    const stats = currentStats[group.key];
                    const isExpanded =
                      expandedCategories.has(group.key) || !!searchQuery;

                    return (
                      <PermissionCategory
                        key={group.key}
                        group={group}
                        stats={stats}
                        selectedSet={selectedSet}
                        isExpanded={isExpanded}
                        onToggleExpanded={() =>
                          toggleCategoryExpanded(group.key)
                        }
                        onToggleCategory={() => toggleCategory(group)}
                        onToggleSubGroup={toggleSubGroup}
                        onTogglePermission={togglePermission}
                      />
                    );
                  })}

                  {filteredTree.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-14 text-center">
                      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                        <Shield className="h-6 w-6 text-muted-foreground/50" />
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {searchQuery
                          ? "No permissions match your search"
                          : "No permissions available"}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {searchQuery
                          ? "Try a different keyword or clear the search"
                          : "Check back later or contact your administrator"}
                      </p>
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={clearSearch}
                          className="mt-3 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Clear search
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            />
          </section>
        </div>

        {/* Sticky summary sidebar */}
        <div className="lg:sticky lg:top-6">
          <SummaryCard
            roleName={roleName}
            totalSelected={totalSelected}
            totalAvailable={totalAvailable}
            categories={summaryCategories}
          />
        </div>
      </div>

      {/* Submit */}
      <SubmitCard
        isPending={isPending}
        roleName={roleName}
        totalSelected={totalSelected}
      />
    </form>
  );
};

export default AddRoleForm;
