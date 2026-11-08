"use client";

import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getPeriodSetting,
  type PeriodTime,
  updatePeriodSetting,
} from "@/services/periodSetting";
import { usePeriodSetting } from "./PeriodSettingProvider";
import {
  createPeriodRow,
  createPeriodRows,
  DEFAULT_PERIOD_COUNT,
  MAX_PERIODS,
  ordinal,
  type PeriodSettingFormValues,
} from "./period-settings";

type PeriodSettingsDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Turns a saved setting into editable rows. `period_count` is authoritative for
 * how many rows exist, but a periods array that is longer than the count (a
 * hand-edited row) must not lose its times.
 */
function toFormValues(setting: {
  period_count: number;
  periods: PeriodTime[] | null;
}): PeriodSettingFormValues {
  const saved = setting.periods ?? [];
  const count = Math.max(setting.period_count, saved.length, 1);
  return {
    periods: Array.from({ length: count }, (_, i) =>
      createPeriodRow(saved[i]?.startTime ?? "", saved[i]?.endTime ?? ""),
    ),
  };
}

export default function PeriodSettingsDialog({
  open,
  onOpenChange,
}: PeriodSettingsDialogProps) {
  const { refresh } = usePeriodSetting();

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [values, setValues] = useState<PeriodSettingFormValues>({
    periods: createPeriodRows(DEFAULT_PERIOD_COUNT),
  });
  const [error, setError] = useState<string | null>(null);

  // The period count is the row count - nothing separate to keep in sync.
  const periodCount = values.periods.length;
  const atMaxPeriods = periodCount >= MAX_PERIODS;

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const response = await getPeriodSetting();
      if (response?.success === false || !response?.data) {
        setLoadError(
          response?.message ??
            "Could not load period settings. Close this dialog and try again.",
        );
        return;
      }
      setValues(toFormValues(response.data));
      setError(null);
    } catch {
      setLoadError(
        "Could not load period settings. Close this dialog and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleAddPeriod = () => {
    if (values.periods.length >= MAX_PERIODS) return;
    setValues((prev) => ({
      periods: [
        ...prev.periods,
        // Seeding with the previous period's end time saves typing and keeps
        // the timetable contiguous.
        createPeriodRow(prev.periods[prev.periods.length - 1]?.endTime ?? ""),
      ],
    }));
    setError(null);
  };

  // Splicing renumbers the remaining rows implicitly: a row's number is its
  // position in the list. The last remaining row is never removed.
  const handleRemovePeriod = (index: number) => {
    if (values.periods.length <= 1) return;
    setValues((prev) => ({
      periods: prev.periods.filter((_, i) => i !== index),
    }));
    setError(null);
  };

  const handlePeriodTimeChange = (
    index: number,
    field: "startTime" | "endTime",
    value: string,
  ) => {
    setValues((prev) => ({
      periods: prev.periods.map((period, i) =>
        i === index ? { ...period, [field]: value } : period,
      ),
    }));
    setError(null);
  };

  const validate = (): string | null => {
    if (values.periods.length < 1) {
      return "At least one period is required";
    }
    if (values.periods.length > MAX_PERIODS) {
      return `Number of periods cannot exceed ${MAX_PERIODS}`;
    }

    const hasAnyTime = values.periods.some((p) => p.startTime || p.endTime);
    if (!hasAnyTime) return null;

    for (let i = 0; i < values.periods.length; i++) {
      const period = values.periods[i];
      const hasStart = Boolean(period.startTime);
      const hasEnd = Boolean(period.endTime);

      if (hasStart !== hasEnd) {
        return `${ordinal(i + 1)} period: provide both start and end time, or leave both empty`;
      }
      if (!hasStart) continue;
      if (period.endTime <= period.startTime) {
        return `${ordinal(i + 1)} period: end time must be after start time`;
      }

      const previous = values.periods[i - 1];
      if (
        previous?.startTime &&
        previous.endTime &&
        period.startTime < previous.endTime
      ) {
        return `${ordinal(i + 1)} period starts before the ${ordinal(i)} period ends (overlap)`;
      }
    }

    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const hasTimes = values.periods.some((p) => p.startTime && p.endTime);
      const response = await updatePeriodSetting({
        period_count: periodCount,
        // Times are optional: send an empty list when nothing is filled so a
        // previously saved timetable is not left behind, and the backend
        // derives period_count from the row count either way.
        periods: hasTimes
          ? values.periods.map((period, i) => ({
              periodNumber: i + 1,
              startTime: period.startTime,
              endTime: period.endTime,
            }))
          : [],
      });

      if (!response?.success) {
        toast.error(response?.message ?? "Failed to save period settings");
        return;
      }

      // Push the new column layout into every mounted grid immediately.
      await refresh();
      toast.success("Period settings updated");
      onOpenChange(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save period settings";
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] flex-col overflow-hidden rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-slate-900">
            Period Settings
          </DialogTitle>
          <DialogDescription>
            Add one row per period the institute runs each day, and optionally
            set the start and end time of each. Leave a period empty if it is a
            break. Changing this updates the Create and Edit routine grids.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : loadError ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-sm text-destructive">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              onClick={load}
              className="rounded-2xl"
            >
              Try again
            </Button>
          </div>
        ) : (
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <Label className="text-sm font-medium text-slate-900">
                  Periods ({periodCount})
                </Label>
                <p className="text-xs text-muted-foreground">
                  Times optional. Must not overlap, and each period must end
                  after it starts.
                </p>
              </div>

              {/* The list scrolls on its own so a long timetable never pushes
                  the footer buttons off screen. */}
              <div className="max-h-72 overflow-y-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50">
                    <tr>
                      <th className="w-24 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Period
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Start
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        End
                      </th>
                      <th className="w-16 px-4 py-2 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        <span className="sr-only">Remove</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {values.periods.map((period, index) => (
                      <tr key={period.id} className="border-t border-slate-100">
                        <td className="px-4 py-2 font-medium text-slate-700">
                          {ordinal(index + 1)}
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="time"
                            value={period.startTime}
                            onChange={(e) =>
                              handlePeriodTimeChange(
                                index,
                                "startTime",
                                e.target.value,
                              )
                            }
                            className="h-9 w-full rounded-xl"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            type="time"
                            value={period.endTime}
                            onChange={(e) =>
                              handlePeriodTimeChange(
                                index,
                                "endTime",
                                e.target.value,
                              )
                            }
                            className="h-9 w-full rounded-xl"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Remove ${ordinal(index + 1)} period`}
                            disabled={values.periods.length <= 1}
                            title={
                              values.periods.length <= 1
                                ? "At least one period is required"
                                : `Remove ${ordinal(index + 1)} period`
                            }
                            onClick={() => handleRemovePeriod(index)}
                            className="rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddPeriod}
                  disabled={atMaxPeriods}
                  className="rounded-2xl"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Period
                </Button>
                {atMaxPeriods ? (
                  <p className="text-xs text-muted-foreground">
                    A routine cannot have more than {MAX_PERIODS} periods.
                  </p>
                ) : null}
              </div>
            </div>

            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="rounded-2xl"
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            className="rounded-2xl"
            disabled={saving || loading || Boolean(loadError)}
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
