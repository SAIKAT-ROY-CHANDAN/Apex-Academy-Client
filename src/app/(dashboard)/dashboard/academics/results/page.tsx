"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import type { TExamSchedule } from "@/app/(dashboard)/dashboard/academics/exam-schedule/_components/types/exam-schedule";
import { PageHeader } from "@/components/shared/page-header";
import { getDepartments } from "@/services/department";
import { getExamSchedules } from "@/services/examSchedule";
import { getPrograms } from "@/services/program";
import { getAllStudentExamResults } from "@/services/studentExamResult";
import ResultsFilters, {
  type ResultsFilterValues,
} from "./_components/ResultsFilters";
import ResultsTable from "./_components/ResultsTable";
import type {
  TDepartmentOption,
  TEnrichedResultRow,
  TProgramOption,
  TResultRow,
} from "./_components/types/result";

// Minimal schedule lookup used to resolve Program / Department for a result
// via its exam_schedule_id (schedules carry program & department relations).
type ScheduleLookup = Map<
  string,
  { program_id: string | null; department_id: string | null }
>;

const ResultsPage = () => {
  const [results, setResults] = useState<TResultRow[]>([]);
  const [programs, setPrograms] = useState<TProgramOption[]>([]);
  const [departments, setDepartments] = useState<TDepartmentOption[]>([]);
  const [scheduleLookup, setScheduleLookup] = useState<ScheduleLookup>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ResultsFilterValues>({
    programId: null,
    departmentId: null,
    year: null,
    subjectId: null,
    examId: null,
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const [resultsRes, programsRes, departmentsRes, schedulesRes] =
          await Promise.all([
            getAllStudentExamResults([{ label: "limit", value: "5000" }]),
            getPrograms([{ label: "limit", value: "1000" }]),
            getDepartments([{ label: "limit", value: "1000" }]),
            getExamSchedules([{ label: "limit", value: "5000" }]),
          ]);

        setResults((resultsRes?.data ?? []) as TResultRow[]);
        setPrograms((programsRes?.data ?? []) as TProgramOption[]);
        setDepartments((departmentsRes?.data ?? []) as TDepartmentOption[]);

        const lookup: ScheduleLookup = new Map();
        ((schedulesRes?.data ?? []) as TExamSchedule[]).forEach((schedule) => {
          if (!schedule?.id) return;
          lookup.set(schedule.id, {
            program_id: schedule.program_id ?? schedule.program?.id ?? null,
            department_id:
              schedule.department_id ?? schedule.department?.id ?? null,
          });
        });
        setScheduleLookup(lookup);
      } catch (error) {
        console.error("Error fetching results:", error);
        toast.error("Failed to fetch results");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Attach resolved Program / Department / Year / Subject / Exam info to every result row
  const enrichedRows = useMemo<TEnrichedResultRow[]>(() => {
    return results.map((row) => {
      const fromSchedule = row.exam_schedule_id
        ? scheduleLookup.get(row.exam_schedule_id)
        : undefined;

      const programId =
        row.examSchedule?.program_id ??
        row.examSchedule?.program?.id ??
        fromSchedule?.program_id ??
        null;
      const departmentId =
        row.examSchedule?.department_id ??
        row.examSchedule?.department?.id ??
        fromSchedule?.department_id ??
        null;

      const programName =
        programs.find((program) => String(program.id) === String(programId))
          ?.program_name ??
        row.examSchedule?.program?.program_name ??
        "—";
      const departmentName =
        departments.find(
          (department) => String(department.id) === String(departmentId),
        )?.department_name ??
        row.examSchedule?.department?.department_name ??
        "—";

      // Year from examSchedule.year (numeric) — matches AcademicClass year_level
      const rawYear =
        (row.examSchedule as any)?.year ??
        (row.examSchedule as any)?.examConfig?.year ??
        null;
      const resolvedYear = rawYear != null ? String(rawYear) : null;

      const resolvedSubjectId =
        (row.examSchedule as any)?.subject?.id ??
        (row.examSchedule as any)?.subjectId ??
        null;
      const resolvedExamId =
        (row.examSchedule as any)?.examConfig?.id ??
        (row.examSchedule as any)?.examConfigId ??
        (row.examSchedule as any)?.exam_config_id ??
        null;

      return {
        ...row,
        resolvedProgramId: programId,
        resolvedDepartmentId: departmentId,
        resolvedYear,
        resolvedSubjectId,
        resolvedExamId,
        programName,
        departmentName,
      };
    });
  }, [results, programs, departments, scheduleLookup]);

  // Cascading Program -> Department -> Year -> Subject + Exam (AND logic, same as exam-schedule)
  const filteredRows = useMemo(() => {
    return enrichedRows.filter((row) => {
      if (filters.programId && String(row.resolvedProgramId) !== String(filters.programId))
        return false;
      if (
        filters.departmentId &&
        String(row.resolvedDepartmentId) !== String(filters.departmentId)
      ) {
        return false;
      }
      if (filters.year && String(row.resolvedYear) !== String(filters.year)) return false;
      if (filters.subjectId && String(row.resolvedSubjectId) !== String(filters.subjectId))
        return false;
      if (filters.examId && String(row.resolvedExamId) !== String(filters.examId)) return false;
      return true;
    });
  }, [enrichedRows, filters]);

  return (
    <div className="space-y-6">
      <PageHeader title="Results" backHref="/dashboard/academics" />

      <ResultsFilters
        programs={programs}
        departments={departments}
        loading={loading}
        onFilterChange={setFilters}
      />

      <ResultsTable rows={filteredRows} loading={loading} />
    </div>
  );
};

export default ResultsPage;
