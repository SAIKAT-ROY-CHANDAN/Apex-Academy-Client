"use client";

import { Check, ChevronDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import PermissionSubGroup from "./PermissionSubGroup";
import { getCategoryColor, getCategoryIcon } from "./permission-labels";
import type { PermissionGroup, SubGroup } from "./types";

type PermissionCategoryProps = {
  group: PermissionGroup;
  stats: { total: number; selected: number };
  selectedSet: Set<string>;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onToggleCategory: () => void;
  onToggleSubGroup: (sub: SubGroup) => void;
  onTogglePermission: (id: string) => void;
};

const PermissionCategory = ({
  group,
  stats,
  selectedSet,
  isExpanded,
  onToggleExpanded,
  onToggleCategory,
  onToggleSubGroup,
  onTogglePermission,
}: PermissionCategoryProps) => {
  const colors = getCategoryColor(group.key);
  const CategoryIcon = getCategoryIcon(group.key);
  const isFullySelected = stats.total > 0 && stats.selected === stats.total;
  const isPartiallySelected =
    stats.selected > 0 && stats.selected < stats.total;
  const isAnySelected = stats.selected > 0;
  const progress =
    stats.total === 0 ? 0 : Math.round((stats.selected / stats.total) * 100);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border transition-all duration-200",
        colors.border,
        isAnySelected &&
          !isFullySelected &&
          "shadow-[0_1px_0_0_rgba(0,0,0,0.02)]",
      )}
    >
      {/* Category Header */}
      <div className="relative">
        <button
          type="button"
          aria-expanded={isExpanded}
          onClick={onToggleExpanded}
          className={cn(
            "flex w-full cursor-pointer select-none items-center gap-3 py-3.5 pl-14 pr-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            colors.bg,
            isExpanded && !isFullySelected && "bg-background",
          )}
        >
          <div
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/90 ring-1 backdrop-blur-sm",
              colors.ring,
            )}
          >
            <CategoryIcon className={cn("h-4 w-4", colors.text)} />
          </div>

          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {group.label}
          </span>

          {/* Count badge */}
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums transition-colors",
              isFullySelected
                ? "bg-primary text-primary-foreground"
                : isPartiallySelected
                  ? cn("text-foreground", colors.bg)
                  : "bg-muted text-muted-foreground",
            )}
          >
            {stats.selected}
            <span
              className={
                isFullySelected ? "opacity-70" : "text-muted-foreground/50"
              }
            >
              /{stats.total}
            </span>
          </span>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
              !isExpanded && "-rotate-90",
            )}
          />
        </button>

        <button
          type="button"
          onClick={onToggleCategory}
          aria-label={`${isFullySelected ? "Deselect" : "Select"} ${group.label} category`}
          className={cn(
            "absolute left-4 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-md border-2 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            isFullySelected
              ? "border-primary bg-primary text-primary-foreground"
              : isPartiallySelected
                ? "border-primary bg-primary/15 text-primary"
                : "border-muted-foreground/40 bg-transparent hover:border-primary/60",
          )}
        >
          {isFullySelected && <Check className="h-3 w-3" strokeWidth={3} />}
          {isPartiallySelected && <Minus className="h-3 w-3" strokeWidth={3} />}
        </button>
      </div>

      {/* Category progress strip */}
      <div className="h-0.5 w-full bg-black/5 dark:bg-white/10">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out",
            colors.dot,
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Expanded Sub-Groups */}
      {isExpanded && (
        <div className="divide-y divide-border bg-card">
          {group.subGroups.map((sub) => (
            <PermissionSubGroup
              key={sub.key}
              sub={sub}
              selectedSet={selectedSet}
              onToggleSubGroup={onToggleSubGroup}
              onTogglePermission={onTogglePermission}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PermissionCategory;
