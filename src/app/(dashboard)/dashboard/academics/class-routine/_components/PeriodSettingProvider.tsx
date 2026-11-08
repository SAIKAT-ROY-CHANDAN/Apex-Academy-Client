"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getPeriodSetting } from "@/services/periodSetting";
import { DEFAULT_PERIOD_COUNT } from "./period-settings";

type PeriodSettingContextValue = {
  /** Number of period columns to render, taken from the saved period_count. */
  periodCount: number;
  /** True until the first GET /period-setting settles. */
  loading: boolean;
  /** Set when the settings request fails; the UI must not silently use defaults. */
  error: string | null;
  /** Re-fetches the setting and pushes the new value into every mounted grid. */
  refresh: () => Promise<void>;
};

const PeriodSettingContext = createContext<PeriodSettingContextValue | null>(
  null,
);

export function PeriodSettingProvider({ children }: { children: ReactNode }) {
  const [periodCount, setPeriodCount] = useState(DEFAULT_PERIOD_COUNT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (isRefresh: boolean) => {
    // A refresh keeps the currently rendered columns in place until the new
    // values arrive, so an open grid does not flash or collapse.
    if (!isRefresh) setLoading(true);
    try {
      const response = await getPeriodSetting();
      if (response?.success === false || !response?.data) {
        // Never silently fall back to the default - the grid would then hide the
        // real timetable and could let an admin save a truncated routine.
        setError(
          response?.message ??
            "Could not load period settings. The routine grid cannot be displayed without them.",
        );
        return;
      }
      setPeriodCount(response.data.period_count);
      setError(null);
    } catch {
      setError(
        "Could not load period settings. The routine grid cannot be displayed without them.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  const refresh = useCallback(async () => {
    await load(true);
  }, [load]);

  const value = useMemo(
    () => ({ periodCount, loading, error, refresh }),
    [periodCount, loading, error, refresh],
  );

  return (
    <PeriodSettingContext.Provider value={value}>
      {children}
    </PeriodSettingContext.Provider>
  );
}

export function usePeriodSetting(): PeriodSettingContextValue {
  const ctx = useContext(PeriodSettingContext);
  if (!ctx) {
    throw new Error(
      "usePeriodSetting must be used within a PeriodSettingProvider",
    );
  }
  return ctx;
}
