"use client";

import { useEffect, useState } from "react";
import type { AcademicSession } from "@/app/(dashboard)/dashboard/settings/system/session-config/_components/types/academic-session";
import { getAcademicSessions } from "@/services/academicSession";
import { getBatchDetails } from "@/services/batch";
import { getShifts } from "@/services/shift";
import type { Batch, Shift } from "../types/student";

export function useStudentFormData() {
  const [loading, setLoading] = useState(true);

  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sessions, setSessions] = useState<AcademicSession[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [shiftRes, sessionRes, batchRes] = await Promise.all([
          getShifts([]),
          getAcademicSessions(),
          getBatchDetails(),
        ]);

        setShifts(shiftRes?.data ?? []);
        setSessions(sessionRes?.data ?? []);
        setBatches(batchRes?.data ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  return {
    loading,
    shifts,
    sessions,
    batches,
  };
}
