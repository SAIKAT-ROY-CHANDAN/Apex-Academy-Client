"use client";

import { ListChecks, LockKeyhole, RotateCcw, Search, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PermissionSearchHeaderProps = {
  totalSelected: number;
  totalAvailable: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
};

const PermissionSearchHeader = ({
  totalSelected,
  totalAvailable,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onSelectAll,
  onDeselectAll,
}: PermissionSearchHeaderProps) => {
  const searchRef = useRef<HTMLInputElement>(null);
  const allSelected = totalAvailable > 0 && totalSelected === totalAvailable;
  const percent =
    totalAvailable === 0
      ? 0
      : Math.round((totalSelected / totalAvailable) * 100);

  // Press "/" anywhere to focus the search box
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest("input, textarea, select, [contenteditable]")) return;
      e.preventDefault();
      searchRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="space-y-5">
      {/* Header row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 ring-1 ring-indigo-100 dark:bg-indigo-950/30 dark:ring-indigo-900/40">
            <LockKeyhole className="h-5.5 w-5.5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Role Permissions
            </h3>
            <p className="mt-0.5 max-w-md text-sm text-muted-foreground">
              Assign granular permissions to control what this role can access.
              Grouped by category for quick configuration.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm transition-colors",
              percent === 100
                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900/50 dark:bg-emerald-950/30"
                : "border-border bg-muted/50",
            )}
          >
            <span
              className={cn(
                "text-base font-bold tabular-nums",
                percent === 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-foreground",
              )}
            >
              {totalSelected}
            </span>
            <span className="text-muted-foreground/60">/</span>
            <span className="font-medium text-muted-foreground">
              {totalAvailable}
            </span>
            <span className="ml-1 text-xs font-medium text-muted-foreground">
              ({percent}%)
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSelectAll}
            disabled={allSelected}
            className="h-8 gap-1.5 text-xs"
          >
            <ListChecks className="h-3.5 w-3.5" />
            Select All
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onDeselectAll}
            disabled={totalSelected === 0}
            className="h-8 gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Selection progress */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full bg-linear-to-r transition-all duration-500 ease-out",
              percent === 100
                ? "from-emerald-500 to-emerald-400"
                : "from-blue-600 to-sky-400",
            )}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          {percent === 100
            ? "All permissions granted"
            : `${percent}% configured`}
        </span>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={searchRef}
          type="text"
          placeholder="Search permissions, models or categories..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-16 text-sm text-foreground shadow-xs transition-all placeholder:text-muted-foreground focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        {searchQuery ? (
          <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1">
            <span className="hidden rounded-md bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-600 sm:inline dark:bg-blue-950/40 dark:text-blue-400">
              {totalSelected} selected
            </span>
            <button
              type="button"
              onClick={onClearSearch}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
            /
          </kbd>
        )}
      </div>
    </div>
  );
};

export default PermissionSearchHeader;
