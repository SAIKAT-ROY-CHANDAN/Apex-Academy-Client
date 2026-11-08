"use client";

import { AlertTriangle, DoorOpen } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getPalette } from "../routine-data";
import type { TRoutineEntry } from "../types";

type ClassCardProps = {
  entry: TRoutineEntry;
  /** De-emphasised because the active filter does not match this class. */
  dimmed?: boolean;
  /** Rendered as a tighter block, for the narrow week columns. */
  compact?: boolean;
  /** A sibling class in the same day + period; shown with a warning icon. */
  hasConflict?: boolean;
};

/**
 * One class on the schedule.
 *
 *   line 1  subject name (bold)
 *   line 2  coloured badge: year - department (shortened, full text in tooltip)
 *   line 3  program, batch, section, shift - only the parts that are set
 *   line 4  room / lab - only when the admin set one for this slot
 *
 * The left bar and the badge share the class colour so the same class reads the
 * same everywhere, and the colour is always paired with the written label.
 *
 * The room line is part of the card, not an overlay, so it also lands in the
 * Print view (the whole week grid carries `routine-print-area`).
 */
export default function ClassCard({
  entry,
  dimmed = false,
  compact = false,
  hasConflict = false,
}: ClassCardProps) {
  const palette = getPalette(entry.colorIndex);

  const details = [
    entry.program,
    entry.batch,
    entry.section,
    entry.shift,
  ].filter(Boolean);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border pl-2.5 transition-opacity",
        palette.soft,
        palette.border,
        compact ? "py-1.5 pr-2" : "py-2 pr-2.5",
        dimmed && "opacity-30",
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 left-0 w-1", palette.bar)}
      />

      <div className="flex items-start gap-1">
        <p
          className={cn(
            "min-w-0 flex-1 font-semibold break-words",
            palette.text,
            compact ? "text-[0.8125rem] leading-tight" : "text-sm leading-snug",
          )}
        >
          {entry.subject}
        </p>

        {hasConflict ? (
          <Tooltip>
            <TooltipTrigger
              render={
                <button
                  type="button"
                  aria-label="Conflict: more than one class in this period"
                  className="mt-0.5 shrink-0 cursor-help text-amber-600 outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
                />
              }
            >
              <AlertTriangle className="h-3.5 w-3.5" />
            </TooltipTrigger>
            <TooltipContent>
              Conflict: more than one class in this period
            </TooltipContent>
          </Tooltip>
        ) : null}
      </div>

      <div className="mt-1">
        <Tooltip>
          <TooltipTrigger
            render={
              // A button so the full label is reachable by keyboard, not only
              // by hover. It carries no action, hence the reset styling.
              <button
                type="button"
                className={cn(
                  "inline-block max-w-full cursor-help rounded-md border px-1.5 py-0.5 text-left text-[0.6875rem] font-semibold break-words outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                  palette.border,
                  palette.text,
                )}
              />
            }
          >
            {entry.shortLabel}
          </TooltipTrigger>
          <TooltipContent>
            <p>{entry.classLabel}</p>
            {entry.roomNo ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Room {entry.roomNo}
              </p>
            ) : null}
          </TooltipContent>
        </Tooltip>
      </div>

      {details.length > 0 ? (
        <p className="mt-1 text-[0.6875rem] leading-tight break-words text-muted-foreground">
          {details.join(" · ")}
        </p>
      ) : null}

      {entry.roomNo ? (
        <p className="mt-1 inline-flex max-w-full items-center gap-1 text-[0.6875rem] font-medium leading-tight text-muted-foreground">
          <DoorOpen aria-hidden="true" className="h-3 w-3 shrink-0" />
          <span className="truncate">Room {entry.roomNo}</span>
        </p>
      ) : null}
    </div>
  );
}
