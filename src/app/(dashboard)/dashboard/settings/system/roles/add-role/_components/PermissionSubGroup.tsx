"use client";

import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ACTION_LABELS, capitalCase, getActionIcon } from "./permission-labels";
import type { SubGroup } from "./types";

type PermissionSubGroupProps = {
  sub: SubGroup;
  selectedSet: Set<string>;
  onToggleSubGroup: (sub: SubGroup) => void;
  onTogglePermission: (id: string) => void;
};

const PermissionSubGroup = ({
  sub,
  selectedSet,
  onToggleSubGroup,
  onTogglePermission,
}: PermissionSubGroupProps) => {
  const subValues = sub.permissions.map((p) => p.id);
  const subSelectedCount = subValues.filter((v) => selectedSet.has(v)).length;
  const subFullySelected = subSelectedCount === subValues.length;
  const subPartiallySelected = subSelectedCount > 0 && !subFullySelected;

  return (
    <div className="px-4 py-3.5">
      {/* Sub-group header */}
      <div className="mb-2.5 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onToggleSubGroup(sub)}
          aria-label={`${subFullySelected ? "Deselect" : "Select"} all ${sub.label} permissions`}
          className={cn(
            "flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded border-2 transition-all duration-200",
            subFullySelected
              ? "border-primary bg-primary text-primary-foreground"
              : subPartiallySelected
                ? "border-primary bg-primary/15 text-primary"
                : "border-muted-foreground/40 bg-transparent hover:border-primary/60",
          )}
        >
          {subFullySelected && (
            <Check className="h-2.5 w-2.5" strokeWidth={3} />
          )}
          {subPartiallySelected && (
            <Minus className="h-2.5 w-2.5" strokeWidth={3} />
          )}
        </button>
        <span className="text-xs font-semibold text-foreground">
          {sub.label}
        </span>
        {subPartiallySelected && (
          <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
            {subSelectedCount}/{subValues.length}
          </span>
        )}
      </div>

      {/* Permission action buttons */}
      <div className="ml-7 flex flex-wrap gap-1.5">
        {sub.permissions.map((perm) => {
          const actionKey = perm.key.includes(".")
            ? (perm.key.split(".").pop() ?? perm.key)
            : perm.key;
          const ActionIcon = getActionIcon(actionKey);
          const isSelected = selectedSet.has(perm.id);
          return (
            <button
              key={perm.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onTogglePermission(perm.id)}
              className={cn(
                "group inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                isSelected
                  ? "border-primary/40 bg-linear-to-br from-primary/10 to-primary/5 text-primary shadow-sm"
                  : "border-border bg-background text-muted-foreground hover:-translate-y-px hover:border-muted-foreground/40 hover:bg-muted/40 hover:text-foreground",
              )}
            >
              <ActionIcon
                className={cn(
                  "h-3.5 w-3.5 transition-transform duration-200",
                  isSelected
                    ? "text-primary group-hover:scale-110"
                    : "text-muted-foreground/60 group-hover:text-foreground",
                )}
              />
              {ACTION_LABELS[actionKey] ?? capitalCase(actionKey)}
              {isSelected && (
                <span className="ml-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-primary/15">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionSubGroup;
