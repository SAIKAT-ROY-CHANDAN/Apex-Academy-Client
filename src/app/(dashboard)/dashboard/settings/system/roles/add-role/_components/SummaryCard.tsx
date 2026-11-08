"use client";

import { Check, CircleAlert, ShieldCheck, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { getCategoryColor, getCategoryIcon } from "./permission-labels";

type SummaryCategory = {
  key: string;
  label: string;
  selected: number;
  total: number;
};

type SummaryCardProps = {
  roleName: string;
  totalSelected: number;
  totalAvailable: number;
  categories: SummaryCategory[];
};

const SummaryCard = ({
  roleName,
  totalSelected,
  totalAvailable,
  categories,
}: SummaryCardProps) => {
  const percent =
    totalAvailable === 0
      ? 0
      : Math.round((totalSelected / totalAvailable) * 100);
  const completed = categories.filter(
    (c) => c.total > 0 && c.selected === c.total,
  ).length;
  const partial = categories.filter(
    (c) => c.selected > 0 && c.selected < c.total,
  ).length;

  return (
    <aside className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      {/* Accent header */}
      <div className="relative overflow-hidden bg-linear-to-br from-blue-600 via-blue-600 to-indigo-600 px-5 py-4 text-white">
        <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h3 className="text-sm font-semibold tracking-wide uppercase">
            Role Summary
          </h3>
        </div>
        <p className="relative mt-1 text-xs text-blue-100/90">
          Live preview of the role you are building
        </p>
      </div>

      <div className="space-y-5 p-5">
        {/* Role name preview */}
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Role Name
          </p>
          <p
            className={cn(
              "mt-1 truncate text-lg font-bold",
              roleName.trim()
                ? "text-foreground"
                : "text-muted-foreground/60 italic",
            )}
          >
            {roleName.trim() || "Untitled role"}
          </p>
        </div>

        {/* Overall progress */}
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Permissions
            </p>
            <p className="text-sm font-bold text-foreground tabular-nums">
              {totalSelected}
              <span className="text-xs font-medium text-muted-foreground">
                {" "}
                / {totalAvailable}
              </span>
            </p>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full bg-linear-to-r transition-all duration-500 ease-out",
                percent === 100
                  ? "from-emerald-500 to-emerald-400"
                  : "from-blue-600 to-indigo-500",
              )}
              style={{ width: `${percent}%` }}
            />
          </div>
          <p className="mt-1.5 text-right text-xs font-medium tabular-nums">
            <span
              className={
                percent === 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-blue-600 dark:text-blue-400"
              }
            >
              {percent}%
            </span>
            <span className="text-muted-foreground"> configured</span>
          </p>
        </div>

        {/* Category breakdown */}
        <div className="space-y-2.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Categories
          </p>
          {categories.length === 0 ? (
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 shrink-0 text-muted-foreground/60" />
              Loading permissions…
            </div>
          ) : (
            <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const colors = getCategoryColor(cat.key);
                const CatIcon = getCategoryIcon(cat.key);
                const catPercent =
                  cat.total === 0 ? 0 : (cat.selected / cat.total) * 100;
                const done = cat.total > 0 && cat.selected === cat.total;
                return (
                  <div
                    key={cat.key}
                    className="group flex items-center gap-2.5"
                  >
                    <div
                      className={cn(
                        "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1",
                        colors.bg,
                        colors.ring,
                      )}
                    >
                      <CatIcon className={cn("h-3.5 w-3.5", colors.text)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-xs font-medium text-foreground">
                          {cat.label}
                        </span>
                        <span className="shrink-0 text-[10px] font-medium text-muted-foreground tabular-nums">
                          {cat.selected}/{cat.total}
                        </span>
                      </div>
                      <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-300",
                            done ? "bg-emerald-500" : colors.dot,
                          )}
                          style={{ width: `${catPercent}%` }}
                        />
                      </div>
                    </div>
                    {done && (
                      <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status hint */}
        <div className="flex items-start gap-2 rounded-xl border border-border/80 bg-muted/40 px-3 py-2.5">
          {totalSelected === 0 ? (
            <>
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
              <p className="text-xs text-muted-foreground">
                Select at least one permission to create this role.
              </p>
            </>
          ) : (
            <>
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{completed}</span>{" "}
                {completed === 1 ? "category" : "categories"} fully granted
                {partial > 0 && (
                  <>
                    ,{" "}
                    <span className="font-medium text-foreground">
                      {partial}
                    </span>{" "}
                    {partial === 1 ? "is" : "are"} partial
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </div>
    </aside>
  );
};

export default SummaryCard;
