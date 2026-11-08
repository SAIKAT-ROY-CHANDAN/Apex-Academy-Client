"use client";

import { Loader2, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SubmitCardProps = {
  isPending: boolean;
  roleName?: string;
  totalSelected?: number;
};

const SubmitCard = ({
  isPending,
  roleName = "",
  totalSelected = 0,
}: SubmitCardProps) => {
  const router = useRouter();
  const hasRoleName = roleName.trim().length > 0;
  const hasPermissions = totalSelected > 0;
  const canSubmit = hasRoleName && hasPermissions && !isPending;

  return (
    <div className="sticky bottom-4 z-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-lg shadow-black/5 backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-center gap-3">
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-blue-600 to-indigo-600 text-white sm:flex">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              {roleName.trim() ? (
                <>
                  Create{" "}
                  <span className="text-blue-600 dark:text-blue-400">
                    "{roleName.trim()}"
                  </span>
                  ?
                </>
              ) : (
                "Ready to create this role?"
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {hasPermissions
                ? `${totalSelected} permission${totalSelected === 1 ? "" : "s"} will be granted to this role`
                : "Select at least one permission to continue"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
            className="h-11 gap-1.5 px-5"
          >
            <X className="h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!canSubmit}
            size="lg"
            className={cn(
              "h-11 min-w-44 gap-2 bg-linear-to-r from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-600/25 transition-all",
              "hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg hover:shadow-blue-600/30",
              "focus-visible:ring-2 focus-visible:ring-blue-500/40",
              "disabled:from-muted disabled:to-muted disabled:text-muted-foreground disabled:shadow-none",
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Role…
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Create Role
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubmitCard;
