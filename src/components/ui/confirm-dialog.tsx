"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "default" | "destructive";
  isPending?: boolean;
  onConfirm: () => void;
}

function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default",
  isPending = false,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/10 transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0 supports-backdrop-filter:backdrop-blur-xs" />
        <DialogPrimitive.Popup
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg bg-popover p-6 text-popover-foreground shadow-lg ring-1 ring-foreground/10 duration-150 data-ending-style:opacity-0 data-ending-style:scale-95 data-starting-style:opacity-0 data-starting-style:scale-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
          )}
        >
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
            <div
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-full",
                variant === "destructive"
                  ? "bg-destructive/10"
                  : "bg-primary/10",
              )}
            >
              <AlertTriangle
                className={cn(
                  "h-6 w-6",
                  variant === "destructive"
                    ? "text-destructive"
                    : "text-primary",
                )}
              />
            </div>
            <div className="space-y-1">
              <DialogPrimitive.Title className="text-base font-semibold leading-none tracking-tight">
                {title}
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-sm text-muted-foreground">
                {description}
              </DialogPrimitive.Description>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <DialogPrimitive.Close
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  disabled={isPending}
                >
                  {cancelLabel}
                </Button>
              }
            />
            <Button
              type="button"
              variant={variant === "destructive" ? "destructive" : "default"}
              className="h-10"
              disabled={isPending}
              onClick={onConfirm}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {confirmLabel}...
                </>
              ) : (
                confirmLabel
              )}
            </Button>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

export { ConfirmDialog };
